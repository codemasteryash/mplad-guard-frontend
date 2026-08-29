import {
  STATES,
  IMPLEMENTING_AGENCIES,
  WORK_CATEGORIES,
  ANOMALY_TYPES,
  PROJECT_STATUSES,
  COMPLAINT_CATEGORIES,
} from "./reference";
import { createSeededRandom } from "../utils/seededRandom";
import { riskLevelFromScore } from "../utils/format";

// ---------------------------------------------------------------------------
// NOTE FOR INTEGRATION: everything in this file is a stand-in for the real
// FastAPI anomaly-detection / risk-scoring service. `getScorecardForProject`
// is the single function to swap for a real API call — its return shape is
// the "contract" the rest of the UI depends on. See src/services/api.js.
// ---------------------------------------------------------------------------

const YEAR_POOL = [2022, 2023, 2024, 2025];

function pad(num, len) {
  return String(num).padStart(len, "0");
}

function randomDateBetween(rand, startYear, endYear) {
  const y = rand.int(startYear, endYear);
  const m = rand.int(1, 12);
  const d = rand.int(1, 28);
  return `${y}-${pad(m, 2)}-${pad(d, 2)}`;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function buildScoreBreakdown(rand, statusBias) {
  const base = () => Math.min(98, Math.max(2, Math.round(rand.next() * 60 + statusBias * rand.next() * 40)));
  return {
    financial: base(),
    delay: base(),
    resource: base(),
    geo: base(),
    document: base(),
  };
}

function buildAnomalies(rand, breakdown, projectId) {
  const anomalies = [];
  let counter = 1;
  ANOMALY_TYPES.forEach((type) => {
    const score = breakdown[type.key];
    if (score >= 55) {
      const statusPick = score >= 80 ? ["Open", "Open", "Under Review"] : ["Open", "Under Review", "Resolved"];
      anomalies.push({
        anomalyId: `ANM-${projectId.split("/").pop()}-${pad(counter, 2)}`,
        type: type.key,
        typeLabel: type.label,
        description: rand.pick(type.sample),
        riskPercentage: score,
        detectedOn: randomDateBetween(rand, 2024, 2025),
        status: rand.pick(statusPick),
      });
      counter += 1;
    }
  });
  return anomalies.sort((a, b) => b.riskPercentage - a.riskPercentage);
}

function generateProject(index) {
  const rand = createSeededRandom(`project-${index}`);
  const state = rand.pick(STATES);
  const district = rand.pick(state.districts);
  const category = rand.pick(WORK_CATEGORIES);
  const ia = rand.pick(IMPLEMENTING_AGENCIES);
  const year = rand.pick(YEAR_POOL);
  const amountAllocated = rand.pick([1200000, 1500000, 1800000, 2000000, 2200000, 2500000, 3000000, 3500000, 4000000]);

  const startDate = randomDateBetween(rand, year, year);
  const durationMonths = rand.int(6, 14);
  const endDate = addMonths(startDate, durationMonths);

  const statusRoll = rand.next();
  let status = "Work in Progress";
  if (statusRoll < 0.12) status = "Recommended";
  else if (statusRoll < 0.28) status = "Sanctioned";
  else if (statusRoll < 0.62) status = "Work in Progress";
  else if (statusRoll < 0.85) status = "Completed";
  else status = "Delayed";

  const progressPercent =
    status === "Recommended" || status === "Sanctioned"
      ? rand.int(0, 10)
      : status === "Completed"
      ? 100
      : status === "Delayed"
      ? rand.int(10, 45)
      : rand.int(20, 90);

  // Expenditure that sometimes deliberately outpaces progress — this is the
  // core "progress vs expenditure" anomaly signal the AI service looks for.
  const mismatchRoll = rand.next();
  const expenditurePercent =
    mismatchRoll > 0.78
      ? Math.min(100, progressPercent + rand.int(20, 45))
      : Math.max(0, progressPercent - rand.int(0, 10));

  const statusBias = status === "Delayed" ? 0.55 : mismatchRoll > 0.78 ? 0.5 : 0.15;
  const breakdown = buildScoreBreakdown(rand, statusBias);
  const riskScore = Math.round(
    breakdown.financial * 0.3 +
      breakdown.delay * 0.2 +
      breakdown.resource * 0.2 +
      breakdown.geo * 0.15 +
      breakdown.document * 0.15
  );

  const districtCode = district.code;
  const projectId = `MP/${year}/${pad(index + 1, 5)}`;
  const anomalies = buildAnomalies(rand, breakdown, projectId);

  return {
    id: projectId,
    projectId,
    year,
    state: state.name,
    stateCode: state.code,
    district: district.name,
    districtCode,
    pincode: district.pincode,
    assignedIA: ia,
    description: category.label,
    sector: category.sector,
    amountAllocated,
    startDate,
    endDate,
    status,
    progressPercent,
    expenditurePercent,
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
    breakdown,
    anomalies,
    anomalyCount: anomalies.length,
    recommendingMP: `Hon'ble MP, ${state.name}`,
  };
}

const TOTAL_MOCK_PROJECTS = 620;

let _cache = null;
export function getAllProjects() {
  if (_cache) return _cache;
  _cache = Array.from({ length: TOTAL_MOCK_PROJECTS }, (_, i) => generateProject(i));
  return _cache;
}

export function getProjectById(id) {
  return getAllProjects().find((p) => p.id === id || p.projectId === id);
}

export function getProjectsByState(stateName) {
  return getAllProjects().filter((p) => p.state === stateName);
}

export function getProjectsByDistrictCode(districtCode) {
  return getAllProjects().filter((p) => p.districtCode === districtCode);
}

export function getStateRiskSummary() {
  const projects = getAllProjects();
  const map = {};
  STATES.forEach((s) => {
    map[s.name] = { state: s.name, count: 0, totalRisk: 0, high: 0, medium: 0, low: 0, allocated: 0 };
  });
  projects.forEach((p) => {
    const bucket = map[p.state];
    if (!bucket) return;
    bucket.count += 1;
    bucket.totalRisk += p.riskScore;
    bucket.allocated += p.amountAllocated;
    if (p.riskLevel === "High") bucket.high += 1;
    else if (p.riskLevel === "Medium") bucket.medium += 1;
    else bucket.low += 1;
  });
  Object.values(map).forEach((bucket) => {
    bucket.avgRisk = bucket.count ? Math.round(bucket.totalRisk / bucket.count) : 0;
    bucket.riskLevel = riskLevelFromScore(bucket.avgRisk);
  });
  return map;
}

export function getSummaryStats(projects) {
  const total = projects.length;
  const allocated = projects.reduce((sum, p) => sum + p.amountAllocated, 0);
  const expenditure = projects.reduce((sum, p) => sum + p.amountAllocated * (p.expenditurePercent / 100), 0);
  const high = projects.filter((p) => p.riskLevel === "High").length;
  const medium = projects.filter((p) => p.riskLevel === "Medium").length;
  const low = projects.filter((p) => p.riskLevel === "Low").length;
  const anomalies = projects.reduce((sum, p) => sum + p.anomalyCount, 0);
  const avgRisk = total ? Math.round(projects.reduce((s, p) => s + p.riskScore, 0) / total) : 0;
  return { total, allocated, expenditure, high, medium, low, anomalies, avgRisk };
}

export { STATES, IMPLEMENTING_AGENCIES, WORK_CATEGORIES, PROJECT_STATUSES, COMPLAINT_CATEGORIES };

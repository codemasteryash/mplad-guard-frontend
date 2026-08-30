import { STATES, getProjectsByDistrictCode, getSummaryStats } from "./mockData";
import { createSeededRandom } from "../utils/seededRandom";
import { riskLevelFromScore } from "../utils/format";

const ANNUAL_ENTITLEMENT = 50000000; // ₹5 Cr/year per MP, real MPLADS norm
const YEARS_ACTIVE = 4; // matches YEAR_POOL span in mockData.js (2022–2025)

const FIRST_NAMES = [
  "Rajesh", "Anita", "Suresh", "Meena", "Vikram", "Sunita", "Ramesh", "Kavita",
  "Arun", "Pooja", "Deepak", "Neha", "Ashok", "Rekha", "Sanjay", "Geeta",
  "Manoj", "Shalini", "Vinod", "Priya", "Ravi", "Anju", "Prakash", "Lata",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Yadav", "Reddy", "Gupta", "Iyer", "Nair", "Singh",
  "Patel", "Mehta", "Rao", "Chauhan", "Joshi", "Kulkarni", "Bhatt", "Menon",
];

function generateMpName(seedKey) {
  const rand = createSeededRandom(seedKey);
  return `${rand.pick(FIRST_NAMES)} ${rand.pick(LAST_NAMES)}`;
}

let _rosterCache = null;

/** One entry per district, treated as one Parliamentary Constituency. */
export function getMpRoster() {
  if (_rosterCache) return _rosterCache;

  const roster = [];
  STATES.forEach((state) => {
    state.districts.forEach((district) => {
      const rand = createSeededRandom(`sna-mp-${district.code}`);
      const projects = getProjectsByDistrictCode(district.code);
      const stats = getSummaryStats(projects);

      const allocatedAmount = ANNUAL_ENTITLEMENT * YEARS_ACTIVE;
      const releasedFraction = rand.next() * 0.25 + 0.7; // 70–95% released by SNA
      const releasedAmount = Math.round(allocatedAmount * releasedFraction);
      const rawUtilized = Math.round(stats.expenditure);
      const utilizedAmount = Math.min(rawUtilized, releasedAmount);
      const remainingAmount = releasedAmount - utilizedAmount;

      roster.push({
        mpId: `MP-${district.code}`,
        name: generateMpName(`sna-mp-name-${district.code}`),
        house: "Lok Sabha",
        state: state.name,
        stateCode: state.code,
        constituency: `${district.name}`,
        district: district.name,
        districtCode: district.code,
        allocatedAmount,
        releasedAmount,
        utilizedAmount,
        remainingAmount,
        utilizationPct: releasedAmount ? Math.round((utilizedAmount / releasedAmount) * 100) : 0,
        activeProjects: projects.filter((p) => ["Work in Progress", "Sanctioned"].includes(p.status)).length,
        completedProjects: projects.filter((p) => p.status === "Completed").length,
        totalProjects: projects.length,
        riskLevel: riskLevelFromScore(stats.avgRisk),
        avgRisk: stats.avgRisk,
        anomalies: stats.anomalies,
      });
    });
  });

  _rosterCache = roster;
  return roster;
}

export function getMpRosterByState(stateName) {
  return getMpRoster().filter((m) => m.state === stateName);
}

export function getStateFundSummary(stateName) {
  const roster = getMpRosterByState(stateName);
  const allocated = roster.reduce((s, m) => s + m.allocatedAmount, 0);
  const released = roster.reduce((s, m) => s + m.releasedAmount, 0);
  const utilized = roster.reduce((s, m) => s + m.utilizedAmount, 0);
  const remaining = released - utilized;
  const activeProjects = roster.reduce((s, m) => s + m.activeProjects, 0);
  const atRiskProjects = roster.filter((m) => m.riskLevel !== "Low").reduce((s, m) => s + m.totalProjects, 0);
  const delayedProjects = STATES.find((s) => s.name === stateName)
    ? roster.reduce((s, m) => {
        const projects = getProjectsByDistrictCode(m.districtCode);
        return s + projects.filter((p) => p.status === "Delayed").length;
      }, 0)
    : 0;
  const pendingApprovals = roster.reduce((s, m) => {
    const projects = getProjectsByDistrictCode(m.districtCode);
    return s + projects.filter((p) => p.status === "Recommended").length;
  }, 0);

  return {
    state: stateName,
    allocated,
    released,
    utilized,
    remaining,
    mpCount: roster.length,
    activeProjects,
    atRiskProjects,
    delayedProjects,
    pendingApprovals,
  };
}

export function getSnaAlerts(stateName) {
  const roster = getMpRosterByState(stateName);
  const rand = createSeededRandom(`sna-alerts-${stateName}`);
  const alerts = [];

  roster.forEach((m) => {
    if (m.utilizationPct < 30 && m.releasedAmount > 0) {
      alerts.push({
        id: `SNA-ALT-${m.mpId}-UTIL`,
        severity: "High",
        title: "Unusually low fund utilization",
        message: `${m.constituency} constituency has utilized only ${m.utilizationPct}% of released funds.`,
        location: `${m.constituency}, ${m.state}`,
        mpId: m.mpId,
        districtCode: m.districtCode,
        date: `${2025 - rand.int(0, 1)}-${String(rand.int(1, 12)).padStart(2, "0")}-01`,
      });
    } else if (m.utilizationPct < 55) {
      alerts.push({
        id: `SNA-ALT-${m.mpId}-SLOW`,
        severity: "Medium",
        title: "Slow fund utilization",
        message: `₹${(m.remainingAmount / 10000000).toFixed(1)} Cr remains unutilized in ${m.constituency} for an extended period.`,
        location: `${m.constituency}, ${m.state}`,
        mpId: m.mpId,
        districtCode: m.districtCode,
        date: `${2025 - rand.int(0, 1)}-${String(rand.int(1, 12)).padStart(2, "0")}-01`,
      });
    }

    if (m.anomalies >= 6) {
      alerts.push({
        id: `SNA-ALT-${m.mpId}-ANOM`,
        severity: "High",
        title: "Multiple expenditure anomalies detected",
        message: `${m.anomalies} AI-flagged anomalies detected across projects in ${m.constituency}.`,
        location: `${m.constituency}, ${m.state}`,
        mpId: m.mpId,
        districtCode: m.districtCode,
        date: `${2025 - rand.int(0, 1)}-${String(rand.int(1, 12)).padStart(2, "0")}-01`,
      });
    }

    if (m.completedProjects > 0 && m.totalProjects > 0 && m.completedProjects / m.totalProjects < 0.15) {
      alerts.push({
        id: `SNA-ALT-${m.mpId}-COMPL`,
        severity: "Medium",
        title: "Project completion rate below expected threshold",
        message: `Only ${m.completedProjects} of ${m.totalProjects} projects completed in ${m.constituency}.`,
        location: `${m.constituency}, ${m.state}`,
        mpId: m.mpId,
        districtCode: m.districtCode,
        date: `${2025 - rand.int(0, 1)}-${String(rand.int(1, 12)).padStart(2, "0")}-01`,
      });
    }
  });

  return alerts.sort((a, b) => (a.severity === "High" ? -1 : 1) - (b.severity === "High" ? -1 : 1));
}

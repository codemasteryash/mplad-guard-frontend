import { createSeededRandom } from "../utils/seededRandom";


export const VERIFICATION_STATUSES = ["Not Verified", "Pending Review", "Verified", "Flagged"];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getBaselineHistory(project) {
  const rand = createSeededRandom(`verification-history-${project.id}`);
  const checkpoints = 4;
  const startMs = new Date(project.startDate).getTime();
  const endMs = Math.min(Date.now(), new Date(project.endDate).getTime());
  const span = Math.max(endMs - startMs, 1000 * 60 * 60 * 24 * 30);

  const progressHistory = [];
  const expenditureHistory = [];

  for (let i = 1; i <= checkpoints; i++) {
    const fraction = i / (checkpoints + 1);
    const date = new Date(startMs + span * fraction).toISOString().slice(0, 10);
    const noise = rand.int(-5, 5);
    const progressPoint = Math.max(0, Math.min(project.progressPercent, Math.round(project.progressPercent * fraction) + noise));
    const expenditurePoint = Math.max(0, Math.min(project.expenditurePercent, Math.round(project.expenditurePercent * fraction) + noise));
    progressHistory.push({ date, value: progressPoint });
    expenditureHistory.push({ date, value: expenditurePoint });
  }

  progressHistory.push({ date: addDays(project.startDate, Math.round(span / (1000 * 60 * 60 * 24))), value: project.progressPercent });
  expenditureHistory.push({ date: addDays(project.startDate, Math.round(span / (1000 * 60 * 60 * 24))), value: project.expenditurePercent });

  return { progressHistory, expenditureHistory };
}

export function defaultVerificationStatus(project) {
  if (project.riskLevel === "High") return "Pending Review";
  return "Not Verified";
}

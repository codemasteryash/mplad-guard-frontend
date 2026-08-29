import { getAllProjects } from "./mockData";
import { createSeededRandom } from "../utils/seededRandom";

function severityFromRisk(pct) {
  if (pct >= 80) return "High";
  if (pct >= 65) return "Medium";
  return "Low";
}

function hoursAgoToISO(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

let _cache = null;

export function getAllAlerts() {
  if (_cache) return _cache;

  const projects = getAllProjects()
    .filter((p) => p.anomalies.length > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 90);

  const alerts = [];
  projects.forEach((p, pIndex) => {
    p.anomalies.slice(0, 2).forEach((a, aIndex) => {
      const rand = createSeededRandom(`alert-${a.anomalyId}`);
      alerts.push({
        id: `ALT-${a.anomalyId}`,
        projectId: p.id,
        projectDescription: p.description,
        district: p.district,
        state: p.state,
        severity: severityFromRisk(a.riskPercentage),
        typeLabel: a.typeLabel,
        title: `${a.typeLabel} flagged`,
        message: `${a.description} — Project ${p.projectId} (${p.district}).`,
        timestamp: hoursAgoToISO(rand.int(1, 24 * 14) + pIndex + aIndex),
        status: a.status,
      });
    });
  });

  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  _cache = alerts;
  return alerts;
}

export function getAlertStats() {
  const alerts = getAllAlerts();
  return {
    total: alerts.length,
    high: alerts.filter((a) => a.severity === "High").length,
    medium: alerts.filter((a) => a.severity === "Medium").length,
    low: alerts.filter((a) => a.severity === "Low").length,
    resolved: alerts.filter((a) => a.status === "Resolved").length,
  };
}
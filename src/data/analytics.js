import { getAllProjects } from "./mockData";

export function getStateRiskBarData(topN = 10) {
  const projects = getAllProjects();
  const map = {};
  projects.forEach((p) => {
    if (!map[p.state]) map[p.state] = { state: p.state, Low: 0, Medium: 0, High: 0 };
    map[p.state][p.riskLevel] += 1;
  });
  return Object.values(map)
    .sort((a, b) => b.Low + b.Medium + b.High - (a.Low + a.Medium + a.High))
    .slice(0, topN);
}

export function getStatusDistribution() {
  const projects = getAllProjects();
  const map = {};
  projects.forEach((p) => {
    map[p.status] = (map[p.status] || 0) + 1;
  });
  return Object.entries(map).map(([status, count]) => ({ status, count }));
}

export function getYearlyFinancials() {
  const projects = getAllProjects();
  const map = {};
  projects.forEach((p) => {
    if (!map[p.year]) map[p.year] = { year: p.year, allocated: 0, expenditure: 0 };
    map[p.year].allocated += p.amountAllocated;
    map[p.year].expenditure += p.amountAllocated * (p.expenditurePercent / 100);
  });
  return Object.values(map).sort((a, b) => a.year - b.year);
}

export function getAnomalyTypeFrequency() {
  const projects = getAllProjects();
  const labels = {
    financial: "Financial",
    delay: "Time Delay",
    resource: "Resource Use",
    geo: "Geo-tag",
    document: "Document",
  };
  const map = { financial: 0, delay: 0, resource: 0, geo: 0, document: 0 };
  projects.forEach((p) => {
    p.anomalies.forEach((a) => {
      map[a.type] = (map[a.type] || 0) + 1;
    });
  });
  return Object.entries(map).map(([key, count]) => ({ type: labels[key] || key, count }));
}

export function getTopRiskProjects(limit = 8) {
  return [...getAllProjects()].sort((a, b) => b.riskScore - a.riskScore).slice(0, limit);
}
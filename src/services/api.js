// ---------------------------------------------------------------------------
// INTEGRATION LAYER
//
// Every screen in this app calls functions from this file instead of talking
// to mock data directly. Right now each function resolves from local mock
// data (with a small artificial delay to feel like a real network call).
//
// To wire up the real backend once it's ready:
//   1. Set VITE_API_BASE_URL (Node/Express) and VITE_AI_API_BASE_URL
//      (FastAPI) in a .env file.
//   2. Flip USE_MOCKS to false below (or per-function, if the backend
//      team ships endpoints one at a time).
//   3. Keep the same return shape each function currently resolves with —
//      every component already expects that shape, so nothing above this
//      file needs to change.
// ---------------------------------------------------------------------------

import axios from "axios";
import {
  getAllProjects,
  getProjectById,
  getStateRiskSummary,
  getSummaryStats,
} from "../data/mockData";

const USE_MOCKS = true;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

export const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
});

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * List + filter projects.
 * Real endpoint (suggested): GET /api/projects?state=&district=&status=&risk=&page=
 */
export async function fetchProjects(filters = {}) {
  if (USE_MOCKS) {
    await delay();
    let data = getAllProjects();
    if (filters.state) data = data.filter((p) => p.state === filters.state);
    if (filters.districtCode) data = data.filter((p) => p.districtCode === filters.districtCode);
    if (filters.status) data = data.filter((p) => p.status === filters.status);
    if (filters.riskLevel) data = data.filter((p) => p.riskLevel === filters.riskLevel);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.districtCode.includes(q)
      );
    }
    return data;
  }
  const { data } = await apiClient.get("/projects", { params: filters });
  return data;
}

/**
 * Real endpoint (suggested): GET /api/projects/:id
 */
export async function fetchProjectById(id) {
  if (USE_MOCKS) {
    await delay(250);
    return getProjectById(id) || null;
  }
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
}

/**
 * The AI risk scorecard for a project — this is the one the FastAPI /
 * ML teammates will own end to end.
 * Real endpoint (suggested): GET {AI_API}/score/:projectId
 * Expected shape: { riskScore, riskLevel, breakdown: {financial, delay,
 * resource, geo, document}, anomalies: [{anomalyId, typeLabel, description,
 * riskPercentage, detectedOn, status}] }
 */
export async function fetchRiskScorecard(projectId) {
  if (USE_MOCKS) {
    await delay(300);
    const project = getProjectById(projectId);
    if (!project) return null;
    return {
      riskScore: project.riskScore,
      riskLevel: project.riskLevel,
      breakdown: project.breakdown,
      anomalies: project.anomalies,
    };
  }
  const { data } = await aiClient.get(`/score/${projectId}`);
  return data;
}

/**
 * Real endpoint (suggested): GET /api/analytics/state-risk
 */
export async function fetchStateRiskSummary() {
  if (USE_MOCKS) {
    await delay(300);
    return getStateRiskSummary();
  }
  const { data } = await apiClient.get("/analytics/state-risk");
  return data;
}

/**
 * Real endpoint (suggested): GET /api/analytics/summary
 */
export async function fetchSummaryStats(filters = {}) {
  const projects = await fetchProjects(filters);
  return getSummaryStats(projects);
}

/**
 * Real endpoint (suggested): POST /api/recommendations
 */
export async function submitRecommendation(payload) {
  if (USE_MOCKS) {
    await delay(500);
    return { success: true, id: `REC-${Date.now()}`, ...payload };
  }
  const { data } = await apiClient.post("/recommendations", payload);
  return data;
}

/**
 * Real endpoint (suggested): POST /api/complaints (multipart/form-data for files)
 */
export async function submitComplaint(payload) {
  if (USE_MOCKS) {
    await delay(500);
    return { success: true, complaintId: `CMP-${Date.now()}`, ...payload };
  }
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "files" && Array.isArray(value)) {
      value.forEach((file) => form.append("files", file));
    } else {
      form.append(key, value);
    }
  });
  const { data } = await apiClient.post("/complaints", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

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
  getProjectsByDistrictCode,
  assignImplementingAgency as assignIAInData,
} from "../data/mockData";
import { getStateFundSummary, getMpRosterByState, getSnaAlerts } from "../data/snaData";
import { getDistrictSummary, IDA_AGENCY_OPTIONS } from "../data/idaData";

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

// ---------------------------------------------------------------------------
// SNA (State Nodal Agency) — placeholder service methods.
// Backed by src/data/snaData.js today; swap the body for a real API call
// once the Node backend exposes these endpoints. Return shapes match what
// src/pages/sna/* already consume.
// ---------------------------------------------------------------------------

/** Real endpoint (suggested): GET /api/sna/dashboard?state= */
export async function getSnaDashboard(state) {
  if (USE_MOCKS) {
    await delay(300);
    return getStateFundSummary(state);
  }
  const { data } = await apiClient.get("/sna/dashboard", { params: { state } });
  return data;
}

/** Real endpoint (suggested): GET /api/sna/state-fund-allocation?state= */
export async function getStateFundAllocation(state) {
  if (USE_MOCKS) {
    await delay(300);
    return getStateFundSummary(state);
  }
  const { data } = await apiClient.get("/sna/state-fund-allocation", { params: { state } });
  return data;
}

/** Real endpoint (suggested): GET /api/sna/mp-fund-allocation?state= */
export async function getMpFundAllocation(state) {
  if (USE_MOCKS) {
    await delay(300);
    return getMpRosterByState(state);
  }
  const { data } = await apiClient.get("/sna/mp-fund-allocation", { params: { state } });
  return data;
}

/** Real endpoint (suggested): GET /api/sna/district-fund-allocation?state= */
export async function getDistrictFundAllocation(state) {
  if (USE_MOCKS) {
    await delay(300);
    return getMpRosterByState(state); // 1:1 district/constituency in this prototype
  }
  const { data } = await apiClient.get("/sna/district-fund-allocation", { params: { state } });
  return data;
}

/** Real endpoint (suggested): GET /api/sna/alerts?state= */
export async function getSnaAlertsList(state) {
  if (USE_MOCKS) {
    await delay(300);
    return getSnaAlerts(state);
  }
  const { data } = await apiClient.get("/sna/alerts", { params: { state } });
  return data;
}

// ---------------------------------------------------------------------------
// IDA (Implementing District Authority) — placeholder service methods.
// Backed by src/data/idaData.js + the project override layer in
// src/data/mockData.js today; swap for real API calls when ready.
// ---------------------------------------------------------------------------

/** Real endpoint (suggested): GET /api/ida/dashboard?districtCode= */
export async function getIdaDashboard(districtCode) {
  if (USE_MOCKS) {
    await delay(300);
    return getDistrictSummary(districtCode);
  }
  const { data } = await apiClient.get("/ida/dashboard", { params: { districtCode } });
  return data;
}

/** Real endpoint (suggested): GET /api/ida/projects?districtCode= */
export async function getDistrictProjects(districtCode) {
  if (USE_MOCKS) {
    await delay(300);
    return getProjectsByDistrictCode(districtCode);
  }
  const { data } = await apiClient.get("/ida/projects", { params: { districtCode } });
  return data;
}

/** Real endpoint (suggested): GET /api/ida/implementing-agencies */
export async function getImplementingAgencies() {
  if (USE_MOCKS) {
    await delay(150);
    return IDA_AGENCY_OPTIONS;
  }
  const { data } = await apiClient.get("/ida/implementing-agencies");
  return data;
}

/** Real endpoint (suggested): POST /api/ida/projects/:projectId/assign-agency */
export async function assignImplementingAgency(projectId, assignment) {
  if (USE_MOCKS) {
    await delay(400);
    assignIAInData(projectId, assignment);
    return { success: true, projectId, ...assignment };
  }
  const { data } = await apiClient.post(`/ida/projects/${projectId}/assign-agency`, assignment);
  return data;
}

/** Real endpoint (suggested): GET /api/ida/complaints?districtCode= (delegates to existing complaint state) */
export async function getDistrictComplaints(districtCode, allComplaints) {
  if (USE_MOCKS) {
    await delay(200);
    return allComplaints.filter((c) => c.districtCode === districtCode);
  }
  const { data } = await apiClient.get("/ida/complaints", { params: { districtCode } });
  return data;
}

/** Real endpoint (suggested): PATCH /api/complaints/:id/status (same endpoint as the existing complaint flow) */
export async function updateComplaintStatusApi(id, status) {
  if (USE_MOCKS) {
    await delay(200);
    return { success: true, id, status };
  }
  const { data } = await apiClient.patch(`/complaints/${id}/status`, { status });
  return data;
}

// ---------------------------------------------------------------------------
// Field Verification — placeholder service methods.
//
// Today these are thin passthroughs to DataStoreContext's in-memory/
// localStorage-backed field verification store (see fieldVerifications /
// addFieldVerificationUpdate in DataStoreContext.jsx) — this file doesn't
// hold its own copy of the data, it just gives components one consistent
// place to call instead of reaching into the context or mockData directly,
// so the swap to real endpoints later doesn't touch any page.
//
// FUTURE AI INTEGRATION (not implemented yet — frontend-ready only):
// Once the FastAPI AI service is live, `submitFieldVerification` should
// also trigger server-side image comparison (against prior site photos),
// anomaly detection on the submitted progress/expenditure numbers, and an
// updated risk score — the response shape below already anticipates that
// via the optional `aiAssessment` field, which the UI can render once the
// backend starts populating it.
// ---------------------------------------------------------------------------

/**
 * Real endpoint (suggested): POST /api/ida/projects/:projectId/verification
 * (multipart/form-data for photos/documents; the Node backend would proxy
 * the evidence to FastAPI's /verify-evidence endpoint for AI-assisted
 * comparison and return the combined result.)
 *
 * Expected future response shape once AI is wired up:
 * {
 *   success: true,
 *   verificationId,
 *   status,                 // authority's chosen status (Pending Review/Verified/Flagged)
 *   aiAssessment: {          // populated by FastAPI later; null/absent today
 *     imageMatchScore,       // similarity vs. prior geo-tagged site photos
 *     progressConsistency,   // does claimed progress% match visual evidence
 *     anomalyFlags: [],      // any AI-detected inconsistencies
 *     suggestedRiskScore,
 *   }
 * }
 */
export async function submitFieldVerification(projectId, payload) {
  if (USE_MOCKS) {
    await delay(600);
    // AI assessment intentionally omitted — not implemented yet.
    return { success: true, verificationId: `FV-${Date.now()}`, projectId, status: payload.status, aiAssessment: null };
  }
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if ((key === "photos" || key === "documents") && Array.isArray(value)) {
      value.forEach((f) => form.append(key, f.file || f));
    } else {
      form.append(key, value);
    }
  });
  const { data } = await apiClient.post(`/ida/projects/${projectId}/verification`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Real endpoint (suggested): GET /api/ida/projects/:projectId/verification-history */
export async function fetchFieldVerificationHistory(projectId) {
  if (USE_MOCKS) {
    await delay(200);
    return null; // components read this from DataStoreContext today
  }
  const { data } = await apiClient.get(`/ida/projects/${projectId}/verification-history`);
  return data;
}

/** Real endpoint (suggested): GET /api/ida/verification-queue?districtCode= */
export async function fetchVerificationQueue(districtCode) {
  if (USE_MOCKS) {
    await delay(200);
    return getProjectsByDistrictCode(districtCode).filter((p) => p.status === "Work in Progress");
  }
  const { data } = await apiClient.get("/ida/verification-queue", { params: { districtCode } });
  return data;
}

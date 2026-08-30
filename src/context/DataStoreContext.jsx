import { createContext, useContext, useEffect, useState } from "react";
import {
  STATES,
  getAllProjects,
  assignImplementingAgency as assignIAInData,
  updateProjectStatusOverride,
  updateProjectProgressOverride,
  updateProjectExpenditureOverride,
} from "../data/mockData";
import { createSeededRandom } from "../utils/seededRandom";
import { defaultVerificationStatus } from "../data/verificationData";

const DataStoreContext = createContext(null);

const REC_KEY = "mplads_sentinel_recommendations";
const COMPLAINT_KEY = "mplads_sentinel_complaints";
const VERIFICATION_KEY = "mplads_sentinel_field_verifications";

function seedRecommendations() {
  const projects = getAllProjects().slice(0, 4);
  const stages = ["DA Approval", "IA Execution", "Progress Tracking", "Expenditure Recorded"];
  const statuses = ["Pending", "Approved", "Approved", "Approved"];
  return projects.map((p, i) => ({
    id: `REC-SEED-${i + 1}`,
    projectId: p.id,
    name: p.description,
    district: p.district,
    state: p.state,
    amountRequested: p.amountAllocated,
    recommendedOn: p.startDate,
    status: statuses[i],
    currentStage: stages[i],
    progressPercent: p.progressPercent,
    justification: "Seeded example recommendation for demo purposes.",
  }));
}

function seedComplaints() {
  const rand = createSeededRandom("complaints-seed");
  const categories = [
    "Substandard quality of work",
    "Work not started despite sanction",
    "Fund misutilization suspected",
  ];
  const projects = getAllProjects().slice(4, 7);
  return projects.map((p, i) => ({
    id: `CMP-SEED-${i + 1}`,
    projectId: p.id,
    state: p.state,
    districtCode: p.districtCode,
    pincode: p.pincode,
    category: rand.pick(categories),
    description: "Seeded example complaint for demo purposes.",
    files: [],
    submittedOn: p.startDate,
    status: i === 0 ? "Resolved" : i === 1 ? "Under Review" : "Open",
  }));
}

function readOrSeed(key, seedFn) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return seedFn();
}

export function DataStoreProvider({ children }) {
  const [recommendations, setRecommendations] = useState(() => readOrSeed(REC_KEY, seedRecommendations));
  const [complaints, setComplaints] = useState(() => readOrSeed(COMPLAINT_KEY, seedComplaints));

  useEffect(() => {
    localStorage.setItem(REC_KEY, JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem(COMPLAINT_KEY, JSON.stringify(complaints));
  }, [complaints]);

  const addRecommendation = (rec) => {
    const newRec = {
      id: `REC-${Date.now()}`,
      status: "Pending",
      currentStage: "DA Approval",
      progressPercent: 0,
      recommendedOn: new Date().toISOString().slice(0, 10),
      ...rec,
    };
    setRecommendations((prev) => [newRec, ...prev]);
    return newRec;
  };

  const addComplaint = (complaint) => {
    const newComplaint = {
      id: `CMP-${Date.now()}`,
      status: "Open",
      submittedOn: new Date().toISOString().slice(0, 10),
      ...complaint,
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateComplaintStatus = (id, status) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  // ---------------------------------------------------------------------
  // IDA / project mutation layer (SNA + IDA feature). These wrap the
  // localStorage-backed override functions in mockData.js and bump
  // `projectVersion` so any page reading getAllProjects()/getProjectById()
  // via a `[projectVersion]` dependency re-derives fresh data.
  // ---------------------------------------------------------------------
  const [projectVersion, setProjectVersion] = useState(0);
  const bumpProjectVersion = () => setProjectVersion((v) => v + 1);

  const assignImplementingAgency = (projectId, assignment) => {
    assignIAInData(projectId, assignment);
    bumpProjectVersion();
  };

  const updateProjectStatus = (projectId, status) => {
    updateProjectStatusOverride(projectId, status);
    bumpProjectVersion();
  };

  const updateProjectProgress = (projectId, progressPercent) => {
    updateProjectProgressOverride(projectId, progressPercent);
    bumpProjectVersion();
  };

  const updateProjectExpenditure = (projectId, expenditurePercent) => {
    updateProjectExpenditureOverride(projectId, expenditurePercent);
    bumpProjectVersion();
  };

  // ---------------------------------------------------------------------
  // Field Verification store. Keyed by projectId:
  //   { status: "Not Verified" | "Pending Review" | "Verified" | "Flagged",
  //     updates: [{ id, date, progressPercent, expenditureAmount, remarks,
  //                 photos, documents, status, submittedBy }] }
  // Submitting an update also syncs the project's live progress/expenditure
  // via the existing IDA mutators above, so Dashboard/Scorecard/Reports
  // immediately reflect it too — same `projectVersion` refresh mechanism.
  // ---------------------------------------------------------------------
  const [fieldVerifications, setFieldVerifications] = useState(() => readOrSeed(VERIFICATION_KEY, () => ({})));

  useEffect(() => {
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(fieldVerifications));
  }, [fieldVerifications]);

  const getVerificationRecord = (projectId, project) =>
    fieldVerifications[projectId] || { status: project ? defaultVerificationStatus(project) : "Not Verified", updates: [] };

  const addFieldVerificationUpdate = (project, update) => {
    const cleanPhotos = (update.photos || []).map((f) => ({ name: f.name, size: f.size, preview: f.preview || null }));
    const cleanDocuments = (update.documents || []).map((f) => ({ name: f.name, size: f.size }));

    const entry = {
      id: `FV-${Date.now()}`,
      date: update.verificationDate || new Date().toISOString().slice(0, 10),
      progressPercent: update.progressPercent,
      expenditureAmount: update.expenditureAmount,
      remarks: update.remarks,
      photos: cleanPhotos,
      documents: cleanDocuments,
      status: update.status,
      submittedBy: update.submittedBy,
    };

    setFieldVerifications((prev) => {
      const existing = prev[project.id] || { status: "Not Verified", updates: [] };
      return {
        ...prev,
        [project.id]: { status: update.status, updates: [entry, ...existing.updates] },
      };
    });

    // Keep the underlying project's live snapshot in sync so every other
    // page (Dashboard, Scorecard, Reports) reflects this verification too.
    updateProjectProgressOverride(project.id, update.progressPercent);
    if (project.amountAllocated) {
      const pct = Math.min(100, Math.round((update.expenditureAmount / project.amountAllocated) * 100));
      updateProjectExpenditureOverride(project.id, pct);
    }
    bumpProjectVersion();

    return entry;
  };

  const value = {
    recommendations,
    complaints,
    addRecommendation,
    addComplaint,
    updateComplaintStatus,
    STATES,
    projectVersion,
    assignImplementingAgency,
    updateProjectStatus,
    updateProjectProgress,
    updateProjectExpenditure,
    fieldVerifications,
    getVerificationRecord,
    addFieldVerificationUpdate,
  };

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within a DataStoreProvider");
  return ctx;
}

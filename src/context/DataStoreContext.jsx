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

const DataStoreContext = createContext(null);

const REC_KEY = "mplads_sentinel_recommendations";
const COMPLAINT_KEY = "mplads_sentinel_complaints";

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
  };

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within a DataStoreProvider");
  return ctx;
}

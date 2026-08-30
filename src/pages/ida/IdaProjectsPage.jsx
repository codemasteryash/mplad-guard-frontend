import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getProjectsByDistrictCode, PROJECT_STATUSES } from "../../data/mockData";
import IdaProjectTable from "../../components/ida/IdaProjectTable";
import AssignIAModal from "../../components/ida/AssignIAModal";

export default function IdaProjectsPage() {
  const { profile } = useAuth();
  const { assignImplementingAgency, updateProjectStatus, projectVersion } = useDataStore();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [assignTarget, setAssignTarget] = useState(null);


  const projects = useMemo(() => getProjectsByDistrictCode(profile?.districtCode), [profile, projectVersion]);

  const filtered = useMemo(() => {
    let data = [...projects];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) => p.projectId.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.pincode.includes(q)
      );
    }
    if (status) data = data.filter((p) => p.status === status);
    if (riskLevel) data = data.filter((p) => p.riskLevel === riskLevel);
    return data.sort((a, b) => b.riskScore - a.riskScore);
  }, [projects, search, status, riskLevel]);

  const handleAssign = (projectId, assignment) => {
    assignImplementingAgency(projectId, assignment);
    setAssignTarget(null);
    push(`Implementing Agency assigned successfully — ${assignment.agency}`, "success");
  };

  const handleFlag = (project) => {
    updateProjectStatus(project.id, "Delayed");
    push(`${project.projectId} flagged for review`, "warning");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">District Projects — {profile?.district}</h1>
        <p className="mt-1 text-sm text-ink-500">All MPLADS works sanctioned in your district.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl2 border border-ink-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project ID, description, pincode..."
            className="w-full rounded-lg border border-ink-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500">
          <option value="">All Statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500">
          <option value="">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button
          onClick={() => {
            setSearch("");
            setStatus("");
            setRiskLevel("");
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-100"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">{filtered.length} Projects</h3>
        </div>
        <IdaProjectTable projects={filtered} onAssign={setAssignTarget} onFlag={handleFlag} />
      </div>

      <AssignIAModal open={!!assignTarget} project={assignTarget} onClose={() => setAssignTarget(null)} onAssign={handleAssign} />
    </div>
  );
}

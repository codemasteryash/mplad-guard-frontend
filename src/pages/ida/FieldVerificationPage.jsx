import { useMemo, useState } from "react";
import { Search, RotateCcw, ClipboardCheck, UploadCloud, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getProjectsByDistrictCode } from "../../data/mockData";
import VerificationTable from "../../components/verification/VerificationTable";
import UploadUpdateModal from "../../components/verification/UploadUpdateModal";
import StatCard from "../../components/common/StatCard";

export default function FieldVerificationPage() {
  const { profile } = useAuth();
  const { getVerificationRecord, addFieldVerificationUpdate, projectVersion } = useDataStore();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [uploadTarget, setUploadTarget] = useState(null);

  const inProgressProjects = useMemo(
    () => getProjectsByDistrictCode(profile?.districtCode).filter((p) => p.status === "Work in Progress"),
    // projectVersion intentionally triggers a refetch after a verification
    // update changes a project's progress/expenditure/status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, projectVersion]
  );

  const filtered = useMemo(() => {
    if (!search) return inProgressProjects;
    const q = search.toLowerCase();
    return inProgressProjects.filter(
      (p) => p.projectId.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.pincode.includes(q)
    );
  }, [inProgressProjects, search]);

  const getStatus = (project) => getVerificationRecord(project.id, project);

  const counts = useMemo(() => {
    const acc = { pending: 0, verified: 0, flagged: 0, notVerified: 0 };
    inProgressProjects.forEach((p) => {
      const s = getStatus(p).status;
      if (s === "Pending Review") acc.pending += 1;
      else if (s === "Verified") acc.verified += 1;
      else if (s === "Flagged") acc.flagged += 1;
      else acc.notVerified += 1;
    });
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgressProjects, projectVersion]);

  const handleSubmit = (project, update) => {
    addFieldVerificationUpdate(project, { ...update, submittedBy: profile?.name });
    setUploadTarget(null);
    push(`Verification update submitted — status set to "${update.status}"`, "success");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Field Verification — {profile?.district}</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verify ongoing MPLADS works through on-site evidence. AI-assisted image comparison and anomaly
          detection will be added once the FastAPI verification service is connected.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="In-Progress Projects" numericValue={inProgressProjects.length} tone="navy" />
        <StatCard icon={UploadCloud} label="Pending Review" numericValue={counts.pending} tone="amber" />
        <StatCard icon={ClipboardCheck} label="Verified" numericValue={counts.verified} tone="green" />
        <StatCard icon={ShieldAlert} label="Flagged" numericValue={counts.flagged} tone="red" />
      </div>

      <div className="flex items-center gap-3 rounded-xl2 border border-ink-200 bg-white p-4 shadow-card">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project ID, description, pincode..."
            className="w-full rounded-lg border border-ink-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500"
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-100">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">{filtered.length} In-Progress Projects</h3>
        </div>
        <VerificationTable projects={filtered} getStatus={getStatus} onUpload={setUploadTarget} />
      </div>

      <UploadUpdateModal open={!!uploadTarget} project={uploadTarget} onClose={() => setUploadTarget(null)} onSubmit={handleSubmit} />
    </div>
  );
}

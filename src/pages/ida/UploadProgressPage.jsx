import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, UploadCloud, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getProjectsByDistrictCode, getProjectById } from "../../data/mockData";
import { formatFullINR, formatDate } from "../../utils/format";
import { StatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import FileDropzone from "../../components/common/FileDropzone";

const STATUS_OPTIONS = ["Pending Review", "Verified", "Flagged"];

export default function UploadProgressPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addFieldVerificationUpdate, projectVersion } = useDataStore();
  const { push } = useToast();

  const districtProjects = useMemo(
    () => getProjectsByDistrictCode(profile?.districtCode).filter((p) => p.status === "Work in Progress"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, projectVersion]
  );

  const preselected = projectId ? getProjectById(decodeURIComponent(projectId)) : null;
  const [selectedProjectId, setSelectedProjectId] = useState(preselected?.id || "");
  const project = selectedProjectId ? getProjectById(selectedProjectId) : null;

  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progressPercent, setProgressPercent] = useState(project?.progressPercent ?? 0);
  const [expenditureAmount, setExpenditureAmount] = useState(
    project ? Math.round(project.amountAllocated * (project.expenditurePercent / 100)) : 0
  );
  const [remarks, setRemarks] = useState("");
  const [verificationDate, setVerificationDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Pending Review");

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    const p = getProjectById(id);
    if (p) {
      setProgressPercent(p.progressPercent);
      setExpenditureAmount(Math.round(p.amountAllocated * (p.expenditurePercent / 100)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project) return;
    addFieldVerificationUpdate(project, {
      photos, documents, progressPercent: Number(progressPercent), expenditureAmount: Number(expenditureAmount),
      remarks, verificationDate, status, submittedBy: profile?.name,
    });
    push(`Progress update submitted for ${project.projectId} — status set to "${status}"`, "success");
    navigate(`/ida/verification/${encodeURIComponent(project.id)}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex items-center gap-1.5 text-xs text-ink-400">
          <Link to="/ida/verification" className="hover:text-brand-600">Field Verification</Link>
          <ChevronRight size={12} /><span className="font-semibold text-ink-700">Upload Progress</span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">Upload Progress</h1>
        <p className="mt-1 text-sm text-ink-500">Submit on-site evidence and an updated progress/expenditure snapshot for a project.</p>
      </div>

      <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Select Project *</label>
        <select
          value={selectedProjectId}
          onChange={(e) => handleSelectProject(e.target.value)}
          required
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        >
          <option value="">Select an in-progress project…</option>
          {districtProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.projectId} — {p.description}</option>
          ))}
        </select>

        {project && (
          <div className="mt-4 rounded-lg bg-canvas px-3.5 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-ink-900">{project.projectId}</p>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1 text-ink-600">{project.description}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
              <span>District: {project.district}</span>
              <span>Amount: {formatFullINR(project.amountAllocated)}</span>
              <span>Start: {formatDate(project.startDate)}</span>
            </div>
          </div>
        )}
      </div>

      {!project ? (
        <EmptyState icon={Info} title="Select a project to continue" description="Choose an in-progress project above to start entering its update." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
            <p className="mb-1.5 text-sm font-medium text-ink-700">Site Photographs *</p>
            <FileDropzone files={photos} setFiles={setPhotos} accept="image/*" hint="Upload multiple geo-tagged site photographs (JPG, PNG — max 10MB each)" />
          </div>

          <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
            <p className="mb-1.5 text-sm font-medium text-ink-700">Video / Supporting Document (optional)</p>
            <FileDropzone files={documents} setFiles={setDocuments} accept=".mp4,.mov,.pdf,.doc,.docx" hint="Supported formats: MP4, MOV, PDF, DOC, DOCX (max 50MB each)" />
          </div>

          <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-display text-base font-bold text-ink-900">Progress &amp; Financials</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Current Progress % *</span>
                <input type="number" min="0" max="100" value={progressPercent} onChange={(e) => setProgressPercent(e.target.value)} required className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Current Expenditure (₹) *</span>
                <input type="number" min="0" max={project.amountAllocated} value={expenditureAmount} onChange={(e) => setExpenditureAmount(e.target.value)} required className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500" />
                <span className="mt-1 block text-[11px] text-ink-400">of {formatFullINR(project.amountAllocated)} allocated</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Date *</span>
                <input type="date" value={verificationDate} onChange={(e) => setVerificationDate(e.target.value)} required className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Status *</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Remarks *</span>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} required rows={4}
                placeholder="Observations from the site visit — quality, discrepancies, adherence to sanctioned scope, etc."
                className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500" />
            </label>
          </div>

          <div className="rounded-lg bg-brand-50 px-4 py-3 text-xs text-brand-800">
            This evidence is stored for administrative review. AI-assisted image comparison and anomaly
            detection will be available once the FastAPI verification service is connected.
          </div>

          <div className="flex gap-3 pb-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/ida/verification")}>Cancel</Button>
            <Button type="submit" icon={UploadCloud} className="flex-1">Submit Update</Button>
          </div>
        </form>
      )}
    </div>
  );
}

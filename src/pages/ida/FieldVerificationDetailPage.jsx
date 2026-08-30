import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight, ArrowLeft, Info, UploadCloud, ImageOff, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getProjectById } from "../../data/mockData";
import { getBaselineHistory } from "../../data/verificationData";
import { formatFullINR, formatDate, classNames } from "../../utils/format";
import { StatusBadge } from "../../components/common/Badge";
import RiskGauge from "../../components/common/RiskGauge";
import { EmptyState } from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import UploadUpdateModal from "../../components/verification/UploadUpdateModal";

export default function FieldVerificationDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { getVerificationRecord, addFieldVerificationUpdate, projectVersion } = useDataStore();
  const { push } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const project = useMemo(() => getProjectById(decodeURIComponent(projectId)), [projectId, projectVersion]);
  const record = project ? getVerificationRecord(project.id, project) : { status: "Not Verified", updates: [] };

  const chartData = useMemo(() => {
    if (!project) return { progress: [], expenditure: [] };
    const baseline = getBaselineHistory(project);
    const updateProgress = record.updates
      .map((u) => ({ date: u.date, value: u.progressPercent }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const updateExpenditure = record.updates
      .map((u) => ({ date: u.date, value: Math.round((u.expenditureAmount / project.amountAllocated) * 100) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      progress: [...baseline.progressHistory, ...updateProgress],
      expenditure: [...baseline.expenditureHistory, ...updateExpenditure],
    };
  }, [project, record.updates]);

  const allPhotos = useMemo(() => record.updates.flatMap((u) => u.photos.map((p) => ({ ...p, updateId: u.id, date: u.date }))), [record.updates]);
  const latestUpdate = record.updates[0];

  if (!project) {
    return (
      <EmptyState
        icon={Info}
        title="Project not found"
        description="This project id doesn't exist in the current dataset."
        action={
          <Button variant="outline" onClick={() => navigate("/ida/verification")}>
            Back to Field Verification
          </Button>
        }
      />
    );
  }

  const handleSubmit = (proj, update) => {
    addFieldVerificationUpdate(proj, { ...update, submittedBy: profile?.name });
    setUploadOpen(false);
    push(`Verification update submitted — status set to "${update.status}"`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-1.5 text-xs text-ink-400">
            <Link to="/ida/verification" className="hover:text-brand-600">
              Field Verification
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold text-ink-700">{project.projectId}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">{project.description}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {project.district} ({project.districtCode}) · {project.assignedIA}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={record.status} />
          <Button icon={UploadCloud} onClick={() => setUploadOpen(true)}>
            Upload Update
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Latest Update</h3>
          {!latestUpdate ? (
            <p className="text-sm text-ink-400">No field verification submitted yet for this project.</p>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={latestUpdate.status} />
                <span className="text-xs text-ink-500">{formatDate(latestUpdate.date)}</span>
                {latestUpdate.submittedBy && <span className="text-xs text-ink-400">by {latestUpdate.submittedBy}</span>}
              </div>
              <p className="mt-3 text-sm text-ink-700">{latestUpdate.remarks}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-canvas px-3 py-2.5 text-center">
                  <p className="font-display text-sm font-bold text-ink-900">{latestUpdate.progressPercent}%</p>
                  <p className="text-[11px] text-ink-500">Progress Reported</p>
                </div>
                <div className="rounded-lg bg-canvas px-3 py-2.5 text-center">
                  <p className="font-display text-sm font-bold text-ink-900">{formatFullINR(latestUpdate.expenditureAmount)}</p>
                  <p className="text-[11px] text-ink-500">Expenditure Reported</p>
                </div>
                <div className="rounded-lg bg-canvas px-3 py-2.5 text-center">
                  <p className="font-display text-sm font-bold text-ink-900">{latestUpdate.photos.length}</p>
                  <p className="text-[11px] text-ink-500">Photos</p>
                </div>
                <div className="rounded-lg bg-canvas px-3 py-2.5 text-center">
                  <p className="font-display text-sm font-bold text-ink-900">{latestUpdate.documents.length}</p>
                  <p className="text-[11px] text-ink-500">Documents</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
          <h3 className="mb-2 self-start font-display text-base font-bold text-ink-900">AI Risk Score</h3>
          <RiskGauge score={project.riskScore} level={project.riskLevel} size={168} />
          <p className="mt-3 max-w-xs text-center text-xs text-ink-500">
            Flags projects for administrative review — not proof of wrongdoing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Progress History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData.progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFF5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => formatDate(d)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(d) => formatDate(d)} formatter={(v) => [`${v}%`, "Progress"]} />
              <Line type="monotone" dataKey="value" stroke="#2454E6" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Expenditure History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData.expenditure}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFF5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => formatDate(d)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(d) => formatDate(d)} formatter={(v) => [`${v}%`, "Fund Utilized"]} />
              <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 font-display text-base font-bold text-ink-900">Site Photographs ({allPhotos.length})</h3>
        {allPhotos.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ink-400">
            <ImageOff size={16} /> No site photographs uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {allPhotos.map((photo, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-ink-100">
                {photo.preview ? (
                  <img src={photo.preview} alt={photo.name} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-canvas text-ink-300">
                    <FileText size={20} />
                  </div>
                )}
                <p className="truncate px-2 py-1.5 text-[10px] text-ink-400">{formatDate(photo.date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-6 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">Verification History ({record.updates.length})</h3>
        </div>
        {record.updates.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-400">No verification updates submitted yet.</p>
        ) : (
          <div className="divide-y divide-ink-50">
            {record.updates.map((u) => (
              <div key={u.id} className="flex items-start justify-between gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={u.status} />
                    <span className="text-xs text-ink-400">{formatDate(u.date)}</span>
                  </div>
                  <p className={classNames("mt-1.5 text-sm text-ink-700")}>{u.remarks}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    Progress {u.progressPercent}% · Expenditure {formatFullINR(u.expenditureAmount)} · {u.photos.length} photo(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadUpdateModal open={uploadOpen} project={project} onClose={() => setUploadOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}

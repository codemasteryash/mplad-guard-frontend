import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, Info, UserCog, MessageSquareWarning } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getProjectById } from "../../data/mockData";
import { formatFullINR, formatDate, classNames } from "../../utils/format";
import { StatusBadge } from "../../components/common/Badge";
import RiskGauge from "../../components/common/RiskGauge";
import { EmptyState } from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import AssignIAModal from "../../components/ida/AssignIAModal";

const BREAKDOWN_LABELS = {
  financial: "Financial Anomalies",
  delay: "Time Delays",
  resource: "Resource Utilization",
  geo: "Geo-tag Issues",
  document: "Document Mismatch",
};

export default function IdaProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { complaints, assignImplementingAgency, projectVersion } = useDataStore();
  const { push } = useToast();
  const [assignOpen, setAssignOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const project = useMemo(() => getProjectById(decodeURIComponent(projectId)), [projectId, projectVersion]);
  const linkedComplaints = complaints.filter((c) => c.projectId === project?.id || c.projectId === project?.projectId);

  if (!project) {
    return (
      <EmptyState
        icon={Info}
        title="Project not found"
        description="This project id doesn't exist in the current dataset."
        action={
          <Button variant="outline" onClick={() => navigate("/ida/projects")}>
            Back to Projects
          </Button>
        }
      />
    );
  }

  const handleAssign = (id, assignment) => {
    assignImplementingAgency(id, assignment);
    setAssignOpen(false);
    push(`Implementing Agency assigned successfully — ${assignment.agency}`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-1.5 text-xs text-ink-400">
            <Link to="/ida/projects" className="hover:text-brand-600">
              District Projects
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold text-ink-700">{project.projectId}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">Project Overview</h1>
        </div>
        <Button icon={UserCog} onClick={() => setAssignOpen(true)}>
          {project.iaAssignedOn ? "Reassign Agency" : "Assign IA"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Project Overview</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Project ID", project.projectId],
              ["Description", project.description],
              ["State", project.state],
              ["District", `${project.district} (${project.districtCode})`],
              ["Pincode", project.pincode],
              ["Constituency", project.district],
              ["MP", project.recommendingMP],
              ["IDA", profile?.name || "Implementing District Authority"],
              ["Implementing Agency", project.assignedIA],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-ink-50 pb-2.5">
                <dt className="text-ink-500">{label}</dt>
                <dd className="text-right font-medium text-ink-900">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-1">
              <dt className="text-ink-500">Status</dt>
              <dd>
                <StatusBadge status={project.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Financial Information</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Allocated", project.amountAllocated],
              ["Released", project.amountAllocated],
              ["Utilized", Math.round(project.amountAllocated * (project.expenditurePercent / 100))],
              ["Remaining", Math.round(project.amountAllocated * (1 - project.expenditurePercent / 100))],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-canvas px-3 py-2.5 text-center">
                <p className="font-display text-sm font-bold text-ink-900">{formatFullINR(value)}</p>
                <p className="text-[11px] text-ink-500">{label}</p>
              </div>
            ))}
          </div>

          <h4 className="mb-2 mt-5 text-sm font-semibold text-ink-700">Timeline</h4>
          <ul className="space-y-2 text-xs text-ink-600">
            <li className="flex justify-between"><span>Recommendation Date</span><span>{formatDate(project.startDate)}</span></li>
            <li className="flex justify-between"><span>Sanction Date</span><span>{formatDate(project.startDate)}</span></li>
            <li className="flex justify-between">
              <span>IA Assignment Date</span>
              <span>{project.iaAssignedOn ? formatDate(project.iaAssignedOn) : "Not yet assigned"}</span>
            </li>
            <li className="flex justify-between"><span>Expected End Date</span><span>{formatDate(project.endDate)}</span></li>
          </ul>

          <h4 className="mb-2 mt-5 text-sm font-semibold text-ink-700">Progress</h4>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${project.progressPercent}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink-500">{project.progressPercent}% physically complete</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl2 border border-ink-200 bg-white p-6 shadow-card">
          <h3 className="mb-2 self-start font-display text-base font-bold text-ink-900">AI Risk Score</h3>
          <RiskGauge score={project.riskScore} level={project.riskLevel} />
          <p className="mt-3 max-w-xs text-center text-sm text-ink-500">
            AI-assisted risk analysis highlights this project for administrative review — it is not proof of
            wrongdoing.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-6 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">Score Breakdown &amp; Anomalies</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            {Object.entries(project.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink-700">{BREAKDOWN_LABELS[key]}</span>
                  <span className={classNames("font-semibold", value >= 65 ? "text-risk-high" : value >= 35 ? "text-risk-medium" : "text-risk-low")}>
                    {value}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={classNames("h-full rounded-full transition-all duration-700", value >= 65 ? "bg-risk-high" : value >= 35 ? "bg-risk-medium" : "bg-risk-low")}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {project.anomalies.length === 0 ? (
              <p className="text-sm text-ink-400">No anomalies detected for this project.</p>
            ) : (
              project.anomalies.map((a) => (
                <div key={a.anomalyId} className="rounded-lg border border-ink-100 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">{a.typeLabel}</p>
                    <span className="text-xs font-semibold text-risk-high">{a.riskPercentage}% confidence</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{a.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-ink-100 px-6 py-4">
          <MessageSquareWarning size={16} className="text-ink-500" />
          <h3 className="font-display text-base font-bold text-ink-900">Citizen Complaints ({linkedComplaints.length})</h3>
        </div>
        {linkedComplaints.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-400">No complaints linked to this project.</p>
        ) : (
          <div className="divide-y divide-ink-50">
            {linkedComplaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{c.category}</p>
                  <p className="text-xs text-ink-400">{c.id} · {formatDate(c.submittedOn)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <AssignIAModal open={assignOpen} project={project} onClose={() => setAssignOpen(false)} onAssign={handleAssign} />
    </div>
  );
}

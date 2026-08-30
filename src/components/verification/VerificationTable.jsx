import { useNavigate } from "react-router-dom";
import { Eye, UploadCloud, Search } from "lucide-react";
import { formatFullINR, classNames } from "../../utils/format";
import { RiskBadge, StatusBadge } from "../common/Badge";
import { EmptyState } from "../common/EmptyState";

export default function VerificationTable({ projects, getStatus, onUpload }) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return <EmptyState icon={Search} title="No in-progress projects" description="Nothing awaiting field verification right now." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3 font-semibold">Project ID</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">District</th>
            <th className="px-4 py-3 font-semibold">Pincode</th>
            <th className="px-4 py-3 font-semibold">IA</th>
            <th className="px-4 py-3 font-semibold">Progress</th>
            <th className="px-4 py-3 font-semibold">Allocated</th>
            <th className="px-4 py-3 font-semibold">Utilized</th>
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">Verification</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const record = getStatus(p);
            const utilized = Math.round(p.amountAllocated * (p.expenditurePercent / 100));
            return (
              <tr key={p.id} className="border-b border-ink-50 hover:bg-brand-50/30">
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-navy-700">{p.projectId}</td>
                <td className="max-w-[200px] truncate px-4 py-3.5 text-ink-700" title={p.description}>
                  {p.description}
                </td>
                <td className="px-4 py-3.5 text-ink-700">{p.district}</td>
                <td className="px-4 py-3.5 text-ink-700">{p.pincode}</td>
                <td className="px-4 py-3.5 text-ink-700">{p.assignedIA}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                      <div className={classNames("h-full rounded-full bg-brand-500")} style={{ width: `${p.progressPercent}%` }} />
                    </div>
                    <span className="text-xs text-ink-500">{p.progressPercent}%</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatFullINR(p.amountAllocated)}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatFullINR(utilized)}</td>
                <td className="px-4 py-3.5">
                  <RiskBadge level={p.riskLevel} size="sm" />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/ida/verification/${encodeURIComponent(p.id)}`)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-navy-50 hover:text-navy-700"
                      aria-label="View verification detail"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onUpload(p)}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600"
                    >
                      <UploadCloud size={13} /> Upload Update
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

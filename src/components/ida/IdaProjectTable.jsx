import { useNavigate } from "react-router-dom";
import { Eye, UserCog, Flag, Search } from "lucide-react";
import { formatFullINR, formatDate, classNames } from "../../utils/format";
import { RiskBadge, StatusBadge } from "../common/Badge";
import { EmptyState } from "../common/EmptyState";
import { getMpRoster } from "../../data/snaData";

let _mpByDistrict = null;
function mpNameForDistrict(districtCode) {
  if (!_mpByDistrict) {
    _mpByDistrict = {};
    getMpRoster().forEach((m) => {
      _mpByDistrict[m.districtCode] = m.name;
    });
  }
  return _mpByDistrict[districtCode] || "—";
}

export default function IdaProjectTable({ projects, onAssign, onFlag }) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return <EmptyState icon={Search} title="No projects found" description="Try adjusting your filters." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3 font-semibold">Project ID</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Constituency</th>
            <th className="px-4 py-3 font-semibold">Pincode</th>
            <th className="px-4 py-3 font-semibold">MP</th>
            <th className="px-4 py-3 font-semibold">Allocated</th>
            <th className="px-4 py-3 font-semibold">Start Date</th>
            <th className="px-4 py-3 font-semibold">Expected End</th>
            <th className="px-4 py-3 font-semibold">IA</th>
            <th className="px-4 py-3 font-semibold">Progress</th>
            <th className="px-4 py-3 font-semibold">Expenditure</th>
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-ink-50 hover:bg-brand-50/30">
              <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-navy-700">{p.projectId}</td>
              <td className="max-w-[200px] truncate px-4 py-3.5 text-ink-700" title={p.description}>
                {p.description}
              </td>
              <td className="px-4 py-3.5 text-ink-700">{p.district}</td>
              <td className="px-4 py-3.5 text-ink-700">{p.pincode}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{mpNameForDistrict(p.districtCode)}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatFullINR(p.amountAllocated)}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatDate(p.startDate)}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatDate(p.endDate)}</td>
              <td className="px-4 py-3.5 text-ink-700">{p.assignedIA}</td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.progressPercent}%` }} />
                  </div>
                  <span className="text-xs text-ink-500">{p.progressPercent}%</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-ink-700">{p.expenditurePercent}%</td>
              <td className="px-4 py-3.5">
                <RiskBadge level={p.riskLevel} size="sm" />
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/ida/projects/${encodeURIComponent(p.id)}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-navy-50 hover:text-navy-700"
                    aria-label="View project"
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onAssign(p)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-brand-50 hover:text-brand-600"
                    aria-label="Assign implementing agency"
                    title="Assign IA"
                  >
                    <UserCog size={15} />
                  </button>
                  <button
                    onClick={() => onFlag(p)}
                    className={classNames(
                      "flex h-7 w-7 items-center justify-center rounded-lg hover:bg-risk-highBg hover:text-risk-high",
                      p.status === "Delayed" ? "text-risk-high" : "text-ink-400"
                    )}
                    aria-label="Flag for review"
                    title="Flag for review"
                  >
                    <Flag size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

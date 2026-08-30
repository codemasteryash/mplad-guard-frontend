import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  Send,
  Wallet,
  PiggyBank,
  ClipboardList,
  AlertTriangle,
  Clock3,
  Timer,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStateFundSummary, getMpRosterByState } from "../../data/snaData";
import { formatINR, formatFullINR } from "../../utils/format";
import StatCard from "../../components/common/StatCard";
import FundAllocationTable from "../../components/sna/FundAllocationTable";
import Button from "../../components/common/Button";

export default function SnaDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const state = profile?.state;

  const summary = useMemo(() => getStateFundSummary(state), [state]);
  const roster = useMemo(() => getMpRosterByState(state).slice(0, 6), [state]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Government of India · MoSPI</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">MPLAD Fund Oversight — {state}</h1>
        <p className="mt-1 text-sm text-ink-500">
          State Nodal Agency dashboard for fund distribution and utilization monitoring.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Landmark} label="Total State Allocation" value={formatINR(summary.allocated)} tone="navy" />
        <StatCard icon={Send} label="Funds Distributed" value={formatINR(summary.released)} tone="purple" />
        <StatCard icon={Wallet} label="Funds Utilized" value={formatINR(summary.utilized)} tone="green" />
        <StatCard icon={PiggyBank} label="Remaining Balance" value={formatINR(summary.remaining)} tone="amber" />
        <StatCard icon={ClipboardList} label="Active Projects" numericValue={summary.activeProjects} tone="navy" />
        <StatCard icon={AlertTriangle} label="At-Risk Projects" numericValue={summary.atRiskProjects} tone="red" />
        <StatCard icon={Clock3} label="Pending Approvals" numericValue={summary.pendingApprovals} tone="amber" />
        <StatCard icon={Timer} label="Delayed Projects" numericValue={summary.delayedProjects} tone="red" />
      </div>

      <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-bold text-ink-900">State Fund Distribution</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["State Total", summary.allocated, "text-navy-700"],
            ["Distributed", summary.released, "text-brand-600"],
            ["Utilized", summary.utilized, "text-risk-low"],
            ["Remaining", summary.remaining, "text-risk-medium"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-ink-100 bg-canvas/50 px-4 py-3.5 text-center">
              <p className={`font-display text-lg font-bold ${color}`}>{formatFullINR(value)}</p>
              <p className="mt-0.5 text-xs text-ink-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full bg-brand-500 transition-all duration-700"
            style={{ width: `${summary.allocated ? Math.round((summary.released / summary.allocated) * 100) : 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-400">
          {summary.allocated ? Math.round((summary.released / summary.allocated) * 100) : 0}% of allocation distributed to
          MPs/constituencies so far
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/sna/fund-flow")}>
          View Full Fund Flow <ChevronRight size={14} />
        </Button>
      </div>

      <FundAllocationTable roster={roster} groupBy="mp" />
      <div className="text-right">
        <button
          onClick={() => navigate("/sna/mp-allocation")}
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          View all {summary.mpCount} MPs/constituencies →
        </button>
      </div>
    </div>
  );
}

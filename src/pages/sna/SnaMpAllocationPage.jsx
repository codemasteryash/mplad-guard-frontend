import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMpRosterByState, getStateFundSummary } from "../../data/snaData";
import FundAllocationTable from "../../components/sna/FundAllocationTable";
import StatCard from "../../components/common/StatCard";
import { Users2, Landmark, Wallet } from "lucide-react";
import { formatINR } from "../../utils/format";

export default function SnaMpAllocationPage() {
  const { profile } = useAuth();
  const state = profile?.state;
  const roster = useMemo(() => getMpRosterByState(state), [state]);
  const summary = useMemo(() => getStateFundSummary(state), [state]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">MP-wise Fund Allocation — {state}</h1>
        <p className="mt-1 text-sm text-ink-500">Fund distribution and utilization across every constituency in the state.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users2} label="MPs / Constituencies" numericValue={summary.mpCount} tone="navy" />
        <StatCard icon={Landmark} label="Total Allocated" value={formatINR(summary.allocated)} tone="purple" />
        <StatCard icon={Wallet} label="Total Utilized" value={formatINR(summary.utilized)} tone="green" />
      </div>

      <FundAllocationTable roster={roster} groupBy="mp" />
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  ClipboardCheck,
  Activity,
  CheckCircle2,
  Clock3,
  Wallet,
  AlertTriangle,
  MessageSquareWarning,
  ChevronRight,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { getDistrictSummary } from "../../data/idaData";
import { formatINR } from "../../utils/format";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";

export default function IdaDashboardPage() {
  const { profile } = useAuth();
  const { complaints, projectVersion } = useDataStore();
  const navigate = useNavigate();
  const districtCode = profile?.districtCode;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const summary = useMemo(() => getDistrictSummary(districtCode), [districtCode, projectVersion]);
  const districtComplaints = complaints.filter((c) => c.districtCode === districtCode).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Government of India · MoSPI</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">
          Implementing Agency Dashboard — {profile?.district}
        </h1>
        <p className="mt-1 text-sm text-ink-500">Overview of MPLADS works assigned to your agency for execution.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Landmark} label="District Allocation" value={formatINR(summary.allocated)} tone="navy" />
        <StatCard icon={ClipboardCheck} label="Sanctioned Projects" numericValue={summary.sanctioned} tone="purple" />
        <StatCard icon={Activity} label="Active Projects" numericValue={summary.active} tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed Projects" numericValue={summary.completed} tone="green" />
        <StatCard icon={Clock3} label="Pending Projects" numericValue={summary.pending} tone="navy" />
        <StatCard icon={Wallet} label="Total Utilized" value={formatINR(summary.expenditure)} tone="green" />
        <StatCard icon={AlertTriangle} label="At-Risk Projects" numericValue={summary.high} tone="red" />
        <StatCard icon={MessageSquareWarning} label="Complaints" numericValue={districtComplaints} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => navigate("/ida/projects")}
          className="flex items-center justify-between rounded-xl2 border border-ink-200 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover"
        >
          <div>
            <p className="font-display text-sm font-bold text-ink-900">Assigned Projects</p>
            <p className="mt-0.5 text-xs text-ink-500">View and monitor projects assigned to your agency</p>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </button>
        <button
          onClick={() => navigate("/ida/verification")}
          className="flex items-center justify-between rounded-xl2 border border-ink-200 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover"
        >
          <div className="flex items-center gap-2">
            <UploadCloud size={16} className="text-brand-600" />
            <div>
              <p className="font-display text-sm font-bold text-ink-900">Field Verification</p>
              <p className="mt-0.5 text-xs text-ink-500">{summary.active} in-progress projects awaiting evidence</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </button>
        <button
          onClick={() => navigate("/ida/complaints")}
          className="flex items-center justify-between rounded-xl2 border border-ink-200 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover"
        >
          <div>
            <p className="font-display text-sm font-bold text-ink-900">Review Complaints</p>
            <p className="mt-0.5 text-xs text-ink-500">{districtComplaints} citizen complaints for this district</p>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </button>
      </div>

      <div className="rounded-xl2 border border-brand-200 bg-brand-50 px-4 py-3.5 text-sm text-brand-800">
        AI-assisted risk analysis highlights projects requiring review — it does not replace the Authority's
        judgment. <Button variant="subtle" size="sm" className="ml-1 inline-flex" onClick={() => navigate("/ida/risk")}>View Risk Overview</Button>
      </div>
    </div>
  );
}

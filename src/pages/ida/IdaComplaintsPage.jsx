import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { ComplaintsTable } from "../ComplaintPage";

export default function IdaComplaintsPage() {
  const { profile } = useAuth();
  const { complaints, updateComplaintStatus } = useDataStore();

  const scoped = useMemo(
    () => complaints.filter((c) => c.districtCode === profile?.districtCode),
    [complaints, profile]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Complaints — {profile?.district}</h1>
        <p className="mt-1 text-sm text-ink-500">Citizen complaints filed for projects in your district.</p>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">{scoped.length} Complaints</h3>
        </div>
        <ComplaintsTable complaints={scoped} editable onStatusChange={updateComplaintStatus} />
      </div>
    </div>
  );
}

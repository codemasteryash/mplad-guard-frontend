import { useMemo, useState } from "react";
import { UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { useToast } from "../../context/ToastContext";
import { getUnassignedProjects } from "../../data/idaData";
import IdaProjectTable from "../../components/ida/IdaProjectTable";
import AssignIAModal from "../../components/ida/AssignIAModal";
import { EmptyState } from "../../components/common/EmptyState";

export default function IdaAssignAgencyPage() {
  const { profile } = useAuth();
  const { assignImplementingAgency, updateProjectStatus, projectVersion } = useDataStore();
  const { push } = useToast();
  const [assignTarget, setAssignTarget] = useState(null);


  const pending = useMemo(() => getUnassignedProjects(profile?.districtCode), [profile, projectVersion]);

  const handleAssign = (projectId, assignment) => {
    assignImplementingAgency(projectId, assignment);
    setAssignTarget(null);
    push(`Implementing Agency assigned successfully — ${assignment.agency}`, "success");
  };

  const handleFlag = (project) => {
    updateProjectStatus(project.id, "Delayed");
    push(`${project.projectId} flagged for review`, "warning");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Assign Implementing Agency</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sanctioned works in {profile?.district} awaiting an assigned Implementing Agency.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">{pending.length} Awaiting Assignment</h3>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon={UserCog} title="All caught up" description="No projects are currently awaiting IA assignment in your district." />
        ) : (
          <IdaProjectTable projects={pending} onAssign={setAssignTarget} onFlag={handleFlag} />
        )}
      </div>

      <AssignIAModal open={!!assignTarget} project={assignTarget} onClose={() => setAssignTarget(null)} onAssign={handleAssign} />
    </div>
  );
}

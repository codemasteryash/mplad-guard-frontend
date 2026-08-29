import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardList, CheckCircle2, Clock3, Wallet, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDataStore } from "../context/DataStoreContext";
import { useToast } from "../context/ToastContext";
import { STATES, WORK_CATEGORIES, IMPLEMENTING_AGENCIES, getProjectById } from "../data/mockData";
import { formatFullINR, formatDate, classNames } from "../utils/format";
import StatCard from "../components/common/StatCard";
import { StatusBadge } from "../components/common/Badge";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";

const ANNUAL_ENTITLEMENT = 50000000; // ₹5 Cr/year, per real MPLADS norms

function NewRecommendationForm({ onSubmit, districts }) {
  const [form, setForm] = useState({
    name: WORK_CATEGORIES[0].label,
    district: districts[0]?.name || "",
    assignedIA: IMPLEMENTING_AGENCIES[0],
    amountRequested: "",
    justification: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amountRequested: Number(form.amountRequested) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Project / Work Category *</span>
        <select
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        >
          {WORK_CATEGORIES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">District *</span>
        <select
          value={form.district}
          onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
          required
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        >
          {districts.map((d) => (
            <option key={d.code} value={d.name}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Implementing Agency *</span>
        <select
          value={form.assignedIA}
          onChange={(e) => setForm((f) => ({ ...f, assignedIA: e.target.value }))}
          required
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        >
          {IMPLEMENTING_AGENCIES.map((ia) => (
            <option key={ia} value={ia}>
              {ia}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Amount Requested (₹) *</span>
        <input
          type="number"
          min="1"
          value={form.amountRequested}
          onChange={(e) => setForm((f) => ({ ...f, amountRequested: e.target.value }))}
          required
          placeholder="e.g. 2500000"
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Justification *</span>
        <textarea
          value={form.justification}
          onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
          required
          rows={3}
          placeholder="Why is this project needed in this constituency?"
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
        />
      </label>

      <Button type="submit" className="w-full" size="lg">
        Submit Recommendation
      </Button>
    </form>
  );
}

export default function RecommendationPage() {
  const { profile } = useAuth();
  const { recommendations, addRecommendation } = useDataStore();
  const { push } = useToast();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const districts = STATES.find((s) => s.name === profile?.state)?.districts || [];
  // Demo dataset is single-persona (no multi-MP separation) — every MP sees the
  // full shared recommendation list, same as the mockup's table. New
  // submissions are still tagged with the logged-in MP's state for realism.
  const myRecommendations = recommendations;

  const stats = useMemo(() => {
    const total = myRecommendations.length;
    const approved = myRecommendations.filter((r) => r.status === "Approved").length;
    const pending = myRecommendations.filter((r) => r.status === "Pending").length;
    const totalRequested = myRecommendations.reduce((s, r) => s + (r.amountRequested || 0), 0);
    return { total, approved, pending, totalRequested };
  }, [myRecommendations]);

  const entitlementPct = Math.min(100, Math.round((stats.totalRequested / ANNUAL_ENTITLEMENT) * 100));

  const handleSubmit = (payload) => {
    addRecommendation({
      ...payload,
      state: profile?.state,
    });
    setModalOpen(false);
    push("Recommendation submitted for District Authority approval.", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">MP Project Recommendations</h1>
          <p className="mt-1 text-sm text-ink-500">
            Recommend new projects and track them through DA sanction and IA execution.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          New Recommendation
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total Recommended" numericValue={stats.total} tone="navy" />
        <StatCard icon={CheckCircle2} label="Approved" numericValue={stats.approved} tone="green" />
        <StatCard icon={Clock3} label="Pending DA Approval" numericValue={stats.pending} tone="amber" />
        <StatCard icon={Wallet} label="Amount Requested" value={formatFullINR(stats.totalRequested)} tone="purple" />
      </div>

      <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-700">Annual entitlement utilized</span>
          <span className="text-ink-500">
            {formatFullINR(stats.totalRequested)} / {formatFullINR(ANNUAL_ENTITLEMENT)}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={classNames(
              "h-full rounded-full transition-all duration-700",
              entitlementPct >= 90 ? "bg-risk-high" : entitlementPct >= 60 ? "bg-risk-medium" : "bg-brand-500"
            )}
            style={{ width: `${entitlementPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-400">Per MPLADS norms, MPs are entitled to ₹5 Cr per year across two installments.</p>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">Recommended Projects</h3>
        </div>

        {myRecommendations.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No recommendations yet"
            description="Recommend your first project to get started."
            action={
              <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
                New Recommendation
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3 font-semibold">Project</th>
                  <th className="px-5 py-3 font-semibold">District</th>
                  <th className="px-5 py-3 font-semibold">Recommended On</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Current Stage</th>
                  <th className="px-5 py-3 font-semibold">Progress</th>
                  <th className="px-5 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {myRecommendations.map((r) => {
                  const linkedProject = r.projectId ? getProjectById(r.projectId) : null;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => linkedProject && navigate(`/project/${linkedProject.id}`)}
                      className={classNames(
                        "border-b border-ink-50",
                        linkedProject ? "cursor-pointer hover:bg-brand-50/40" : ""
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink-900">{r.name}</p>
                        <p className="text-xs text-ink-400">{r.id}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">{r.district}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-700">{formatDate(r.recommendedOn)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">{r.currentStage}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.progressPercent}%` }} />
                          </div>
                          <span className="text-xs text-ink-500">{r.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-300">{linkedProject && <ChevronRight size={16} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Project Recommendation"
        subtitle="This is sent to your District Authority for sanction."
      >
        <NewRecommendationForm onSubmit={handleSubmit} districts={districts.length ? districts : STATES[0].districts} />
      </Modal>
    </div>
  );
}

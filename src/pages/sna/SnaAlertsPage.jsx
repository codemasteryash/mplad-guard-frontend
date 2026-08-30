import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, ChevronRight, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSnaAlerts } from "../../data/snaData";
import { formatDate, classNames } from "../../utils/format";
import { EmptyState } from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import { Bell, ShieldAlert } from "lucide-react";

const SEVERITY_STYLE = {
  High: { dot: "bg-risk-high", chip: "bg-risk-highBg text-risk-high border-risk-highBorder" },
  Medium: { dot: "bg-risk-medium", chip: "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder" },
};

export default function SnaAlertsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const state = profile?.state;
  const [severity, setSeverity] = useState("");

  const alerts = useMemo(() => getSnaAlerts(state), [state]);
  const filtered = severity ? alerts.filter((a) => a.severity === severity) : alerts;
  const highCount = alerts.filter((a) => a.severity === "High").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">SNA Financial Alerts — {state}</h1>
        <p className="mt-1 text-sm text-ink-500">Fund utilization and expenditure irregularities flagged for administrative review.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Bell} label="Total Alerts" numericValue={alerts.length} tone="navy" />
        <StatCard icon={AlertTriangle} label="High Severity" numericValue={highCount} tone="red" />
        <StatCard icon={ShieldAlert} label="Medium Severity" numericValue={alerts.length - highCount} tone="amber" />
      </div>

      <div className="flex items-center gap-2">
        {["", "High", "Medium"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setSeverity(s)}
            className={classNames(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              severity === s ? "border-brand-400 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
            )}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No alerts" description="Nothing flagged for this filter." />
        ) : (
          <div className="divide-y divide-ink-50">
            {filtered.map((a) => {
              const style = SEVERITY_STYLE[a.severity];
              return (
                <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-canvas/70">
                  <span className={classNames("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink-900">{a.title}</p>
                      <span className={classNames("rounded-full border px-2 py-0.5 text-[10px] font-semibold", style.chip)}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{a.message}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                      <MapPin size={11} /> {a.location} · {formatDate(a.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/sna/mp-allocation")}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600"
                  >
                    Investigate <ChevronRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

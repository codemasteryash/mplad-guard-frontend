import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCheck,
  Search,
  AlertTriangle,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { getAllAlerts, getAlertStats } from "../data/alerts";
import { classNames } from "../utils/format";
import StatCard from "../components/common/StatCard";
import Button from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";

const READ_KEY = "mplads_sentinel_read_alerts";

function readReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const SEVERITY_STYLE = {
  High: { dot: "bg-risk-high", chip: "bg-risk-highBg text-risk-high border-risk-highBorder" },
  Medium: { dot: "bg-risk-medium", chip: "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder" },
  Low: { dot: "bg-risk-low", chip: "bg-risk-lowBg text-risk-low border-risk-lowBorder" },
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const allAlerts = useMemo(() => getAllAlerts(), []);
  const stats = useMemo(() => getAlertStats(), []);

  const [readIds, setReadIds] = useState(() => readReadIds());
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem(READ_KEY, JSON.stringify([...readIds]));
  }, [readIds]);

  const toggleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(new Set(allAlerts.map((a) => a.id)));
    push("All alerts marked as read", "success");
  };

  const filtered = useMemo(() => {
    return allAlerts.filter((a) => {
      if (severity && a.severity !== severity) return false;
      if (unreadOnly && readIds.has(a.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.projectId.toLowerCase().includes(q) &&
          !a.message.toLowerCase().includes(q) &&
          !a.district.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allAlerts, severity, unreadOnly, readIds, search]);

  const unreadCount = allAlerts.filter((a) => !readIds.has(a.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Alerts &amp; Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">Real-time flags generated from AI-detected anomalies across your scope.</p>
        </div>
        <Button variant="outline" icon={CheckCheck} onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Bell} label="Total Alerts" numericValue={stats.total} tone="navy" />
        <StatCard icon={AlertTriangle} label="High Severity" numericValue={stats.high} tone="red" />
        <StatCard icon={BellRing} label="Unread" numericValue={unreadCount} tone="amber" />
        <StatCard icon={CheckCheck} label="Resolved" numericValue={stats.resolved} tone="green" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl2 border border-ink-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project ID, district, or message..."
            className="w-full rounded-lg border border-ink-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500"
          />
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
        >
          <option value="">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button
          onClick={() => setUnreadOnly((v) => !v)}
          className={classNames(
            "flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors",
            unreadOnly ? "border-brand-400 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
          )}
        >
          <BellRing size={15} /> Unread only
        </button>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        {filtered.length === 0 ? (
          <EmptyState icon={BellOff} title="No alerts match your filters" description="Try clearing filters or search terms." />
        ) : (
          <div className="divide-y divide-ink-50">
            {filtered.slice(0, 60).map((a) => {
              const isRead = readIds.has(a.id);
              const style = SEVERITY_STYLE[a.severity];
              return (
                <div
                  key={a.id}
                  className={classNames(
                    "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-canvas/70",
                    !isRead && "bg-brand-50/25"
                  )}
                >
                  <span className={classNames("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => navigate(`/project/${encodeURIComponent(a.projectId)}`)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={classNames("text-sm", isRead ? "font-medium text-ink-700" : "font-bold text-ink-900")}>
                        {a.title}
                      </p>
                      <span className={classNames("rounded-full border px-2 py-0.5 text-[10px] font-semibold", style.chip)}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{a.message}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                      <Clock3 size={11} /> {relativeTime(a.timestamp)} · {a.projectId}
                      <ChevronRight size={12} />
                    </p>
                  </button>
                  <button
                    onClick={() => toggleRead(a.id)}
                    className="mt-1 shrink-0 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 hover:bg-ink-100"
                  >
                    {isRead ? "Mark unread" : "Mark read"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 60 && (
          <p className="border-t border-ink-100 px-5 py-3 text-center text-xs text-ink-400">
            Showing 60 of {filtered.length} alerts — refine filters to narrow down.
          </p>
        )}
      </div>
    </div>
  );
}
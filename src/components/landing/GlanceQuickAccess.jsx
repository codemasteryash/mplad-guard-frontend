import { useNavigate } from "react-router-dom";
import { Map as MapIcon, Search, FileBarChart, LogIn, ChevronRight, Users, IndianRupee, Wallet, AlertTriangle } from "lucide-react";
import { getAllProjects, getSummaryStats } from "../../data/mockData";
import { formatINR } from "../../utils/format";

const projects = getAllProjects();
const stats = getSummaryStats(projects);

const QUICK_LINKS = [
  { label: "View India Map", desc: "Explore risk levels across states and districts", icon: MapIcon, to: "/login" },
  { label: "Check Projects", desc: "Search and filter projects by region", icon: Search, to: "/login" },
  { label: "View Reports", desc: "Detailed analytics and insights", icon: FileBarChart, to: "/login" },
  { label: "Login / Register", desc: "Access your role-based account", icon: LogIn, to: "/login" },
];

const GLANCE = [
  { icon: Users, label: "Total Projects (sample dataset)", value: stats.total.toLocaleString("en-IN"), tone: "navy" },
  { icon: IndianRupee, label: "Total Allocation", value: formatINR(stats.allocated), tone: "green" },
  { icon: Wallet, label: "Total Expenditure", value: formatINR(stats.expenditure), tone: "purple" },
  { icon: AlertTriangle, label: "High Risk Projects", value: stats.high.toLocaleString("en-IN"), tone: "red" },
];

const TONE_MAP = {
  navy: "bg-navy-50 text-navy-600",
  green: "bg-risk-lowBg text-risk-low",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-risk-highBg text-risk-high",
};

export default function GlanceQuickAccess() {
  const navigate = useNavigate();

  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-ink-900">MPLADS at a Glance</h3>
          <p className="mt-1 text-sm text-ink-500">Live indicative figures from the current monitoring dataset.</p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GLANCE.map((g) => (
              <div key={g.label} className="rounded-xl border border-ink-100 bg-canvas/60 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONE_MAP[g.tone]}`}>
                  <g.icon size={16} />
                </div>
                <p className="mt-3 font-display text-xl font-bold text-ink-900">{g.value}</p>
                <p className="mt-0.5 text-xs text-ink-500">{g.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
            <h3 className="mb-3 font-display text-base font-bold text-ink-900">Quick Access</h3>
            <div className="space-y-1">
              {QUICK_LINKS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => navigate(q.to)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-canvas"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                    <q.icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{q.label}</p>
                    <p className="truncate text-xs text-ink-500">{q.desc}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-ink-300" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-indiagreen to-emerald-700 p-5 text-white shadow-card">
            <p className="font-display text-base font-bold leading-snug">
              Stronger Infrastructure for a Brighter India
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25"
            >
              Learn More <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

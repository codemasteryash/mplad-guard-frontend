import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  IndianRupee,
  Wallet,
  AlertTriangle,
  Bell,
  Search,
  Filter,
  FileDown,
  Eye,
  ArrowUpDown,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useAuth, ROLES } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { STATES, PROJECT_STATUSES } from "../data/mockData";
import { getAllProjects, getProjectsByDistrictCode, getProjectsByState, getSummaryStats } from "../data/mockData";
import { formatINR, formatFullINR, formatDate, classNames } from "../utils/format";
import StatCard from "../components/common/StatCard";
import { RiskBadge, StatusBadge } from "../components/common/Badge";
import { EmptyState, TableSkeleton } from "../components/common/EmptyState";
import Button from "../components/common/Button";

const PAGE_SIZE = 8;
const TABLE_HEADERS = [
  { key: "districtCode", label: "District Code" },
  { key: "pincode", label: "Pincode" },
  { key: "projectId", label: "Project ID" },
  { key: "assignedIA", label: "Assigned IA" },
  { key: "description", label: "Project Description" },
  { key: "amountAllocated", label: "Amount Allocated", sortable: true },
  { key: "startDate", label: "Start Date", sortable: true },
  { key: "endDate", label: "End Date", sortable: true },
  { key: "riskScore", label: "Risk Measure", sortable: true },
];

export default function DashboardPage() {
  const { role, profile } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "riskScore", dir: "desc" });

  // Citizen-only scope controls
  const [citizenLevel, setCitizenLevel] = useState(profile?.state ? "state" : "country");
  const [citizenState, setCitizenState] = useState(profile?.state || "");
  const [citizenDistrictCode, setCitizenDistrictCode] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const scopedProjects = useMemo(() => {
    if (role === ROLES.DISTRICT_AUTHORITY) return getProjectsByDistrictCode(profile?.districtCode);
    if (role === ROLES.MP) return getProjectsByState(profile?.state);
    if (role === ROLES.CITIZEN) {
      if (citizenLevel === "district" && citizenDistrictCode) {
        return getAllProjects().filter((p) => p.districtCode === citizenDistrictCode);
      }
      if (citizenLevel === "state" && citizenState) {
        return getProjectsByState(citizenState);
      }
      return getAllProjects();
    }
    return getAllProjects();
  }, [role, profile, citizenLevel, citizenState, citizenDistrictCode]);

  const filteredProjects = useMemo(() => {
    let data = [...scopedProjects];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.districtCode.includes(q) ||
          p.assignedIA.toLowerCase().includes(q)
      );
    }
    if (status) data = data.filter((p) => p.status === status);
    if (riskLevel) data = data.filter((p) => p.riskLevel === riskLevel);

    data.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "startDate" || sort.key === "endDate") {
        return (new Date(a[sort.key]) - new Date(b[sort.key])) * dir;
      }
      return (a[sort.key] - b[sort.key]) * dir;
    });
    return data;
  }, [scopedProjects, search, status, riskLevel, sort]);

  const stats = useMemo(() => getSummaryStats(scopedProjects), [scopedProjects]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const pageProjects = filteredProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, status, riskLevel, citizenLevel, citizenState, citizenDistrictCode]);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setRiskLevel("");
    setCitizenLevel(profile?.state ? "state" : "country");
    setCitizenDistrictCode("");
    push("Filters reset", "info");
  };

  const exportCSV = () => {
    const headers = TABLE_HEADERS.map((h) => h.label).concat("Status");
    const rows = filteredProjects.map((p) => [
      p.districtCode,
      p.pincode,
      p.projectId,
      p.assignedIA,
      p.description,
      p.amountAllocated,
      p.startDate,
      p.endDate,
      `${p.riskScore} (${p.riskLevel})`,
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mplads_projects_export.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    push(`Exported ${filteredProjects.length} projects to CSV`, "success");
  };

  const scopeLabel =
    role === ROLES.DISTRICT_AUTHORITY
      ? `${profile?.district || ""} District`
      : role === ROLES.MP
      ? `${profile?.state || ""} — All Constituency Districts`
      : citizenLevel === "district"
      ? STATES.flatMap((s) => s.districts).find((d) => d.code === citizenDistrictCode)?.name || "Select a district"
      : citizenLevel === "state"
      ? citizenState || "Select a state"
      : "All India";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">MPLADS Dashboard</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin size={14} /> Scope: <span className="font-semibold text-navy-700">{scopeLabel}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FileDown} onClick={exportCSV}>
            Export
          </Button>
          <Button
            variant="outline"
            icon={Bell}
            onClick={() => navigate("/alerts")}
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl2 border border-ink-200 bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Project ID / District / IA..."
                className="w-full rounded-lg border border-ink-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500"
              />
            </div>

            {role === ROLES.CITIZEN && (
              <>
                <select
                  value={citizenLevel}
                  onChange={(e) => setCitizenLevel(e.target.value)}
                  className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
                >
                  <option value="country">All India</option>
                  <option value="state">By State</option>
                  <option value="district">By District Code</option>
                </select>
                {citizenLevel === "state" && (
                  <select
                    value={citizenState}
                    onChange={(e) => setCitizenState(e.target.value)}
                    className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
                  >
                    <option value="">Select State</option>
                    {STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
                {citizenLevel === "district" && (
                  <input
                    value={citizenDistrictCode}
                    onChange={(e) => setCitizenDistrictCode(e.target.value)}
                    placeholder="Enter District Code e.g. 11001"
                    className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
                  />
                )}
              </>
            )}

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Landmark} label="Total Projects" numericValue={stats.total} tone="navy" />
        <StatCard icon={IndianRupee} label="Total Allocation" value={formatINR(stats.allocated)} tone="green" />
        <StatCard icon={Wallet} label="Total Expenditure" value={formatINR(stats.expenditure)} tone="purple" />
        <StatCard icon={AlertTriangle} label="High Risk Projects" numericValue={stats.high} tone="red" />
        <StatCard icon={Bell} label="Anomalies Detected" numericValue={stats.anomalies} tone="amber" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">All Projects</h3>
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <Filter size={13} /> {filteredProjects.length.toLocaleString("en-IN")} results
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : pageProjects.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects match your filters"
            description="Try adjusting search terms, status, or risk level."
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                      {h.sortable ? (
                        <button onClick={() => toggleSort(h.key)} className="flex items-center gap-1 hover:text-brand-600">
                          {h.label} <ArrowUpDown size={12} />
                        </button>
                      ) : (
                        h.label
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="cursor-pointer border-b border-ink-50 transition-colors hover:bg-brand-50/40"
                  >
                    <td className="px-4 py-3.5 text-ink-700">{p.districtCode}</td>
                    <td className="px-4 py-3.5 text-ink-700">{p.pincode}</td>
                    <td className="px-4 py-3.5 font-semibold text-navy-700">{p.projectId}</td>
                    <td className="px-4 py-3.5 text-ink-700">{p.assignedIA}</td>
                    <td className="max-w-[220px] truncate px-4 py-3.5 text-ink-700" title={p.description}>
                      {p.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatFullINR(p.amountAllocated)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatDate(p.startDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatDate(p.endDate)}</td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={p.riskLevel} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/project/${p.id}`);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-navy-50 hover:text-navy-700"
                        aria-label="View project"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pageProjects.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-5 py-4 sm:flex-row">
            <p className="text-xs text-ink-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredProjects.length)} of{" "}
              {filteredProjects.length.toLocaleString("en-IN")} results
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 text-xs text-ink-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Risk distribution footer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Low Risk Projects", count: stats.low, tone: "low" },
          { label: "Medium Risk Projects", count: stats.medium, tone: "medium" },
          { label: "High Risk Projects", count: stats.high, tone: "high" },
        ].map((r) => {
          const pct = stats.total ? Math.round((r.count / stats.total) * 100) : 0;
          const barColor = r.tone === "low" ? "bg-risk-low" : r.tone === "medium" ? "bg-risk-medium" : "bg-risk-high";
          return (
            <div key={r.label} className="rounded-xl2 border border-ink-200 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-700">{r.label}</p>
                <p className="font-display text-lg font-bold text-ink-900">{r.count.toLocaleString("en-IN")}</p>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div className={classNames("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-400">{pct}% of scoped projects</p>
            </div>
          );
        })}
        <div className="rounded-xl2 border border-ink-200 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink-700">Avg. Risk Score</p>
            <p className="font-display text-lg font-bold text-ink-900">{stats.avgRisk}/100</p>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={classNames(
                "h-full rounded-full transition-all duration-700",
                stats.avgRisk >= 65 ? "bg-risk-high" : stats.avgRisk >= 35 ? "bg-risk-medium" : "bg-risk-low"
              )}
              style={{ width: `${stats.avgRisk}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            {stats.avgRisk >= 65 ? "Elevated" : stats.avgRisk >= 35 ? "Moderate" : "Stable"} across scoped projects
          </p>
        </div>
      </div>
    </div>
  );
}

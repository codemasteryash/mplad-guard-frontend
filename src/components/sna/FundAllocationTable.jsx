import { useMemo, useState } from "react";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { formatFullINR, formatINR, classNames } from "../../utils/format";
import { RiskBadge } from "../common/Badge";
import Modal from "../common/Modal";
import { EmptyState } from "../common/EmptyState";

function SortHeader({ label, sortKey, onSort }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 font-semibold">
      <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 hover:text-brand-600">
        {label} <ArrowUpDown size={12} />
      </button>
    </th>
  );
}

export default function FundAllocationTable({ roster, groupBy = "mp" }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "allocatedAmount", dir: "desc" });
  const [selected, setSelected] = useState(null);

  const primaryLabel = groupBy === "mp" ? "MP" : "District";

  const filtered = useMemo(() => {
    let data = [...roster];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (m) => m.name.toLowerCase().includes(q) || m.constituency.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
    return data;
  }, [roster, search, sort]);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  return (
    <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
      <div className="flex flex-col justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center">
        <h3 className="font-display text-base font-bold text-ink-900">
          {groupBy === "mp" ? "MP-wise Fund Allocation" : "District-wise Fund Allocation"}
        </h3>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${primaryLabel.toLowerCase()} or constituency...`}
            className="w-64 rounded-lg border border-ink-200 py-2 pl-8 pr-3 text-sm focus:border-brand-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="Try a different search term." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3 font-semibold">{primaryLabel}</th>
                <th className="px-4 py-3 font-semibold">Constituency</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <SortHeader label="Total Allocation" sortKey="allocatedAmount" onSort={toggleSort} />
                <SortHeader label="Released" sortKey="releasedAmount" onSort={toggleSort} />
                <SortHeader label="Utilized" sortKey="utilizedAmount" onSort={toggleSort} />
                <SortHeader label="Remaining" sortKey="remainingAmount" onSort={toggleSort} />
                <SortHeader label="Active Projects" sortKey="activeProjects" onSort={toggleSort} />
                <SortHeader label="Completed" sortKey="completedProjects" onSort={toggleSort} />
                <th className="px-4 py-3 font-semibold">Risk Level</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.mpId} className="border-b border-ink-50 hover:bg-brand-50/30">
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-navy-700">{groupBy === "mp" ? m.name : m.district}</td>
                  <td className="px-4 py-3.5 text-ink-700">{m.constituency}</td>
                  <td className="px-4 py-3.5 text-ink-700">
                    {m.district} <span className="text-ink-400">({m.districtCode})</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatINR(m.allocatedAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatINR(m.releasedAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatINR(m.utilizedAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{formatINR(m.remainingAmount)}</td>
                  <td className="px-4 py-3.5 text-ink-700">{m.activeProjects}</td>
                  <td className="px-4 py-3.5 text-ink-700">{m.completedProjects}</td>
                  <td className="px-4 py-3.5">
                    <RiskBadge level={m.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelected(m)}
                      className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected ? `${selected.constituency}, ${selected.state}` : ""}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["House", selected.house],
                ["District", `${selected.district} (${selected.districtCode})`],
                ["Total Projects", selected.totalProjects],
                ["Avg. Risk Score", `${selected.avgRisk}/100`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-canvas px-3 py-2.5">
                  <p className="text-[11px] text-ink-500">{label}</p>
                  <p className="text-sm font-semibold text-ink-900">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink-700">Fund Summary</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Allocated", selected.allocatedAmount, "text-navy-700"],
                  ["Released", selected.releasedAmount, "text-brand-600"],
                  ["Utilized", selected.utilizedAmount, "text-risk-low"],
                  ["Remaining", selected.remainingAmount, "text-risk-medium"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg border border-ink-100 px-3 py-2.5 text-center">
                    <p className={classNames("text-sm font-bold", color)}>{formatFullINR(value)}</p>
                    <p className="text-[10px] text-ink-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2.5">
              <span className="text-sm text-ink-700">Project &amp; Anomaly Summary</span>
              <span className="text-sm font-semibold text-ink-900">
                {selected.activeProjects} active · {selected.completedProjects} completed · {selected.anomalies} anomalies
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

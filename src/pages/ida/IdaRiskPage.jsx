import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
} from "recharts";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataStore } from "../../context/DataStoreContext";
import { getProjectsByDistrictCode } from "../../data/mockData";
import { RiskBadge } from "../../components/common/Badge";

const RISK_COLORS = { Low: "#22C55E", Medium: "#F5A524", High: "#EF4444" };

export default function IdaRiskPage() {
  const { profile } = useAuth();
  const { projectVersion } = useDataStore();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const projects = useMemo(() => getProjectsByDistrictCode(profile?.districtCode), [profile, projectVersion]);

  const pieData = [
    { name: "Low", value: projects.filter((p) => p.riskLevel === "Low").length },
    { name: "Medium", value: projects.filter((p) => p.riskLevel === "Medium").length },
    { name: "High", value: projects.filter((p) => p.riskLevel === "High").length },
  ];

  const iaRisk = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (!map[p.assignedIA]) map[p.assignedIA] = { ia: p.assignedIA, totalRisk: 0, count: 0 };
      map[p.assignedIA].totalRisk += p.riskScore;
      map[p.assignedIA].count += 1;
    });
    return Object.values(map)
      .map((d) => ({ ia: d.ia, avgRisk: Math.round(d.totalRisk / d.count) }))
      .sort((a, b) => b.avgRisk - a.avgRisk);
  }, [projects]);

  const scatterData = projects.map((p) => ({ x: p.expenditurePercent, y: p.riskScore, id: p.id }));
  const topRisk = [...projects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">District Risk Overview — {profile?.district}</h1>
        <p className="mt-1 text-sm text-ink-500">Low / Medium / High risk breakdown across all sanctioned works.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Risk by Project</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((d) => (
                  <Cell key={d.name} fill={RISK_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-5 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: RISK_COLORS[d.name] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Risk by Implementing Agency</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={iaRisk} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFF5" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="ia" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="avgRisk" radius={[0, 4, 4, 0]}>
                {iaRisk.map((d, i) => (
                  <Cell key={i} fill={d.avgRisk >= 65 ? RISK_COLORS.High : d.avgRisk >= 35 ? RISK_COLORS.Medium : RISK_COLORS.Low} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card lg:col-span-2">
          <h3 className="mb-1 font-display text-base font-bold text-ink-900">Risk vs. Expenditure</h3>
          <p className="mb-4 text-xs text-ink-500">Projects where expenditure outpaces progress tend to cluster top-right — a key anomaly signal.</p>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFF5" />
              <XAxis type="number" dataKey="x" name="Expenditure %" unit="%" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Risk Score" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData} fill="#2454E6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">Top 5 Highest-Risk Projects</h3>
        </div>
        <div className="divide-y divide-ink-50">
          {topRisk.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/ida/projects/${encodeURIComponent(p.id)}`)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-brand-50/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{p.description}</p>
                <p className="text-xs text-ink-400">{p.projectId}</p>
              </div>
              <RiskBadge level={p.riskLevel} size="sm" />
              <ChevronRight size={15} className="shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStateFundSummary } from "../../data/snaData";
import FundFlowDiagram from "../../components/sna/FundFlowDiagram";

export default function SnaFundFlowPage() {
  const { profile } = useAuth();
  const state = profile?.state;
  const summary = useMemo(() => getStateFundSummary(state), [state]);


  const nodes = useMemo(() => {
    const s = summary;
    return [
      { key: "fund", label: "Central / MPLAD Fund", sublabel: "National scheme corpus (state share)", allocated: s.allocated, released: s.allocated, utilized: s.utilized, remaining: s.allocated - s.utilized },
      { key: "sna", label: `SNA — ${state}`, sublabel: "State Nodal Agency", allocated: s.allocated, released: s.released, utilized: s.utilized, remaining: s.released - s.utilized },
      { key: "mp", label: "MP / Constituency Allocation", sublabel: `${s.mpCount} constituencies`, allocated: s.released, released: Math.round(s.released * 0.93), utilized: s.utilized, remaining: Math.round(s.released * 0.93) - s.utilized },
      { key: "district", label: "District / IDA Allocation", sublabel: "Implementing District Authorities", allocated: Math.round(s.released * 0.93), released: Math.round(s.released * 0.85), utilized: s.utilized, remaining: Math.round(s.released * 0.85) - s.utilized },
      { key: "ia", label: "Implementing Agency Allocation", sublabel: "PWD, Rural Dev., Education, Health, etc.", allocated: Math.round(s.released * 0.85), released: Math.round(s.released * 0.78), utilized: s.utilized, remaining: Math.round(s.released * 0.78) - s.utilized },
      { key: "project", label: "Project Expenditure", sublabel: "Recorded on-ground spend", allocated: Math.round(s.released * 0.78), released: s.utilized, utilized: s.utilized, remaining: 0 },
    ];
  }, [summary, state]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Fund Flow — {state}</h1>
        <p className="mt-1 text-sm text-ink-500">
          Click any stage to expand its allocated / released / utilized / remaining figures.
        </p>
      </div>
      <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card sm:p-8">
        <FundFlowDiagram nodes={nodes} />
      </div>
    </div>
  );
}

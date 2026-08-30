import { useState } from "react";
import { ChevronDown, Landmark, Building2, UserRound, MapPin, HardHat, FolderKanban } from "lucide-react";
import { formatFullINR, classNames } from "../../utils/format";

const ICONS = {
  fund: Landmark,
  sna: Building2,
  mp: UserRound,
  district: MapPin,
  ia: HardHat,
  project: FolderKanban,
};

export default function FundFlowDiagram({ nodes }) {
  const [expanded, setExpanded] = useState(() => new Set(nodes.map((n) => n.key)));

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-stretch">
      {nodes.map((node, i) => {
        const Icon = ICONS[node.key] || Landmark;
        const isOpen = expanded.has(node.key);
        return (
          <div key={node.key}>
            <button
              onClick={() => toggle(node.key)}
              className="flex w-full items-center gap-4 rounded-xl2 border border-ink-200 bg-white p-4 text-left shadow-card transition-shadow hover:shadow-cardHover"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-ink-900">{node.label}</p>
                {node.sublabel && <p className="text-xs text-ink-500">{node.sublabel}</p>}
              </div>
              <div className="text-right">
                <p className="font-display text-base font-bold text-navy-700">{formatFullINR(node.allocated)}</p>
                <p className="text-[11px] text-ink-400">Allocated</p>
              </div>
              <ChevronDown size={16} className={classNames("shrink-0 text-ink-300 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="mb-1 grid grid-cols-3 gap-2 rounded-b-xl2 border border-t-0 border-ink-100 bg-canvas/60 px-4 py-3 text-center">
                <div>
                  <p className="text-sm font-semibold text-brand-600">{formatFullINR(node.released)}</p>
                  <p className="text-[10px] text-ink-500">Released</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-risk-low">{formatFullINR(node.utilized)}</p>
                  <p className="text-[10px] text-ink-500">Utilized</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-risk-medium">{formatFullINR(node.remaining)}</p>
                  <p className="text-[10px] text-ink-500">Remaining</p>
                </div>
              </div>
            )}

            {i < nodes.length - 1 && (
              <div className="flex justify-center py-1.5">
                <div className="h-6 w-px border-l-2 border-dashed border-ink-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

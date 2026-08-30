import { Landmark } from "lucide-react";

export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          dark ? "bg-white/10 text-white" : "bg-navy-700 text-white"
        }`}
      >
        <Landmark size={20} />
      </div>
      <div className="leading-tight">
        <p className={`font-display text-sm font-bold ${dark ? "text-white" : "text-navy-800"}`}>MoSPI</p>
        <p className={`text-[11px] ${dark ? "text-white/60" : "text-ink-500"}`}>
          Ministry of Statistics &amp; Programme Implementation
        </p>
      </div>
    </div>
  );
}

export function PlatformMark({ dark = false }) {
  return (
    <div className="hidden items-center gap-2 border-l border-ink-200 pl-3 sm:flex" style={dark ? { borderColor: "rgba(255,255,255,0.15)" } : undefined}>
      <div className="leading-tight">
        <p className={`font-display text-sm font-bold ${dark ? "text-white" : "text-navy-800"}`}>e-Nirikshan</p>
        <p className={`text-[11px] ${dark ? "text-white/60" : "text-ink-500"}`}>AI-Powered MPLADS Monitoring System</p>
      </div>
    </div>
  );
}

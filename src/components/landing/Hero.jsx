import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Map as MapIcon, ShieldCheck } from "lucide-react";
import Button from "../common/Button";
import IndiaOutline from "../common/IndiaOutline";

const MARKERS = [
  { x: 46, y: 30, delay: 0 },
  { x: 58, y: 42, delay: 0.4 },
  { x: 38, y: 55, delay: 0.8 },
  { x: 63, y: 60, delay: 1.2 },
  { x: 50, y: 70, delay: 1.6 },
  { x: 33, y: 40, delay: 2 },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-navy-50/50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            <ShieldCheck size={14} /> Transparent Governance · Better Tomorrow
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-navy-900 sm:text-5xl">
            <span className="text-brand-600">e-Nirikshan</span> — AI-Powered MPLADS Monitoring &amp; Anomaly Detection
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-500 sm:text-lg">
            Ensuring transparency, accountability, and efficient implementation of MPLADS projects
            across every district of India — flagged for human review, never a verdict on its own.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate("/login")} icon={ArrowRight} iconPosition="right">
              Explore Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} icon={MapIcon}>
              View Map
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-100 via-navy-50 to-transparent blur-2xl" />
          <div className="relative flex h-full w-full items-center justify-center">
            <IndiaOutline className="h-[85%] w-[85%] drop-shadow-sm" fill="#2454E6" opacity={0.16} />
            <IndiaOutline className="absolute h-[85%] w-[85%]" fill="none" />
            {MARKERS.map((m, i) => (
              <motion.span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-full bg-brand-500"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.9, 0.3, 0.9] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: m.delay }}
              >
                <span className="absolute inset-0 -m-1 rounded-full bg-brand-400/30" />
              </motion.span>
            ))}
          </div>

          <div className="absolute -right-2 top-6 rounded-xl2 border border-ink-200 bg-white/95 px-4 py-3 shadow-cardHover backdrop-blur">
            <p className="font-display text-lg font-bold text-navy-800">738</p>
            <p className="text-[11px] text-ink-500">Districts Monitored</p>
          </div>
          <div className="absolute -left-3 bottom-8 rounded-xl2 border border-ink-200 bg-white/95 px-4 py-3 shadow-cardHover backdrop-blur">
            <p className="font-display text-lg font-bold text-risk-high">1,250</p>
            <p className="text-[11px] text-ink-500">High-Risk Flags</p>
          </div>
          <p className="absolute bottom-0 right-0 max-w-[10rem] text-right font-display text-sm italic text-navy-500">
            "Development reaches every district"
          </p>
        </motion.div>
      </div>
    </section>
  );
}

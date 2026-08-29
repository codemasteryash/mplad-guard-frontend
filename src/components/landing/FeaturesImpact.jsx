import { motion } from "framer-motion";
import { MonitorSmartphone, TriangleAlert, BookOpenText, FileStack, Users2, BellRing, CheckCircle2 } from "lucide-react";

const FEATURES = [
  { icon: MonitorSmartphone, title: "Unified Dashboard", desc: "Get a bird's-eye view of projects, funds, anomalies and performance.", tone: "text-brand-600 bg-brand-50" },
  { icon: TriangleAlert, title: "Anomaly & Fraud Detection", desc: "AI models detect unusual patterns and flag them for review.", tone: "text-violet-600 bg-violet-50" },
  { icon: BookOpenText, title: "Interactive Maps", desc: "Explore risk levels by state, district and constituency.", tone: "text-risk-low bg-risk-lowBg" },
  { icon: FileStack, title: "Reports & Scorecards", desc: "Detailed reports and scorecards for projects and regions.", tone: "text-risk-medium bg-risk-mediumBg" },
  { icon: Users2, title: "Citizen Complaints", desc: "Empower citizens to report issues and track resolutions.", tone: "text-teal-600 bg-teal-50" },
  { icon: BellRing, title: "Smart Notifications", desc: "Get real-time alerts on delays, anomalies and important updates.", tone: "text-rose-600 bg-rose-50" },
];

const IMPACT = [
  "Improved transparency",
  "Timely project delivery",
  "Reduced leakages",
  "Data-driven decisions",
  "Better public trust",
];

export default function FeaturesImpact() {
  return (
    <section className="bg-canvas py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="font-display text-3xl font-extrabold text-navy-900">Powerful Features for Better Governance</h2>
          <p className="mt-2 text-ink-500">Technology-driven insights for data-backed decisions</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card transition-shadow hover:shadow-cardHover"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${f.tone}`}>
                  <f.icon size={20} />
                </div>
                <p className="mt-4 font-display text-sm font-bold text-ink-900">{f.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-ink-900">Our Impact</h3>
          <p className="mt-1 text-sm text-ink-500">Driving transparency and development</p>

          <div className="relative mt-6 h-40 overflow-hidden rounded-xl2 bg-white p-4 shadow-card">
            <svg viewBox="0 0 220 120" className="h-full w-full">
              <polyline
                points="4,96 34,80 64,88 94,52 124,64 154,24 184,36 214,8"
                fill="none"
                stroke="#2454E6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[4, 34, 64, 94, 124, 154, 184, 214].map((x, i) => {
                const ys = [96, 80, 88, 52, 64, 24, 36, 8];
                return <rect key={x} x={x - 8} y={ys[i]} width="16" height={120 - ys[i]} fill="#EBF1FF" rx="2" />;
              })}
              <polyline
                points="4,96 34,80 64,88 94,52 124,64 154,24 184,36 214,8"
                fill="none"
                stroke="#2454E6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <ul className="mt-6 space-y-3">
            {IMPACT.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-ink-700">
                <CheckCircle2 size={17} className="shrink-0 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

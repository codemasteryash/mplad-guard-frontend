import { BarChart3, ShieldAlert, MapPinned, Eye, Users2, Landmark } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: BarChart3, title: "Real-time Monitoring", desc: "Track project progress and expenditure in real-time." },
  { icon: ShieldAlert, title: "AI Anomaly Detection", desc: "Detect irregularities and suspicious patterns using AI." },
  { icon: MapPinned, title: "Risk Visualization", desc: "View risk levels on interactive maps and dashboards." },
  { icon: Eye, title: "Public Transparency", desc: "Empowering citizens with open and accessible data." },
  { icon: Users2, title: "Accountability", desc: "Better governance through tracking and verification." },
  { icon: Landmark, title: "Efficient Implementation", desc: "Ensure timely and effective project delivery." },
];

export default function FeatureStrip() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:px-8">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="text-center"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <f.icon size={20} />
            </div>
            <p className="mt-3 font-display text-sm font-semibold text-ink-900">{f.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

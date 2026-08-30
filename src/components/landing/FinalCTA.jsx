import { useNavigate } from "react-router-dom";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../common/Button";
import IndiaOutline from "../common/IndiaOutline";

const LABELS = ["Roads", "Water", "Schools", "Health", "Bridges"];

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden bg-navy-50/60 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
            Together, Let's Build a Stronger &amp; Transparent India
          </h2>
          <p className="mt-4 max-w-md text-ink-500">
            Join e-Nirikshan in ensuring every rupee creates impact and every project builds a
            better tomorrow.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/login")} icon={ArrowRight} iconPosition="right">
              Explore Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} icon={MapIcon}>
              View India Map
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <IndiaOutline className="absolute inset-0 h-full w-full" fill="#2454E6" opacity={0.12} />
          {LABELS.map((label, i) => {
            const angle = (i / LABELS.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 42;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-navy-700 shadow-card"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {label}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

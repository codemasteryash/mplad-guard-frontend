import { UserRound, ShieldCheck, Cog, TrendingUp, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { getAllProjects, STATES } from "../../data/mockData";
import { formatINR } from "../../utils/format";

const STEPS = [
  { icon: UserRound, title: "1. MP Recommends", desc: "Member of Parliament recommends development projects for their constituency.", tone: "text-brand-600 bg-brand-50" },
  { icon: ShieldCheck, title: "2. DA Approves", desc: "District Authority sanctions and approves the recommended projects.", tone: "text-risk-low bg-risk-lowBg" },
  { icon: Cog, title: "3. IA Executes", desc: "Implementing Agency executes the project as per guidelines and timelines.", tone: "text-risk-medium bg-risk-mediumBg" },
  { icon: TrendingUp, title: "4. Progress Tracking", desc: "Real-time tracking of progress, milestones, and fund utilization.", tone: "text-violet-600 bg-violet-50" },
  { icon: IndianRupee, title: "5. Expenditure Recorded", desc: "Expenditure and utilization are recorded ensuring complete transparency.", tone: "text-risk-low bg-risk-lowBg" },
];

const projects = getAllProjects();
const allocated = projects.reduce((s, p) => s + p.amountAllocated, 0);
const active = projects.filter((p) => p.status === "Work in Progress").length;

export default function HowItWorks() {
  return (
    <section id="about" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-navy-900">How MPLADS Works</h2>
          <p className="mt-2 text-ink-500">A seamless process from recommendation to impact</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-9 hidden border-t-2 border-dashed border-ink-200 lg:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white ${s.tone} shadow-panel`}>
                <s.icon size={28} />
              </div>
              <p className="mt-4 font-display text-sm font-bold text-ink-900">{s.title}</p>
              <p className="mt-1.5 max-w-[13rem] text-xs leading-relaxed text-ink-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 rounded-xl2 bg-canvas p-8 sm:grid-cols-4">
          {[
            { label: "Total Projects", value: `${projects.length.toLocaleString("en-IN")}+`, tone: "text-brand-600 bg-brand-50" },
            { label: "Allocated Funds", value: formatINR(allocated), tone: "text-risk-low bg-risk-lowBg" },
            { label: "Currently Active", value: active.toLocaleString("en-IN"), tone: "text-risk-medium bg-risk-mediumBg" },
            { label: "Districts Covered", value: STATES.reduce((s, st) => s + st.districts.length, 0), tone: "text-violet-600 bg-violet-50" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.tone}`} />
              <div>
                <p className="font-display text-xl font-bold text-ink-900">{item.value}</p>
                <p className="text-xs text-ink-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

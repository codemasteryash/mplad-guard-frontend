import { useLocation } from "react-router-dom";
import { FileBarChart, Bell, Construction } from "lucide-react";

const CONFIG = {
  "/reports": {
    icon: FileBarChart,
    title: "Reports & Investigation",
    desc: "Detailed downloadable reports, district-wise scorecards, and investigation report generation will appear here in the full build.",
  },
  "/alerts": {
    icon: Bell,
    title: "Alerts & Notifications Center",
    desc: "A full timeline of anomaly alerts, delay notifications, and escalations will appear here in the full build.",
  },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const config = CONFIG[location.pathname] || CONFIG["/reports"];

  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-600">
        <config.icon size={28} />
      </div>
      <h2 className="font-display text-xl font-bold text-ink-900">{config.title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-500">{config.desc}</p>
      <div className="mt-5 flex items-center gap-2 rounded-full bg-risk-mediumBg px-3.5 py-1.5 text-xs font-semibold text-risk-medium">
        <Construction size={13} /> Coming soon in the full build
      </div>
    </div>
  );
}

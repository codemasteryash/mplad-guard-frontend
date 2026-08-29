import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  MessageSquareWarning,
  FileBarChart,
  Bell,
  ShieldCheck,
  X,
} from "lucide-react";
import { ROLES } from "../../context/AuthContext";
import { classNames } from "../../utils/format";
import Logo from "../common/Logo";

function getNavItems(role) {
  const base = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Map View", to: "/map", icon: Map },
  ];

  if (role === ROLES.MP) {
    base.push({ label: "My Recommendations", to: "/recommendations", icon: ClipboardList });
  }
  if (role === ROLES.CITIZEN) {
    base.push({ label: "My Complaints", to: "/complaints", icon: MessageSquareWarning });
  }
  if (role === ROLES.DISTRICT_AUTHORITY) {
    base.push({ label: "Complaints Review", to: "/complaints", icon: MessageSquareWarning });
  }

  base.push({ label: "Reports", to: "/reports", icon: FileBarChart });
  base.push({ label: "Alerts", to: "/alerts", icon: Bell });

  return base;
}

export default function Sidebar({ role, open, onClose }) {
  const items = getNavItems(role);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-navy-950/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <Logo />
          <button className="text-ink-400 hover:text-ink-700 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy-700 text-white shadow-sm"
                    : "text-ink-700 hover:bg-ink-100"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-xl2 bg-navy-50 p-4">
          <div className="flex items-center gap-2 text-navy-700">
            <ShieldCheck size={18} />
            <p className="text-xs font-semibold">Decision-support only</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-navy-600/80">
            AI risk flags highlight projects for human review. They are not proof of fraud or
            wrongdoing.
          </p>
        </div>
      </aside>
    </>
  );
}

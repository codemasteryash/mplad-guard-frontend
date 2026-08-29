import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth, ROLE_LABELS } from "../../context/AuthContext";
import { classNames } from "../../utils/format";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "High risk project flagged", body: "MP/2024/00182 crossed 80 risk score", time: "12m ago", tone: "high" },
  { id: 2, title: "New complaint received", body: "Complaint filed for MP/2024/00341", time: "1h ago", tone: "medium" },
  { id: 3, title: "Recommendation approved", body: "DA approved a project in your constituency", time: "3h ago", tone: "low" },
];

export default function Topbar({ onMenuClick }) {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-ink-200 bg-canvas px-3 py-2 sm:flex">
          <Search size={16} className="text-ink-400" />
          <input
            placeholder="Search project ID, district, IA..."
            className="w-64 bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 sm:flex" aria-label="Help">
          <HelpCircle size={19} />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-risk-high" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-cardHover">
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="font-display text-sm font-semibold text-ink-900">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex gap-3 border-b border-ink-50 px-4 py-3 hover:bg-canvas">
                    <span
                      className={classNames(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.tone === "high" ? "bg-risk-high" : n.tone === "medium" ? "bg-risk-medium" : "bg-risk-low"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{n.title}</p>
                      <p className="text-xs text-ink-500">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-ink-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/alerts");
                }}
                className="w-full px-4 py-2.5 text-center text-xs font-semibold text-brand-600 hover:bg-brand-50"
              >
                View all alerts
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-2.5 hover:bg-ink-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
              {(profile?.name || "U")[0].toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight text-ink-900">{profile?.name || "User"}</p>
              <p className="text-[11px] leading-tight text-ink-500">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown size={14} className="text-ink-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-cardHover">
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold text-ink-900">{profile?.name}</p>
                <p className="text-xs text-ink-500">{ROLE_LABELS[role]}</p>
              </div>
              <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-canvas">
                <User size={15} /> View Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-risk-high hover:bg-risk-highBg"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

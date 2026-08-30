import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import Logo, { PlatformMark } from "../common/Logo";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { classNames } from "../../utils/format";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Map", to: "/map" },
  { label: "Reports", to: "/reports" },
  { label: "About", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={classNames(
        "sticky top-0 z-40 w-full border-b transition-all duration-200",
        scrolled ? "border-ink-200 bg-white/90 backdrop-blur-md shadow-panel" : "border-transparent bg-white"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
          <PlatformMark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={classNames(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === link.to
                  ? "text-brand-600"
                  : "text-ink-700 hover:text-brand-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 sm:flex"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <div className="hidden h-6 w-px bg-ink-200 sm:block" />
          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate("/dashboard")} icon={ArrowRight} iconPosition="right">
              Go to Dashboard
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
          <button
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-ink-100 bg-white px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

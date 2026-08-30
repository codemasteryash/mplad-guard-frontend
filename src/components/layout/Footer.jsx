import { Link } from "react-router-dom";
import { AtSign, Globe, Rss, Mail } from "lucide-react";
import Logo from "../common/Logo";

const QUICK_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Map", to: "/map" },
  { label: "Reports", to: "/reports" },
  { label: "About Us", to: "/#about" },
  { label: "Contact Us", to: "/#contact" },
];

const RESOURCES = [
  { label: "MPLADS Guidelines", to: "https://mplads.mospi.gov.in", external: true },
  { label: "FAQs", to: "/#faq" },
  { label: "Documents", to: "/#documents" },
  { label: "Help Center", to: "/#help" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            e-Nirikshan supports transparent, accountable, and efficient implementation of MPLADS
            projects across India through AI-assisted monitoring.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Quick Links</p>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-white/60 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Resources</p>
          <ul className="mt-4 space-y-2.5">
            {RESOURCES.map((l) =>
              l.external ? (
                <li key={l.label}>
                  <a
                    href={l.to}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Connect With Us</p>
          <div className="mt-4 flex gap-3">
            {[AtSign, Globe, Rss, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-500"
                aria-label="Social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/40">Built for Smart India Hackathon 2026 · SIH26102</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} e-Nirikshan · MoSPI, Government of India. All rights reserved.
      </div>
    </footer>
  );
}

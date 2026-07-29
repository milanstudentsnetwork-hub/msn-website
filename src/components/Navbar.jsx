import { Link, NavLink } from "react-router-dom";
import MsnLogo from "./MsnLogo";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/faq", label: "FAQ" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-msn-navy/10 bg-msn-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <MsnLogo className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight text-msn-ink">
            Milan Student Network
          </span>
        </Link>
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-msn-navy" : "text-msn-ink/60 hover:text-msn-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href="#services"
            className="rounded-full bg-msn-navy px-5 py-2.5 text-sm font-semibold text-msn-cream shadow-sm transition hover:bg-msn-navy-light"
          >
            Explore Services
          </a>
        </div>
      </nav>
    </header>
  );
}

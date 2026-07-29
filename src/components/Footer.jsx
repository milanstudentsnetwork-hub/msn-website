import { Link } from "react-router-dom";
import MsnLogo from "./MsnLogo";

export default function Footer() {
  return (
    <footer className="bg-msn-navy text-msn-cream/70">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <MsnLogo className="h-8 w-8" />
            <span className="text-base font-semibold text-msn-cream">
              Milan Student Network
            </span>
          </Link>
          <div className="flex gap-6 text-sm">
            <Link to="/events" className="hover:text-msn-cream">Events</Link>
            <Link to="/faq" className="hover:text-msn-cream">FAQ</Link>
            <a href="#services" className="hover:text-msn-cream">Services</a>
          </div>
        </div>
        <p className="mt-8 text-xs text-msn-cream/50">
          &copy; {new Date().getFullYear()} Milan Student Network. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

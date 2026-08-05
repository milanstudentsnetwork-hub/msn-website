import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-header.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/accommodation", label: "Accommodation" },
  { to: "/events", label: "Events" },
  { to: "/services", label: "Services" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin-portal")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/85 shadow-soft backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="Milan Students Network"
            className="size-11 shrink-0 transition-transform duration-300 group-hover:-rotate-6"
          />
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">Milan Students</span>
            <span className="block text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Network
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="relative rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-4 -bottom-0.5 h-1 scale-x-0 rounded-full bg-accent transition-transform duration-300 [[data-status=active]>&]:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button asChild variant="coral" size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Say hello</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="press grid size-11 place-items-center rounded-full border-2 border-primary/15 bg-card lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden"
          >
            <div className="mx-4 mb-4 rounded-3xl border border-border bg-card p-3 shadow-lift">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: link.to === "/" }}
                  className="block rounded-2xl px-4 py-3 font-display font-semibold text-foreground transition-colors hover:bg-muted data-[status=active]:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="coral" className="mt-2 w-full">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Say hello
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

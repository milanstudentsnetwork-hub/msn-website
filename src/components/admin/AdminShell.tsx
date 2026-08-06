import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminAccess } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/admin-portal/events", label: "Events" },
  { to: "/admin-portal/services", label: "Services" },
  { to: "/admin-portal/faqs", label: "FAQs" },
  { to: "/admin-portal/accommodation", label: "Accommodation" },
  { to: "/admin-portal/accommodation-requests", label: "Room Requests" },
  { to: "/admin-portal/requests", label: "Service Requests" },
  { to: "/admin-portal/messages", label: "Messages" },
  { to: "/admin-portal/settings", label: "Settings" },
] as const;

type GuardState = "checking" | "ready" | "denied";

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<GuardState>("checking");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verify() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) navigate({ to: "/admin-portal/login" });
        return;
      }

      try {
        await checkAdminAccess();
        if (active) {
          setEmail(sessionData.session.user.email ?? null);
          setState("ready");
        }
      } catch {
        await supabase.auth.signOut();
        if (active) {
          setState("denied");
          navigate({ to: "/admin-portal/login" });
        }
      }
    }

    verify();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && active) navigate({ to: "/admin-portal/login" });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [navigate]);

  if (state !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {state === "checking" ? "Checking access…" : "Redirecting…"}
      </div>
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin-portal/login" });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="font-display text-lg font-semibold">MSN Admin</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-b-2 data-[status=active]:border-accent data-[status=active]:text-foreground"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}

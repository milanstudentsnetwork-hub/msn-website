import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo-header.png";

export const Route = createFileRoute("/admin-portal/login")({
  head: () => ({ meta: [{ title: "Admin Sign In | Milan Students Network" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    navigate({ to: "/admin-portal/events" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-lift"
      >
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Milan Students Network"
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div>
            <h1 className="font-display text-lg font-semibold">Admin Sign In</h1>
            <p className="text-xs text-muted-foreground">Milan Students Network</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-6 w-full">
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}

import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

// Wraps requireSupabaseAuth: after confirming the caller has a valid Supabase
// session, also confirms they hold the 'admin' app_role via the is_admin()
// RPC (SECURITY DEFINER, checks user_roles for auth.uid()). Uses the caller's
// own session-scoped client, so this still runs under RLS rather than
// bypassing it with a service-role key.
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("is_admin");
    if (error) throw new Error(`Admin check failed: ${error.message}`);
    if (!data) throw new Error("Unauthorized: admin role required");
    return next();
  });

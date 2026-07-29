import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MsnLogo from "../components/MsnLogo";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate("/admin-portal", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    const redirectTo = location.state?.from || "/admin-portal";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-msn-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-msn-navy/10 bg-white p-8 shadow-sm"
      >
        <MsnLogo className="h-10 w-10" />
        <h1 className="mt-4 text-xl font-semibold text-msn-ink">Admin Sign In</h1>
        <p className="mt-1 text-sm text-msn-ink/60">Milan Student Network CMS</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-msn-ink/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-msn-navy/20 px-3 py-2 text-sm focus:border-msn-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-msn-ink/80">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-msn-navy/20 px-3 py-2 text-sm focus:border-msn-gold focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-msn-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-msn-navy-light disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

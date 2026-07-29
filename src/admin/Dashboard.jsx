import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { to: "/admin-portal/events", label: "Events" },
  { to: "/admin-portal/faqs", label: "FAQs" },
  { to: "/admin-portal/layout", label: "Homepage Layout" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">MSN Admin</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 px-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `rounded-t-md px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-slate-500 hover:text-slate-800"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Auth";
import { apiFetch } from "../lib/api";
const menus = {
  teacher: [
    ["Overview", ""],
    ["Exams", "exams"],
    ["Question bank", "questions"],
    ["Students", "students"],
    ["Attempts", "attempts"],
    ["Results", "results"],
    ["Settings", "settings"],
  ],
  student: [
    ["Overview", ""],
    ["Exams", "exams"],
    ["Results", "results"],
    ["Profile", "profile"],
  ],
};
export function Brand({ inverse = false }) {
  return (
    <div className={`ep-brand ${inverse ? "ep-brand-inverse" : ""}`}>
      <span className="ep-monogram">EP</span>
      <b>ExamPortal</b>
    </div>
  );
}
export default function PortalLayout({ role }) {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const location = useLocation();
  const examMode = /\/student\/exams\/[^/]+$/.test(location.pathname);
  const logout = async () => {
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`ep-portal ${examMode ? "ep-exam-mode" : ""}`}>
      <header className="ep-topbar">
        <Brand />
        <span className="ep-workspace">{role} workspace</span>
        <button
          className="ep-menu"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="portal-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>
      <div className="ep-workspace-layout">
        <aside
          id="portal-menu"
          className={`ep-sidebar ${open ? "is-open" : ""}`}
        >
          <small className="ep-nav-caption">WORKSPACE</small>
          <nav>
            {menus[role].map(([label, path]) => (
              <NavLink
                key={label}
                to={`/${role}${path ? "/" + path : ""}`}
                end={!path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ep-account">
            <b>{user.name}</b>
            <small>{user.email}</small>
            <button onClick={logout} disabled={busy}>
              {busy ? "Signing out…" : "Log out"}
            </button>
            {error && <p role="alert">{error}</p>}
          </div>
        </aside>
        <main className="ep-main">
          <Outlet />
        </main>
      </div>
      {role === "student" && !examMode && (
        <nav className="ep-mobile-nav" aria-label="Primary navigation">
          {menus.student.map(([label, path]) => (
            <NavLink
              key={label}
              end={!path}
              to={`/student${path ? "/" + path : ""}`}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

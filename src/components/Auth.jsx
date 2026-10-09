import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Brand } from "./PortalLayout";
const Context = createContext(null);
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setUser(await apiFetch("/api/auth/me"));
    } catch (e) {
      if (e.status === 401) setUser(null);
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  return (
    <Context.Provider value={{ user, setUser, loading, error, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function Protected({ role, children }) {
  const { user, loading, error, refresh } = useAuth();
  if (loading) return <p className="p-8">Loading your account…</p>;
  if (error)
    return (
      <div className="p-8">
        <p role="alert">{error}</p>
        <button onClick={refresh}>Try again</button>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}
export function Login() {
  const { user, setUser, loading, error: connectionError, refresh } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (loading) return <p className="p-8">Loading…</p>;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const account = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(account);
      navigate(`/${account.role}`, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="ep-login">
      <section className="ep-login-identity">
        <Brand inverse />
        <div className="ep-login-story">
          <small>EXAMPORTAL</small>
          <h1>
            Your next exam.
            <br />
            One place.
          </h1>
          <p>
            A workspace for students and teachers.
            <br />
            Nothing between you and the work.
          </p>
        </div>
        <p className="ep-login-footnote">
          Focus on the question in front of you.
        </p>
      </section>
      <section className="ep-login-content">
        <form onSubmit={submit} className="ep-login-form">
          <small className="ep-eyebrow">WELCOME BACK</small>
          <h2>Sign in to ExamPortal</h2>
          <p>Use the account provided by your teacher.</p>
          {(error || connectionError) && (
            <p role="alert" className="text-red-700">
              {error || connectionError}
            </p>
          )}
          {connectionError && (
            <button type="button" onClick={refresh}>
              Retry connection
            </button>
          )}
          <label>
            Account
            <input
              required
              type="text"
              autoComplete="username"
              placeholder="teacher@examportal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy} className="ep-button">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <small>Need an account? Contact your teacher.</small>
        </form>
      </section>
    </main>
  );
}

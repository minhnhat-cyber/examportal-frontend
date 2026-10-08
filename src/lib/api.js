export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/backend").replace(/\/$/, "");

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/api/auth/")) window.dispatchEvent(new Event("session-expired"));
    const error = new Error(body.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return body;
}

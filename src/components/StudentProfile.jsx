import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ErrorMessage, inputClass, PageHeader } from "./StudentUI";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/student/profile")
      .then((data) => {
        setProfile(data);
        setName(data.name);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await apiFetch("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({ name, currentPassword, newPassword }),
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Profile updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading your profile…</p>;
  if (!profile) return <ErrorMessage message={error || "Your profile could not be loaded."} />;

  return (
    <>
      <PageHeader title="Profile" description="Your account details and exam summary." />
      <ErrorMessage message={error} />
      {notice && (
        <p className="mb-5 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Attempts</p>
          <p className="mt-1 text-3xl font-bold">{profile.totalAttempts}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-1 text-3xl font-bold">{profile.completedAttempts}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Average score</p>
          <p className="mt-1 text-3xl font-bold">{profile.averageScore}%</p>
        </div>
      </section>

      <form onSubmit={save} className="max-w-xl rounded border border-slate-200 bg-white p-6">
        <label className="block text-sm font-semibold">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-500">
          Email
          <input value={profile.email} disabled className={`${inputClass} bg-slate-50`} />
        </label>

        <fieldset className="mt-6 border-t border-slate-200 pt-5">
          <legend className="text-sm font-bold">Change password</legend>
          <p className="mb-3 text-sm text-slate-500">Leave blank to keep your current password.</p>

          <label className="block text-sm font-semibold">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="mt-4 block text-sm font-semibold">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </label>
        </fieldset>

        <button
          disabled={saving}
          className="mt-6 rounded bg-violet-700 px-5 py-2.5 text-sm font-bold text-white disabled:bg-slate-300"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
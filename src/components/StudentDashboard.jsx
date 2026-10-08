import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";

const stats = [
  ["Open now", "openExams", ""],
  ["Completed", "completedExams", ""],
  ["Average score", "averageScore", "%"],
  ["Best score", "bestScore", "%"],
];

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/dashboard/student")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading your dashboard…</p>;
  if (!data) return <ErrorMessage message={error || "Your dashboard could not be loaded."} />;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${data.student.name.split(" ")[0]}`}
        description="Your exams and results at a glance."
      />
      <ErrorMessage message={error} />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, key, suffix]) => (
          <div key={key} className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold">
              {data.statistics[key]}
              {suffix}
            </p>
          </div>
        ))}
      </section>

      {data.inProgress && (
        <section className="mb-6 rounded border border-violet-300 bg-violet-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Exam in progress</p>
          <h2 className="mt-1 text-lg font-bold">{data.inProgress.examTitle}</h2>
          <p className="text-sm text-violet-900">Started {new Date(data.inProgress.startedAt).toLocaleString()}</p>
          <Link
            to={`/student/exams/${data.inProgress.id}`}
            className="mt-4 inline-block rounded bg-violet-700 px-4 py-2 text-sm font-bold text-white"
          >
            Resume exam
          </Link>
        </section>
      )}

      <section className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="font-bold">Recent results</h2>
          <Link to="/student/results" className="text-sm font-semibold text-violet-700">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-slate-200">
          {data.recentResults.map((attempt) => (
            <li key={attempt.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <b className="block">{attempt.examTitle}</b>
                <small className="text-slate-500">
                  {attempt.examCode} · attempt #{attempt.attemptNumber}
                </small>
              </div>
              <span className="text-xl font-bold">{attempt.percentage}%</span>
            </li>
          ))}
          {!data.recentResults.length && (
            <li className="p-8 text-center text-slate-500">No completed exams yet.</li>
          )}
        </ul>
      </section>
    </>
  );
}
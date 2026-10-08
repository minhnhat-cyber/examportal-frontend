import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";

const date = (value) => (value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function StudentResults() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/student/attempts")
      .then((data) => setItems(data.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading your results…</p>;

  return (
    <>
      <PageHeader title="My Results" description="Every exam you have attempted, newest first." />
      <ErrorMessage message={error} />

      <section className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                {["Exam", "Attempt", "Started", "Submitted", "Score", "Status", ""].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((attempt) => (
                <tr key={attempt.id} className="border-t border-slate-200">
                  <td className="px-4 py-4">
                    <b className="block text-violet-700">{attempt.examTitle}</b>
                    <small className="text-slate-500">{attempt.examCode} · {attempt.examSubject}</small>
                  </td>
                  <td className="px-4">#{attempt.attemptNumber}</td>
                  <td className="px-4 text-xs">{date(attempt.startedAt)}</td>
                  <td className="px-4 text-xs">{date(attempt.submittedAt)}</td>
                  <td className="px-4 font-bold">
                    {attempt.percentage === null ? "—" : `${attempt.percentage}%`}
                  </td>
                  <td className="px-4">
                    <span className="capitalize">{attempt.status.replace("_", " ")}</span>
                    {attempt.autoSubmitted && <small className="block text-slate-500">timed out</small>}
                  </td>
                  <td className="px-4">
                    <Link
                      to={`/student/exams/${attempt.id}`}
                      className="rounded border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-700"
                    >
                      {attempt.status === "submitted" ? "Review" : "Resume"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!items.length && !error && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    You have not attempted any exams yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";

const buttonLabels = {
  open: "Start exam",
  upcoming: "Not yet open",
  closed: "Closed",
};

export default function StudentExams() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/student/exams")
      .then((data) => setItems(data.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const start = async (exam) => {
    if (!window.confirm(`Start or resume ${exam.title}? Duration: ${exam.durationMinutes} minutes. The timer continues if you leave the page. Make sure you have a stable connection.`)) return;
    setStarting(exam.id);
    setError("");
    try {
      const attempt = await apiFetch("/api/attempts", {
        method: "POST",
        body: JSON.stringify({ examId: exam.id }),
      });
      navigate(`/student/exams/${attempt.id}`);
    } catch (e) {
      setError(e.message);
      setStarting("");
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading exams…</p>;

  return (
    <>
      <PageHeader title="Available Exams" description="Exams you can take, and what's coming up." />
      <ErrorMessage message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((exam) => (
          <article key={exam.id} className="rounded border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">{exam.code}</p>
            <h2 className="mt-1 text-lg font-bold">{exam.title}</h2>
            <p className="text-sm text-slate-500">{exam.subject}</p>

            <dl className="mt-4 flex gap-6 text-sm">
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-semibold">{exam.durationMinutes} min</dd>
              </div>
              <div>
                <dt className="text-slate-500">Questions</dt>
                <dd className="font-semibold">{exam.questionCount}</dd>
              </div>
            </dl>
            <div className="mt-4 space-y-1 text-xs text-slate-600"><p>Opens: {new Date(exam.opensAt).toLocaleString()}</p><p>Closes: {new Date(exam.closesAt).toLocaleString()}</p><p>Times shown in your local timezone.</p></div>

            <button
              onClick={() => start(exam)}
              disabled={!exam.canStart || starting === exam.id}
              className="mt-5 w-full rounded bg-violet-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {starting === exam.id ? "Starting…" : buttonLabels[exam.availability]}
            </button>
          </article>
        ))}
      </div>

      {!items.length && !error && (
        <p className="rounded border border-slate-200 bg-white p-8 text-center text-slate-500">
          No exams are available right now.
        </p>
      )}
    </>
  );
}


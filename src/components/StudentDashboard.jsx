import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";
const stats = [
  ["Open exam", "openExams", ""],
  ["Completed", "completedExams", ""],
  ["Average score", "averageScore", "%"],
  ["Best score", "bestScore", "%"],
];
const date = (v) =>
  new Date(v).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
export default function StudentDashboard() {
  const [data, setData] = useState(null),
    [exams, setExams] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    apiFetch("/api/dashboard/student")
      .then(setData)
      .catch((e) => setError(e.message));
    apiFetch("/api/student/exams")
      .then((d) => setExams(d.items))
      .catch((e) => setError(e.message));
  }, []);
  const start = async (exam) => {
    if (!confirm(`Start ${exam.title}? The timer continues if you leave.`))
      return;
    setBusy(true);
    try {
      const a = await apiFetch("/api/attempts", {
        method: "POST",
        body: JSON.stringify({ examId: exam.id }),
      });
      navigate(`/student/exams/${a.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return error ? (
      <ErrorMessage message={error} />
    ) : (
      <p>Loading your dashboard…</p>
    );
  const featured = data.inProgress
    ? exams.find(
        (e) =>
          e.id === data.inProgress.examId ||
          e.title === data.inProgress.examTitle,
      )
    : exams.find((e) => e.canStart);
  const upcoming = exams.filter((e) => e.availability === "upcoming");
  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })}
        title={
          <>
            <span className="ep-desktop-greeting">
              Good morning, {data.student.name.split(" ")[0]}.
            </span>
            <span className="ep-mobile-greeting">
              Hello, {data.student.name.split(" ")[0]}.
            </span>
          </>
        }
        description={`${data.statistics.openExams} exam${data.statistics.openExams === 1 ? " is" : "s are"} open. Pick up where you left off.`}
      />
      <ErrorMessage message={error} />
      <section className="ep-statistics">
        {stats.map(([label, key, suffix]) => (
          <div key={key}>
            <strong>
              {data.statistics[key] == null ||
              (suffix && !data.statistics.completedExams)
                ? "—"
                : `${suffix ? data.statistics[key] : String(data.statistics[key]).padStart(2, "0")}${suffix}`}
            </strong>
            <small>{label}</small>
          </div>
        ))}
      </section>
      <div className="ep-feature-grid">
        <article className="ep-feature-exam">
          {featured || data.inProgress ? (
            <>
              <div className="ep-exam-meta">
                <span className="ep-status">
                  {data.inProgress ? "In progress" : "Open now"}
                </span>
                <small>{featured?.code}</small>
              </div>
              <h2>{featured?.title || data.inProgress.examTitle}</h2>
              {featured && (
                <>
                  <p>
                    {featured.subject} · {featured.durationMinutes} minutes ·{" "}
                    {featured.questionCount} questions
                  </p>
                  <div className="ep-divider" />
                  <small>
                    {new Date(featured.opensAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                    –
                    {new Date(featured.closesAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · closes at{" "}
                    {new Date(featured.closesAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                  </small>
                </>
              )}
              <div className="ep-feature-action">
                {data.inProgress ? (
                  <Link
                    className="ep-button"
                    to={`/student/exams/${data.inProgress.id}`}
                  >
                    Resume exam
                  </Link>
                ) : (
                  <button
                    disabled={busy}
                    className="ep-button"
                    onClick={() => start(featured)}
                  >
                    {busy ? "Starting…" : "Start exam"}
                  </button>
                )}
                <small>Your timer continues when you leave.</small>
              </div>
            </>
          ) : (
            <>
              <h2>You're all caught up.</h2>
              <p>No open exams right now. Check what's coming up below.</p>
              <Link to="/student/exams" className="ep-text-link">
                View all exams →
              </Link>
            </>
          )}
        </article>
        <aside className="ep-before">
          <h2>Before you begin</h2>
          <ol>
            <li>Find a quiet place.</li>
            <li>Check your connection.</li>
            <li>Keep this browser tab open.</li>
          </ol>
          <small>Your answers are saved as you go.</small>
        </aside>
      </div>
      <section className="ep-upcoming">
        <header>
          <h2>Coming up</h2>
          <Link to="/student/exams">View all exams →</Link>
        </header>
        {upcoming.map((exam) => (
          <div className="ep-upcoming-row" key={exam.id}>
            <div className="ep-date-tile">
              <b>{new Date(exam.opensAt).getDate()}</b>
              <small>
                {new Date(exam.opensAt).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </small>
            </div>
            <div>
              <h3>{exam.title}</h3>
              <p>
                {exam.durationMinutes} minutes · {exam.questionCount} questions
                · Opens {date(exam.opensAt)}
              </p>
            </div>
            <span className="ep-status ep-status-warm">Upcoming</span>
          </div>
        ))}
        {!upcoming.length && (
          <p className="ep-empty-inline">No upcoming exams scheduled.</p>
        )}
      </section>
      {data.recentResults.length ? (
        <section className="ep-recent">
          <header>
            <h2>Recent results</h2>
            <Link to="/student/results">View all →</Link>
          </header>
          {data.recentResults.map((a) => (
            <div className="ep-upcoming-row" key={a.id}>
              <div>
                <h3>{a.examTitle}</h3>
                <small>
                  {a.examCode} · attempt #{a.attemptNumber}
                </small>
              </div>
              <strong>{a.percentage}%</strong>
            </div>
          ))}
        </section>
      ) : (
        <p className="ep-empty-inline">
          No completed exams yet. Your results will appear here after
          submission.
        </p>
      )}
    </>
  );
}

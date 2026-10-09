import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";

const letters = ["A", "B", "C", "D"];
const pad = (n) => String(n).padStart(2, "0");
const formatClock = (total) =>
  `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;

export default function TakeExam() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Stops the autosave firing on first load, before anything has changed.
  const dirty = useRef(false);
  // The timer's callback would otherwise close over a stale `answers`.
  const answersRef = useRef({});
  // Guards against submitting twice (button click racing the countdown).
  const submitted = useRef(false);

  answersRef.current = answers;

  const load = useCallback(async () => {
    try {
      const d = await apiFetch(`/api/attempts/${attemptId}`);
      setData(d);
      setAnswers(d.answers || {});
      setSecondsLeft(d.remainingSeconds ?? 0);
      submitted.current = d.attempt?.status === "submitted";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          answers: Object.entries(answersRef.current).map(
            ([questionId, selectedOption]) => ({
              questionId,
              selectedOption,
            }),
          ),
        }),
      });
      dirty.current = false;
      await load();
    } catch (e) {
      setError(e.message);
      submitted.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, load]);

  const isLive = data?.attempt?.status === "in_progress";

  // The countdown. This is display only — the real deadline is expiresAt in
  // the database, and the server re-checks it on every save and on submit.
  useEffect(() => {
    if (!isLive || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isLive, secondsLeft, submit]);

  // Autosave, debounced: a burst of clicks sends one request, not one each.
  useEffect(() => {
    if (!dirty.current || !isLive) return;
    setSaveState("saving");

    const timer = setTimeout(() => {
      apiFetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        body: JSON.stringify({
          answers: Object.entries(answers).map(
            ([questionId, selectedOption]) => ({
              questionId,
              selectedOption,
            }),
          ),
        }),
      })
        .then(() => setSaveState("saved"))
        .catch((e) => {
          setError(e.message);
          setSaveState("");
        });
    }, 800);

    return () => clearTimeout(timer);
  }, [answers, attemptId, isLive]);

  // A refresh mid-exam looks like a crash otherwise.
  useEffect(() => {
    if (!isLive) return;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isLive]);

  const choose = (questionId, option) => {
    dirty.current = true;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  if (loading) return <p className="text-sm text-slate-500">Loading exam…</p>;
  if (!data)
    return (
      <ErrorMessage message={error || "This attempt could not be loaded."} />
    );

  const { exam, questions, attempt } = data;

  // ── Result view ───────────────────────────────────────────────────────────
  if (attempt.status === "submitted") {
    return (
      <>
        <PageHeader
          eyebrow={exam?.code || "Result"}
          title={exam?.title || "Exam"}
          description={
            attempt.autoSubmitted
              ? "Submitted automatically when the time ran out."
              : `Submitted ${new Date(attempt.submittedAt).toLocaleString()}`
          }
          action={
            <Link
              to="/student/results"
              className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              All results
            </Link>
          }
        />
        <ErrorMessage message={error} />

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm text-violet-900">Score</p>
            <p className="mt-1 text-3xl font-bold text-violet-900">
              {attempt.percentage}%
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Points</p>
            <p className="mt-1 text-3xl font-bold">
              {attempt.score}{" "}
              <span className="text-lg font-normal text-slate-400">
                / {attempt.totalPoints}
              </span>
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Correct</p>
            <p className="mt-1 text-3xl font-bold">
              {attempt.correctCount}{" "}
              <span className="text-lg font-normal text-slate-400">
                / {attempt.questionCount}
              </span>
            </p>
          </div>
        </section>

        <div className="space-y-4">
          {questions.map((question, i) => (
            <article
              key={question.id}
              className="rounded border border-slate-200 bg-white p-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Question {i + 1}
                </p>
                <span
                  className={`text-xs font-bold ${question.isCorrect ? "text-emerald-700" : "text-red-700"}`}
                >
                  {question.isCorrect ? "Correct" : "Incorrect"} ·{" "}
                  {question.earnedPoints}/{question.points}
                </span>
              </div>
              <h2 className="mt-2 font-bold">{question.text}</h2>

              <ul className="mt-4 space-y-2">
                {question.options.map((option, o) => {
                  const isCorrect = o === question.correctOption;
                  const isChosen = o === question.selectedOption;
                  return (
                    <li
                      key={o}
                      className={`flex items-center gap-3 rounded border p-3 text-sm ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : isChosen
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200"
                      }`}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-slate-300 text-xs font-bold">
                        {letters[o]}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isCorrect && (
                        <span className="text-xs font-bold text-emerald-700">
                          Correct answer
                        </span>
                      )}
                      {isChosen && !isCorrect && (
                        <span className="text-xs font-bold text-red-700">
                          Your answer
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {question.selectedOption === null && (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  You did not answer this question.
                </p>
              )}
            </article>
          ))}
        </div>
      </>
    );
  }
  // ── Live exam ─────────────────────────────────────────────────────────────
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.length - answeredCount;
  const low = secondsLeft !== null && secondsLeft <= 300;

  const confirmSubmit = () => {
    const warning = unanswered
      ? `${unanswered} question${unanswered === 1 ? "" : "s"} still unanswered. Submit anyway?`
      : "Submit your answers? You cannot change them afterwards.";
    if (window.confirm(warning)) submit();
  };

  if (!question)
    return (
      <ErrorMessage message="This exam has no questions. Contact your teacher." />
    );
  return (
    <div className="ep-take-exam">
      <header className="ep-exam-heading">
        <span>
          {exam?.title} / {exam?.code}
        </span>
        <strong className={low ? "text-red-700" : ""}>
          {secondsLeft === null ? "--:--" : formatClock(secondsLeft)} remaining
        </strong>
      </header>
      <ErrorMessage message={error} />
      {low && (
        <p role="status" className="mb-5 text-red-700">
          Less than five minutes left. The exam submits when time runs out.
        </p>
      )}
      <div className="ep-exam-grid">
        <section className="ep-question">
          <p className="ep-eyebrow">
            QUESTION {pad(index + 1)} / {pad(questions.length)}
          </p>
          <h1>{question.text}</h1>
          <p className="ep-question-instruction">
            Select one answer. {question.points}{" "}
            {question.points === 1 ? "point" : "points"}.
          </p>
          <div className="ep-options">
            {question.options.map((option, i) => (
              <button
                key={i}
                aria-pressed={answers[question.id] === i}
                className={answers[question.id] === i ? "is-selected" : ""}
                onClick={() => choose(question.id, i)}
              >
                <span>{letters[i]}</span>
                {option}
              </button>
            ))}
          </div>
          <div className="ep-question-navigation">
            <button
              className="ep-button ep-button-secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Previous
            </button>
            <button
              className="ep-button"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Next question
            </button>
          </div>
        </section>
        <aside className="ep-exam-progress">
          <h2>Your progress</h2>
          <p>
            {answeredCount} of {questions.length} answered
          </p>
          <nav aria-label="Question navigation">
            {questions.map((q, i) => (
              <button
                key={q.id}
                aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ""}`}
                aria-current={i === index ? "step" : undefined}
                className={
                  i === index
                    ? "is-current"
                    : answers[q.id] !== undefined
                      ? "is-answered"
                      : ""
                }
                onClick={() => setIndex(i)}
              >
                {pad(i + 1)}
              </button>
            ))}
          </nav>
          <div className="ep-divider" />
          <p role="status">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "All answers saved."
                : "Answers save automatically."}
            <br />
            The exam submits when time runs out.
          </p>
          <div className="ep-submit">
            <button
              className="ep-button ep-button-secondary"
              disabled={submitting}
              onClick={confirmSubmit}
            >
              {submitting ? "Submitting…" : "Submit exam"}
            </button>
            <small>You can review before submitting.</small>
          </div>
        </aside>
      </div>
    </div>
  );
}

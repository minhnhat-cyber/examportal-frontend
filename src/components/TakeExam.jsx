import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./StudentUI";

const letters = ["A", "B", "C", "D"];
const pad = (n) => String(n).padStart(2, "0");
const formatClock = (total) => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;

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
          answers: Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })),
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
          answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })),
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
  if (!data) return <ErrorMessage message={error || "This attempt could not be loaded."} />;

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
            <Link to="/student/results" className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold">
              All results
            </Link>
          }
        />
        <ErrorMessage message={error} />

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm text-violet-900">Score</p>
            <p className="mt-1 text-3xl font-bold text-violet-900">{attempt.percentage}%</p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Points</p>
            <p className="mt-1 text-3xl font-bold">
              {attempt.score} <span className="text-lg font-normal text-slate-400">/ {attempt.totalPoints}</span>
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Correct</p>
            <p className="mt-1 text-3xl font-bold">
              {attempt.correctCount} <span className="text-lg font-normal text-slate-400">/ {attempt.questionCount}</span>
            </p>
          </div>
        </section>

        <div className="space-y-4">
          {questions.map((question, i) => (
            <article key={question.id} className="rounded border border-slate-200 bg-white p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {i + 1}</p>
                <span className={`text-xs font-bold ${question.isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                  {question.isCorrect ? "Correct" : "Incorrect"} · {question.earnedPoints}/{question.points}
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
                      className={`flex items-center gap-3 rounded border p-3 text-sm ${isCorrect
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
                      {isCorrect && <span className="text-xs font-bold text-emerald-700">Correct answer</span>}
                      {isChosen && !isCorrect && <span className="text-xs font-bold text-red-700">Your answer</span>}
                    </li>
                  );
                })}
              </ul>

              {question.selectedOption === null && (
                <p className="mt-3 text-xs font-semibold text-slate-500">You did not answer this question.</p>
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

  return (
    <>
      <PageHeader
        eyebrow={exam?.code || "Exam"}
        title={exam?.title || "Exam"}
        description={`${answeredCount} of ${questions.length} answered`}
        action={
          <div className="text-right">
            <p className={`text-3xl font-bold tabular-nums ${low ? "text-red-600" : "text-slate-900"}`}>
              {secondsLeft === null ? "--:--" : formatClock(secondsLeft)}
            </p>
            <p className="text-xs text-slate-500">
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "All answers saved" : "Time remaining"}
            </p>
          </div>
        }
      />
      <ErrorMessage message={error} />

      {low && (
        <p className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
          Less than five minutes left. The exam submits itself when the timer reaches zero.
        </p>
      )}

      <nav className="mb-5 flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const isCurrent = i === index;
          const isAnswered = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              className={`size-10 rounded border text-sm font-bold ${isCurrent
                  ? "border-violet-700 bg-violet-700 text-white"
                  : isAnswered
                    ? "border-violet-300 bg-violet-50 text-violet-700"
                    : "border-slate-300 bg-white text-slate-500"
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      <section className="rounded border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Question {index + 1} of {questions.length} · {question.points}{" "}
          {question.points === 1 ? "point" : "points"}
        </p>
        <h2 className="mt-2 text-lg font-bold">{question.text}</h2>

        <div className="mt-5 space-y-3">
          {question.options.map((option, i) => {
            const selected = answers[question.id] === i;
            return (
              <button
                key={i}
                onClick={() => choose(question.id, i)}
                className={`flex w-full items-center gap-3 rounded border p-3 text-left text-sm ${selected
                    ? "border-violet-700 bg-violet-50 font-semibold text-violet-900"
                    : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 text-slate-500"
                    }`}
                >
                  {letters[i]}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
              className="w-28 rounded border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Previous
            </button>
            <button
              onClick={() => setIndex((i) => i + 1)}
              disabled={index === questions.length - 1}
              className="w-28 rounded border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Next
            </button>
          </div>

          <button
            onClick={confirmSubmit}
            disabled={submitting}
            className="rounded bg-violet-700 px-5 py-2 text-sm font-bold text-white disabled:bg-slate-300"
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </div>
      </section>
    </>
  );
}
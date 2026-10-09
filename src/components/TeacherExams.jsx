import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ErrorMessage, inputClass, Modal, PageHeader } from "./TeacherUI";

const localDate = (date) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
};
const blank = () => ({
  code: "",
  title: "",
  description: "",
  subject: "",
  durationMinutes: 60,
  opensAt: localDate(Date.now() + 86400000),
  closesAt: localDate(Date.now() + 172800000),
  status: "draft",
  questionIds: [],
});
export default function TeacherExams() {
  const [items, setItems] = useState([]),
    [questions, setQuestions] = useState([]),
    [questionSearch, setQuestionSearch] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [editingId, setEditingId] = useState(""),
    [form, setForm] = useState(blank());
  const load = () =>
    apiFetch(
      `/api/exams?size=50&search=${encodeURIComponent(search)}&status=${status}`,
    )
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [search, status]);
  useEffect(() => {
    apiFetch("/api/questions?size=50")
      .then((d) => setQuestions(d.items))
      .catch((e) => setError(e.message));
  }, []);
  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      ...item,
      opensAt: localDate(new Date(item.opensAt).getTime()),
      closesAt: localDate(new Date(item.closesAt).getTime()),
    });
    setOpen(true);
  };
  const submit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(editingId ? `/api/exams/${editingId}` : "/api/exams", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          opensAt: new Date(form.opensAt).toISOString(),
          closesAt: new Date(form.closesAt).toISOString(),
        }),
      });
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  const remove = async (item) => {
    if (!confirm(`Delete ${item.code}?`)) return;
    try {
      await apiFetch(`/api/exams/${item.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  const date = (value) =>
    new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  return (
    <>
      <PageHeader
        eyebrow="Exam management"
        title="Exams, at a glance."
        description="Create papers, set availability, and keep track of their status."
      />
      <ErrorMessage message={error} />
      <section className="ep-statistics">
        {[
          ["Total exams", items.length],
          ["Active", items.filter((x) => x.status === "active").length],
          ["Scheduled", items.filter((x) => x.status === "scheduled").length],
          ["Drafts", items.filter((x) => x.status === "draft").length],
        ].map(([label, count]) => (
          <div key={label}>
            <strong>{String(count).padStart(2, "0")}</strong>
            <small>
              {label}
              {search || status ? " (filtered)" : ""}
            </small>
          </div>
        ))}
      </section>
      <section className="ep-exam-toolbar">
        <input
          aria-label="Search exams"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, code or subject…"
        />
        <button
          onClick={() => {
            setEditingId("");
            setForm(blank());
            setOpen(true);
          }}
          className="ep-button"
        >
          + Create exam
        </button>
      </section>
      <nav className="ep-filters" aria-label="Exam status">
        {[
          ["", "All exams"],
          ["active", "Active"],
          ["scheduled", "Scheduled"],
          ["draft", "Drafts"],
          ["completed", "Completed"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={status === value}
            className={status === value ? "is-active" : ""}
            onClick={() => setStatus(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      <section className="ep-exam-table">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Exam", "Availability", "Status", "Actions"].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <h3>{item.title}</h3>
                    <small>
                      {item.code} · {item.subject} · {item.durationMinutes} min
                      · {item.questionCount} questions
                    </small>
                  </td>
                  <td>
                    <p>{date(item.opensAt)}</p>
                    <small>to {date(item.closesAt)}</small>
                  </td>
                  <td>
                    <span
                      className={`ep-status ${item.status === "scheduled" ? "ep-status-warm" : item.status === "draft" || item.status === "completed" ? "ep-status-neutral" : ""}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="ep-named-actions">
                      <button
                        aria-label={`Edit ${item.title}`}
                        onClick={() => edit(item)}
                      >
                        Edit
                      </button>
                      <button
                        aria-label={`Delete ${item.title}`}
                        onClick={() => remove(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <p className="ep-empty-inline">No exams match your search.</p>
          )}
        </div>
      </section>
      <aside className="ep-publishing">
        <h2>A small publishing checklist</h2>
        <p>
          Draft stays private. Scheduled is visible. Switch to Active when
          students can begin within the exam window.
        </p>
      </aside>
      {open && (
        <Modal
          title={editingId ? "Edit Exam" : "Create Exam"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <ErrorMessage message={error} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Code
                <input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Title
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Subject
                <input
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Duration (minutes)
                <input
                  required
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Opens at
                <input
                  required
                  type="datetime-local"
                  value={form.opensAt}
                  onChange={(e) =>
                    setForm({ ...form, opensAt: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Closes at
                <input
                  required
                  type="datetime-local"
                  value={form.closesAt}
                  onChange={(e) =>
                    setForm({ ...form, closesAt: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  {["draft", "scheduled", "active", "completed"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <p className="text-xs text-slate-600 sm:col-span-2">
                Draft: hidden. Scheduled: visible but cannot start. Active:
                students can start within the opening and closing times.
                Completed: closed. Dates use your local timezone.
              </p>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-semibold">
                  Questions ({form.questionIds.length} selected)
                </legend>
                <input
                  aria-label="Search questions"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="Search questions by code or text"
                  className={inputClass}
                />
                <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-3">
                  {questions
                    .filter((q) =>
                      `${q.code} ${q.text}`
                        .toLowerCase()
                        .includes(questionSearch.toLowerCase()),
                    )
                    .map((q) => (
                      <label key={q.id} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.questionIds.includes(q.id)}
                          onChange={() =>
                            setForm({
                              ...form,
                              questionIds: form.questionIds.includes(q.id)
                                ? form.questionIds.filter((id) => id !== q.id)
                                : [...form.questionIds, q.id],
                            })
                          }
                        />
                        <span>
                          <b>{q.code}</b> - {q.text}
                        </span>
                      </label>
                    ))}
                </div>
              </fieldset>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
              <button className="rounded bg-blue-700 px-4 py-2 font-bold text-white">
                Save Exam
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

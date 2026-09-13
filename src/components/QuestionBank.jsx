import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddOutlined from "@mui/icons-material/AddOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const blankQuestion = {
  code: "",
  text: "",
  topic: "",
  difficulty: "easy",
  points: 1,
  options: ["", "", "", ""],
  correctOption: 0,
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [form, setForm] = useState(blankQuestion);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQuestions() {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), size: "5" });
    if (search.trim()) params.set("search", search.trim());
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);
    try {
      const response = await fetch(`${API_URL}/api/questions?${params}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to load questions.");
      setQuestions(body.items);
      setPagination(body.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadQuestions, 250);
    return () => clearTimeout(timer);
  }, [page, search, topic, difficulty]);

  function openCreate() {
    setEditingId("");
    setForm(blankQuestion);
    setShowForm(true);
  }

  function openEdit(question) {
    setEditingId(question.id);
    setForm({
      code: question.code,
      text: question.text,
      topic: question.topic,
      difficulty: question.difficulty,
      points: question.points,
      options: [...question.options],
      correctOption: question.correctOption,
    });
    setShowForm(true);
  }

  async function saveQuestion(event) {
    event.preventDefault();
    setError("");
    const url = editingId ? `${API_URL}/api/questions/${editingId}` : `${API_URL}/api/questions`;
    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to save the question.");
      setShowForm(false);
      setPage(1);
      await loadQuestions();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteQuestion(question) {
    if (!window.confirm(`Delete ${question.code}?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/questions/${question.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to delete the question.");
      await loadQuestions();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const topics = [...new Set(questions.map((question) => question.topic))].sort();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-blue-700 px-6 py-4 text-white">
        <div className="flex items-center gap-3"><SchoolOutlined /><b className="text-xl">ExamPortal</b></div>
        <Link to="/" className="flex items-center gap-2 rounded border border-blue-300 px-4 py-2 text-sm font-semibold hover:bg-blue-600"><ArrowBackOutlined fontSize="small" />Teacher Dashboard</Link>
      </header>

      <main className="mx-auto max-w-7xl p-5 lg:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Teacher workspace</p><h1 className="mt-1 text-3xl font-bold">Question Bank</h1><p className="mt-2 text-sm text-slate-500">Create, find, update and delete exam questions.</p></div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"><AddOutlined fontSize="small" />Add Question</button>
        </div>

        <section className="mb-5 grid gap-3 rounded border border-slate-300 bg-white p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="relative"><span className="sr-only">Search questions</span><SearchOutlined className="absolute left-3 top-3 text-slate-400" fontSize="small" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by code or question" className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-700" /></label>
          <select value={topic} onChange={(event) => { setTopic(event.target.value); setPage(1); }} className="rounded border border-slate-300 px-3 py-2.5"><option value="">All topics</option>{topics.map((value) => <option key={value}>{value}</option>)}</select>
          <select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPage(1); }} className="rounded border border-slate-300 px-3 py-2.5"><option value="">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
          <button onClick={() => { setSearch(""); setTopic(""); setDifficulty(""); setPage(1); }} className="flex items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-blue-700"><RefreshOutlined fontSize="small" />Reset</button>
        </section>

        {error && <div className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <section className="overflow-hidden rounded border border-slate-300 bg-white">
          <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr>{["Code", "Question", "Topic", "Difficulty", "Options", "Points", "Actions"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>
            {questions.map((question) => <tr key={question.id} className="border-t border-slate-200"><td className="px-4 py-4 font-semibold text-blue-700">{question.code}</td><td className="max-w-xs px-4 font-medium">{question.text}</td><td className="px-4">{question.topic}</td><td className="px-4 capitalize">{question.difficulty}</td><td className="max-w-sm px-4 text-xs text-slate-500">{question.options.map((option, index) => <span key={option} className={index === question.correctOption ? "mr-3 font-bold text-green-700" : "mr-3"}>{String.fromCharCode(65 + index)}. {option}</span>)}</td><td className="px-4">{question.points}</td><td className="px-4"><div className="flex gap-2"><button aria-label="Edit question" onClick={() => openEdit(question)} className="rounded border border-blue-300 p-2 text-blue-700"><EditOutlined fontSize="small" /></button><button aria-label="Delete question" onClick={() => deleteQuestion(question)} className="rounded border border-red-300 p-2 text-red-600"><DeleteOutlineOutlined fontSize="small" /></button></div></td></tr>)}
            {!loading && questions.length === 0 && <tr><td colSpan="7" className="p-10 text-center text-slate-500">No questions found.</td></tr>}
            {loading && <tr><td colSpan="7" className="p-10 text-center text-slate-500">Loading questions...</td></tr>}
          </tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm"><span>Showing {questions.length} of {pagination.totalItems} questions</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div></div>
        </section>
      </main>

      {showForm && <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/40 p-4"><form onSubmit={saveQuestion} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded border border-slate-300 bg-white p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{editingId ? "Edit Question" : "Add Question"}</h2><button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">Close</button></div><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Question code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal" placeholder="Q006" /></label>
        <label className="text-sm font-semibold">Topic<input required value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Question text<textarea required value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} className="mt-1 min-h-24 w-full rounded border border-slate-300 p-2.5 font-normal" /></label>
        {form.options.map((option, index) => <label key={index} className="text-sm font-semibold">Option {String.fromCharCode(65 + index)}<input required value={option} onChange={(event) => { const options = [...form.options]; options[index] = event.target.value; setForm({ ...form, options }); }} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal" /></label>)}
        <label className="text-sm font-semibold">Correct option<select value={form.correctOption} onChange={(event) => setForm({ ...form, correctOption: Number(event.target.value) })} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal">{form.options.map((_, index) => <option key={index} value={index}>Option {String.fromCharCode(65 + index)}</option>)}</select></label>
        <label className="text-sm font-semibold">Difficulty<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <label className="text-sm font-semibold">Points<input required min="0.5" step="0.5" type="number" value={form.points} onChange={(event) => setForm({ ...form, points: Number(event.target.value) })} className="mt-1 w-full rounded border border-slate-300 p-2.5 font-normal" /></label>
      </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded border border-slate-300 px-4 py-2">Cancel</button><button className="rounded bg-blue-700 px-4 py-2 font-bold text-white">Save Question</button></div></form></div>}
    </div>
  );
}

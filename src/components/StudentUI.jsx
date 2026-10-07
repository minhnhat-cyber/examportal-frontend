export function PageHeader({ eyebrow="Student workspace", title, description, action }) {
  return <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">{eyebrow}</p><h1 className="mt-1 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</header>;
}

export function ErrorMessage({ message }) { return message ? <div className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{message}</div> : null; }

export function Modal({ title, onClose, children }) {
  return <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded border border-slate-300 bg-white p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="text-sm text-slate-500">Close</button></div>{children}</div></div>;
}

export const inputClass = "mt-1 w-full rounded border border-slate-300 p-2.5 font-normal outline-none focus:border-violet-700";

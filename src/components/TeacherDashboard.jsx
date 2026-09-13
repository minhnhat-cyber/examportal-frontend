import { useEffect, useState } from "react";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import { useNavigate } from "react-router-dom";

const API_URL=import.meta.env.VITE_API_URL;
const empty={statistics:{activeExams:0,totalQuestions:0,studentAttempts:0,averageScore:0},recentExams:[]};
const nav=[["Dashboard",DashboardOutlined],["Exams",AssignmentOutlined],["Question Bank",QuizOutlined],["Students",GroupsOutlined],["Attempts",BarChartOutlined],["Results",EmojiEventsOutlined],["Settings",SettingsOutlined]];

export default function TeacherDashboard(){
 const navigate=useNavigate();
 const [data,setData]=useState(empty); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{fetch(`${API_URL}/api/dashboard/teacher`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setData).catch(()=>setError("Unable to connect to the dashboard API." )).finally(()=>setLoading(false))},[]);
 const cards=[["Active Exams",data.statistics.activeExams,AssignmentOutlined],["Question Bank",data.statistics.totalQuestions,QuizOutlined],["Student Attempts",data.statistics.studentAttempts,GroupsOutlined],["Average Score",`${data.statistics.averageScore}%`,BarChartOutlined]];
 const date=v=>v?new Date(v).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"}):"Not set";
 return <div className="min-h-screen bg-slate-50 text-slate-900 md:grid md:grid-cols-[250px_1fr]">
  <aside className="flex min-h-screen flex-col bg-blue-700 p-5 text-white"><div className="mb-9 flex items-center gap-3"><SchoolOutlined fontSize="large"/><div><b className="block text-xl">ExamPortal</b><small className="text-blue-100">Examination Management System</small></div></div><nav className="space-y-1">{nav.map(([label,Icon],i)=><button key={label} onClick={()=>label==="Question Bank"&&navigate("/questions")} className={`flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-semibold ${i===0?"bg-white text-blue-700":"text-blue-50 hover:bg-blue-600"}`}><Icon fontSize="small"/>{label}</button>)}</nav><div className="mt-auto"><div className="mb-3 flex items-center gap-3 rounded border border-blue-400 p-3"><span className="grid size-10 place-items-center rounded-full bg-white font-bold text-blue-700">DT</span><div><b className="block text-sm">Dr. Taylor</b><small className="text-blue-100">Teacher</small></div></div><button className="flex items-center gap-2 text-sm"><LogoutOutlined fontSize="small"/>Log out</button></div></aside>
  <main className="min-w-0 p-6 lg:p-9"><header className="mb-7 flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Teacher workspace</p><h1 className="mt-1 text-3xl font-bold">Welcome back, Dr. Taylor</h1><p className="mt-2 text-sm text-slate-500">Here&apos;s what&apos;s happening with your exams today.</p></div><button className="relative grid size-11 place-items-center rounded border border-slate-300 bg-white text-slate-600"><NotificationsNoneOutlined/><span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-blue-700 text-[10px] text-white">3</span></button></header>
  {error&&<div className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
  <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="flex min-h-28 items-center gap-4 rounded border border-slate-300 bg-white p-5"><span className="grid size-12 place-items-center rounded bg-blue-50 text-blue-700"><Icon/></span><div><p className="text-sm text-slate-500">{label}</p><b className="text-2xl">{loading?"...":Number.isInteger(value)?value.toLocaleString():value}</b></div></article>)}</section>
  <section className="overflow-hidden rounded border border-slate-300 bg-white"><div className="flex justify-between border-b border-slate-200 p-5"><h2 className="text-lg font-bold">Recent Exams</h2><button className="rounded bg-blue-700 px-4 py-2 text-xs font-bold text-white">View All Exams</button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{["Exam Title","Subject","Duration","Open Date","Close Date","Attempts","Status",""] .map((x,i)=><th key={i} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{data.recentExams.map(x=><tr key={x.id} className="border-t border-slate-200"><td className="px-4 py-4 font-bold text-blue-700">{x.title}</td><td className="px-4">{x.subject}</td><td className="px-4">{x.durationMinutes} min</td><td className="px-4">{date(x.opensAt)}</td><td className="px-4">{date(x.closesAt)}</td><td className="px-4">{x.attemptCount}/{x.studentCount}</td><td className="px-4"><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{x.status}</span></td><td className="px-4"><VisibilityOutlined fontSize="small" className="text-blue-700"/></td></tr>)}{!loading&&!data.recentExams.length&&<tr><td colSpan="8" className="p-8 text-center text-slate-500">No exams found.</td></tr>}</tbody></table></div></section>
 </main></div>
}

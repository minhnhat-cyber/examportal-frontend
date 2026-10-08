import { useAuth } from "./Auth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./TeacherUI";

const empty={statistics:{activeExams:0,totalQuestions:0,studentAttempts:0,averageScore:0},recentExams:[]};
export default function TeacherDashboard(){ const {user}=useAuth();
 const [data,setData]=useState(empty),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{apiFetch("/api/dashboard/teacher").then(setData).catch((e)=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const cards=[["Active Exams",data.statistics.activeExams,AssignmentOutlined],["Question Bank",data.statistics.totalQuestions,QuizOutlined],["Student Attempts",data.statistics.studentAttempts,GroupsOutlined],["Average Score",`${data.statistics.averageScore}%`,BarChartOutlined]];
 const date=(value)=>value?new Date(value).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"}):"Not set";
 return <><PageHeader title={`Welcome back, ${user.name}`} description="Here is what is happening with your exams today."/><ErrorMessage message={error}/>
 <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="flex min-h-28 items-center gap-4 rounded border border-slate-300 bg-white p-5"><span className="grid size-12 place-items-center rounded bg-blue-50 text-blue-700"><Icon/></span><div><p className="text-sm text-slate-500">{label}</p><b className="text-2xl">{loading?"...":typeof value==="number"?value.toLocaleString():value}</b></div></article>)}</section>
 <section className="overflow-hidden rounded border border-slate-300 bg-white"><div className="flex justify-between border-b border-slate-200 p-5"><h2 className="text-lg font-bold">Recent Exams</h2><Link to="/teacher/exams" className="rounded bg-blue-700 px-4 py-2 text-xs font-bold text-white">View All Exams</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{["Exam Title","Subject","Duration","Open Date","Close Date","Attempts","Status",""] .map((x,i)=><th key={i} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{data.recentExams.map((x)=><tr key={x.id} className="border-t border-slate-200"><td className="px-4 py-4 font-bold text-blue-700">{x.title}</td><td className="px-4">{x.subject}</td><td className="px-4">{x.durationMinutes} min</td><td className="px-4">{date(x.opensAt)}</td><td className="px-4">{date(x.closesAt)}</td><td className="px-4">{x.attemptCount}/{x.studentCount}</td><td className="px-4 capitalize"><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{x.status}</span></td><td className="px-4"><VisibilityOutlined fontSize="small" className="text-blue-700"/></td></tr>)}{!loading&&!data.recentExams.length&&<tr><td colSpan="8" className="p-8 text-center text-slate-500">No exams found.</td></tr>}</tbody></table></div></section></>;
}


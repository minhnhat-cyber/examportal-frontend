import { useEffect, useState } from "react";
import AnalyticsOutlined from "@mui/icons-material/AnalyticsOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import GradingOutlined from "@mui/icons-material/GradingOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import { apiFetch } from "../lib/api";
import { ErrorMessage, PageHeader } from "./TeacherUI";
const empty={summary:{averageScore:0,highestScore:0,lowestScore:0,submittedAttempts:0},byExam:[]};
export default function TeacherReports(){
 const [data,setData]=useState(empty),[error,setError]=useState("");
 useEffect(()=>{apiFetch("/api/reports/teacher").then(setData).catch((e)=>setError(e.message))},[]);
 const cards=[["Average Score",`${data.summary.averageScore}%`,AnalyticsOutlined],["Highest Score",`${data.summary.highestScore}%`,EmojiEventsOutlined],["Lowest Score",`${data.summary.lowestScore}%`,TrendingDownOutlined],["Submitted Attempts",data.summary.submittedAttempts,GradingOutlined]];
 return <><PageHeader title="Results and Reports" description="Analyze student performance across completed exams."/><ErrorMessage message={error}/><section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="flex items-center gap-4 rounded border bg-white p-5"><span className="grid size-12 place-items-center rounded bg-blue-50 text-blue-700"><Icon/></span><div><p className="text-sm text-slate-500">{label}</p><b className="text-2xl">{value}</b></div></article>)}</section><section className="overflow-hidden rounded border bg-white"><div className="border-b p-5"><h2 className="text-lg font-bold">Performance by Exam</h2></div><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{["Code","Exam","Attempts","Average Score","Pass Rate"].map((x)=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{data.byExam.map((item)=><tr key={item.examId} className="border-t"><td className="px-4 py-4 font-bold text-blue-700">{item.code}</td><td className="px-4">{item.title}</td><td className="px-4">{item.attempts}</td><td className="px-4">{item.averageScore}%</td><td className="px-4">{item.passRate}%</td></tr>)}{!data.byExam.length&&<tr><td colSpan="5" className="p-8 text-center text-slate-500">No submitted results yet.</td></tr>}</tbody></table></section></>;
}

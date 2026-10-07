import { NavLink, Outlet } from "react-router-dom";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";

const navigation = [
  ["Dashboard", "/student", DashboardOutlined], ["Exams", "/student/exams", AssignmentOutlined],
  ["Results", "/student/results", EmojiEventsOutlined], ["Profile", "/student/profile", PersonOutlined]
];

export default function StudentLayout() {
  return <div className="min-h-screen bg-slate-50 text-slate-900 md:grid md:grid-cols-[250px_1fr]">
    <aside className="flex bg-violet-700 p-4 text-white md:min-h-screen md:flex-col md:p-5">
      <div className="mr-5 flex shrink-0 items-center gap-2 md:mb-8 md:mr-0"><SchoolOutlined fontSize="large"/><div><b className="block text-lg">ExamPortal</b><small className="hidden text-violet-100 md:block">Student Portal</small></div></div>
      <nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">{navigation.map(([label,to,Icon])=><NavLink key={to} to={to} end={to==="/student"} className={({isActive})=>`flex shrink-0 items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold md:w-full ${isActive?"bg-white text-violet-700":"text-violet-50 hover:bg-violet-600"}`}><Icon fontSize="small"/><span>{label}</span></NavLink>)}</nav>
      <div className="mt-auto hidden md:block"><div className="mb-3 flex items-center gap-3 rounded border border-violet-400 p-3"><span className="grid size-10 place-items-center rounded-full bg-white font-bold text-violet-700">WB</span><div><b className="block text-sm">William Burger</b><small className="text-violet-100">Student</small></div></div><button className="flex items-center gap-2 text-sm"><LogoutOutlined fontSize="small"/>Log out</button></div>
    </aside>
    <main className="min-w-0 p-5 lg:p-8"><Outlet/></main>
  </div>;
}

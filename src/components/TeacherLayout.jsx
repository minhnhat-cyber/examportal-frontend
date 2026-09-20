import { NavLink, Outlet } from "react-router-dom";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";

const navigation = [
  ["Dashboard", "/teacher", DashboardOutlined], ["Exams", "/teacher/exams", AssignmentOutlined],
  ["Question Bank", "/teacher/questions", QuizOutlined], ["Students", "/teacher/students", GroupsOutlined],
  ["Attempts", "/teacher/attempts", BarChartOutlined], ["Results", "/teacher/results", EmojiEventsOutlined],
  ["Settings", "/teacher/settings", SettingsOutlined],
];

export default function TeacherLayout() {
  return <div className="min-h-screen bg-slate-50 text-slate-900 md:grid md:grid-cols-[250px_1fr]">
    <aside className="flex bg-blue-700 p-4 text-white md:min-h-screen md:flex-col md:p-5">
      <div className="mr-5 flex shrink-0 items-center gap-2 md:mb-8 md:mr-0"><SchoolOutlined fontSize="large"/><div><b className="block text-lg">ExamPortal</b><small className="hidden text-blue-100 md:block">Teacher Portal</small></div></div>
      <nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">{navigation.map(([label,to,Icon])=><NavLink key={to} to={to} end={to==="/teacher"} className={({isActive})=>`flex shrink-0 items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold md:w-full ${isActive?"bg-white text-blue-700":"text-blue-50 hover:bg-blue-600"}`}><Icon fontSize="small"/><span>{label}</span></NavLink>)}</nav>
      <div className="mt-auto hidden md:block"><div className="mb-3 flex items-center gap-3 rounded border border-blue-400 p-3"><span className="grid size-10 place-items-center rounded-full bg-white font-bold text-blue-700">DT</span><div><b className="block text-sm">Dr. Taylor</b><small className="text-blue-100">Teacher</small></div></div><button className="flex items-center gap-2 text-sm"><LogoutOutlined fontSize="small"/>Log out</button></div>
    </aside>
    <main className="min-w-0 p-5 lg:p-8"><Outlet/></main>
  </div>;
}

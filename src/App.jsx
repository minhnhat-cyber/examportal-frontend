import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeacherLayout from "./components/TeacherLayout.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import QuestionBank from "./components/QuestionBank.jsx";
import TeacherExams from "./components/TeacherExams.jsx";
import TeacherStudents from "./components/TeacherStudents.jsx";
import TeacherAttempts from "./components/TeacherAttempts.jsx";
import TeacherReports from "./components/TeacherReports.jsx";
import TeacherSettings from "./components/TeacherSettings.jsx";
import StudentLayout from "./components/StudentLayout.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import StudentExams from "./components/StudentExams.jsx";
import TakeExam from "./components/TakeExam.jsx";
import StudentResults from "./components/StudentResults.jsx";
import StudentProfile from "./components/StudentProfile.jsx";
import { AuthProvider, Login, Protected } from "./components/Auth.jsx";
import PortalLayout from "./components/PortalLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/teacher" element={<Protected role="teacher"><PortalLayout role="teacher" /></Protected>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attempts" element={<TeacherAttempts />} />
          <Route path="results" element={<TeacherReports />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
        <Route path="/student" element={<Protected role="student"><PortalLayout role="student" /></Protected>}>
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="exams/:attemptId" element={<TakeExam />} />
        <Route path="results" element={<StudentResults />}/>
        <Route path="profile" element={<StudentProfile />}/>
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeacherLayout from "./components/TeacherLayout.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import QuestionBank from "./components/QuestionBank.jsx";
import TeacherExams from "./components/TeacherExams.jsx";
import TeacherStudents from "./components/TeacherStudents.jsx";
import TeacherAttempts from "./components/TeacherAttempts.jsx";
import TeacherReports from "./components/TeacherReports.jsx";
import TeacherSettings from "./components/TeacherSettings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attempts" element={<TeacherAttempts />} />
          <Route path="results" element={<TeacherReports />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

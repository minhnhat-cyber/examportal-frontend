import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import QuestionBank from "./components/QuestionBank.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PulicLayout";
import PrivateLayout from "../layouts/PrivateLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import PublicDashboard from "../pages/dashboard/PublicDashboard";
import Dashboard from "../pages/dashboard/Dashboard";
import Statistics from "../pages/dashboard/Statistics";

import Classes from "../pages/classes/Classes";
import ClassDetail from "../pages/classes/ClassDetail";

import ExamDetail from "../pages/exams/ExamDetail";
import EditExam from "../pages/exams/EditExam";

import Profile from "../pages/profile/Profile";
import MySubmissions from "../pages/profile/MySubmissions";
import ProtectedRoute from "./Protectedroute";
import CreateExam from "../pages/exams/CreateExam";
import AdminRoute from "./AdminRoute";
import TeacherAdminRoute from "./TeacherAdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import SubjectManagement from "../pages/admin/SubjectManagement";
import ExamManagement from "../pages/admin/ExamManagement";
import QuestionBank from "../pages/admin/QuestionBank";
import AdminClassManagement from "../pages/admin/AdminClassManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* PRIVATE */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/statistics" element={<Statistics />} />

          {/* CLASS FLOW */}
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:classId" element={<ClassDetail />} />

          {/* EXAM - xem đề thi: tất cả role được phép */}
          <Route path="/exam/:examId" element={<ExamDetail />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/submissions" element={<MySubmissions />} />

          {/* TEACHER + ADMIN */}
          <Route element={<TeacherAdminRoute />}>
            <Route path="/subjects" element={<SubjectManagement />} />
            <Route path="/question-bank" element={<QuestionBank />} />
            <Route path="/exams/create" element={<CreateExam />} />
            <Route path="/exams/:examId/edit" element={<EditExam />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="exams" element={<ExamManagement />} />
            <Route path="classes" element={<AdminClassManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
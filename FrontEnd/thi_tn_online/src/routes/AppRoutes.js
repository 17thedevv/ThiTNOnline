import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PulicLayout";
import PrivateLayout from "../layouts/PrivateLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import PublicDashboard from "../pages/dashboard/PublicDashboard";
import Dashboard from "../pages/dashboard/Dashboard";

import Classes from "../pages/classes/Classes";
import ClassDetail from "../pages/classes/ClassDetail";

import ExamDetail from "../pages/exams/ExamDetail";
import EditExam from "../pages/exams/EditExam";

import Profile from "../pages/profile/Profile";
import ProtectedRoute from "./Protectedroute";
import CreateExam from "../pages/exams/CreateExam";

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

          {/* CLASS FLOW */}
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:classId" element={<ClassDetail />} />

          {/* EXAM */}
          <Route path="/exam/:examId" element={<ExamDetail />} />
          <Route path="/exams/create" element={<CreateExam />} />
          <Route path="/exams/:examId/edit" element={<EditExam />} />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
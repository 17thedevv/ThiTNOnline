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
import Profile from "../pages/profile/Profile";
import ProtectedRoute from "./Protectedroute";
import Exams from "../pages/exams/Exams";
import ExamDetail from "../pages/exams/ExamDetail";

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
      <Route path="/exams" element={<Exams />} />
      <Route path="/exams/:id" element={<ExamDetail />} />

      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/:id" element={<ClassDetail />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  </Route>
</Routes>
  );
};

export default AppRoutes;


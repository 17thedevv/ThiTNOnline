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

import SubjectDetail from "../pages/classes/SubjectDetail";
import ExamDetail from "../pages/exams/ExamDetail";

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

          {/* SUBJECT */}
          <Route path="/subjects/:subjectId" element={<SubjectDetail />} />

          {/* EXAM */}
          <Route path="/exam/:examId" element={<ExamDetail />} />

          <Route path="/profile" element={<Profile />} />
          
          <Route path="/subjects/:subjectId/create-exam" element={<CreateExam />}/>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Classes from "../pages/classes/Classes";
import ClassDetail from "../pages/classes/ClassDetail";
import Assignments from "../pages/assignments/Assignment";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Không dùng layout */}
      <Route path="/login" element={<Login />} />

      {/* Có layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const TeacherAdminRoute = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && user.role !== "teacher") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default TeacherAdminRoute;

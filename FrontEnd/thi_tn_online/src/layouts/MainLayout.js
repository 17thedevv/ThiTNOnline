import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: 20, flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

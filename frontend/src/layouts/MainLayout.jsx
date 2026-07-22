import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">

        {/* Fixed Topbar */}
        <div className="sticky top-0 z-40 bg-[#F4F6FA] px-8 pt-6">
          <Topbar />
        </div>

        {/* Page Content */}
        <div className="px-8 pb-8 pt-6">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

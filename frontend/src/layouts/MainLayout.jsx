import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  return (
    <div className="bg-gray-100 min-h-screen flex">

      {/* Sidebar hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">

        <Topbar />

        <main className="p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

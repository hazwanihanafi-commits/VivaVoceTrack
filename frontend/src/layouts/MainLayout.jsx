import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="ml-64">

        <Topbar />

        <main className="p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

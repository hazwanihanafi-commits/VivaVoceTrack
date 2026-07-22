import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="bg-[#F4F6FA] min-h-screen">

      <Sidebar />

      <main className="ml-64 p-8">

        <Topbar />

        <div className="mt-8">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

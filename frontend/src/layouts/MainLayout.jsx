import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen">

      <Sidebar />

      <main className="ml-72 p-8">

        <Topbar />

        <div className="mt-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

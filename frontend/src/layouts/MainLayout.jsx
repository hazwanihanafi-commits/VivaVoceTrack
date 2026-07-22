import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (

    <div className="bg-[#EEF2F7] min-h-screen">

      <Sidebar />

      <div className="ml-72">

        <Topbar />

        <main className="p-8">

          <Outlet />

        </main>

      </div>

    </div>

  );
}

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const menus = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    path: "/students",
    icon: GraduationCap,
  },
  {
    name: "Viva Cases",
    path: "/viva",
    icon: FileText,
  },
  {
    name: "Examiners",
    path: "/examiners",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-indigo-900 text-white min-h-screen">
      <div className="p-6 border-b border-indigo-700">
        <h1 className="text-2xl font-bold">VivaTrack</h1>

        <p className="text-sm text-indigo-200">
          USM Postgraduate Viva Management
        </p>
      </div>

      <nav className="p-3">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 mb-2 transition ${
                  isActive
                    ? "bg-yellow-500 text-black"
                    : "hover:bg-indigo-800"
                }`
              }
            >
              <Icon size={20} />
              {menu.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Students",
    icon: GraduationCap,
    path: "/students",
  },
  {
    title: "Supervisors",
    icon: Users,
    path: "/supervisors",
  },
  {
    title: "Examiners",
    icon: UserCheck,
    path: "/examiners",
  },
  {
    title: "Viva Schedule",
    icon: CalendarDays,
    path: "/viva",
  },
  {
    title: "Thesis",
    icon: FileText,
    path: "/thesis",
  },
  {
    title: "Documents",
    icon: FolderOpen,
    path: "/documents",
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white/10 backdrop-blur-3xl border-r border-white/20 shadow-2xl flex flex-col">

      {/* Logo */}

      <div className="p-8 border-b border-white/10">

        <h1 className="text-3xl font-bold text-white">
          🎓 VivaTrack
        </h1>

        <p className="text-white/60 mt-2 text-sm">
          Universiti Sains Malaysia
        </p>

      </div>

      {/* Menu */}

      <nav className="flex-1 px-4 py-6 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                 ${
                   isActive
                     ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                     : "text-white/80 hover:bg-white/10 hover:text-white"
                 }`
              }
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}

      <div className="p-5 border-t border-white/10">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-bold">
            H
          </div>

          <div>

            <p className="text-white font-semibold">
              Dr. Hazwani
            </p>

            <p className="text-white/60 text-sm">
              Administrator
            </p>

          </div>

        </div>

        <button className="mt-5 flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 transition">

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}

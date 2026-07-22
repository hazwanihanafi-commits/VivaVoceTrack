import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  ClipboardCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Submissions",
    icon: FileText,
    path: "/submissions",
  },
  {
    title: "Viva Schedule",
    icon: CalendarDays,
    path: "/viva",
  },
  {
    title: "Examiners",
    icon: Users,
    path: "/examiners",
  },
  {
    title: "Viva Reports",
    icon: ClipboardCheck,
    path: "/reports",
  },
  {
    title: "Students",
    icon: GraduationCap,
    path: "/students",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}

      <div className="px-8 py-10">

        <h1 className="text-5xl font-extrabold text-[#6C2BD9] tracking-tight">
          VivaTrack
        </h1>

        <p className="text-slate-500 mt-3 text-lg">
          Viva Tracking System
        </p>

      </div>

      {/* Menu */}

      <div className="flex-1 px-5">

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={22} />

              <span className="font-semibold text-lg">
                {item.title}
              </span>

            </NavLink>

          );
        })}

      </div>

      {/* Footer */}

      <div className="p-6 border-t border-slate-200">

        <div className="rounded-2xl bg-slate-100 p-5">

          <h3 className="font-bold text-slate-800">
            Postgraduate Office
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Universiti Sains Malaysia
          </p>

        </div>

      </div>

    </aside>
  );
}

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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#53257F] text-white shadow-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-white/10">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              VivaTrack
            </h1>

            <p className="text-xs text-white/70">
              Universiti Sains Malaysia
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-white/10 p-2 rounded-lg"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="mt-6 px-3">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#FDB913] text-[#53257F] font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >
              <Icon size={20} />

              {!collapsed && (
                <span>{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-[#FDB913] text-[#53257F] flex items-center justify-center font-bold">
            H
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="font-semibold">
                Dr. Hazwani
              </div>

              <div className="text-xs text-white/70">
                Administrator
              </div>
            </div>
          )}

        </div>

        {!collapsed && (
          <button className="mt-4 flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-red-500/20 text-red-200">
            <LogOut size={18} />
            Logout
          </button>
        )}

      </div>
    </aside>
  );
}

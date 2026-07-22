import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Students",
    icon: Users,
    path: "/students",
  },
  {
    title: "Supervisors",
    icon: UserCog,
    path: "/supervisors",
  },
  {
    title: "Examiners",
    icon: GraduationCap,
    path: "/examiners",
  },
  {
    title: "Viva Schedule",
    icon: CalendarDays,
    path: "/schedule",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
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
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

      {/* Logo */}

      <div className="flex h-20 items-center justify-between border-b px-6">

        <div>

          <h1 className="text-2xl font-bold text-purple-700">
            VivaTrack
          </h1>

          <p className="text-xs text-gray-500">
            Viva Management System
          </p>

        </div>

        <ChevronLeft className="text-gray-400" />
      </div>

      {/* Navigation */}

      <div className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>

        <div className="space-y-2">

          {menus.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`
                }
              >
                <Icon size={20} />
                {item.title}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User */}

      <div className="border-t p-5">

        <div className="mb-4 flex items-center gap-3">

          <img
            src="https://ui-avatars.com/api/?name=Admin&background=6D28D9&color=fff"
            alt=""
            className="h-11 w-11 rounded-full"
          />

          <div>

            <h4 className="font-semibold">
              Administrator
            </h4>

            <p className="text-sm text-gray-500">
              admin@usm.my
            </p>

          </div>

        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-3 font-medium text-red-600 transition hover:bg-red-50">

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}

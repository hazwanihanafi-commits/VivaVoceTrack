import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Students", icon: GraduationCap, path: "/students" },
  { title: "Supervisors", icon: Users, path: "/supervisors" },
  { title: "Examiners", icon: UserCheck, path: "/examiners" },
  { title: "Viva Schedule", icon: CalendarDays, path: "/viva" },
  { title: "Documents", icon: FileText, path: "/documents" },
  { title: "Reports", icon: BarChart3, path: "/reports" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#53257F] text-white flex flex-col">

      {/* Logo */}

      <div className="h-20 flex items-center px-8 border-b border-white/10">

        <div>

          <h1 className="text-2xl font-bold">

            VivaTrack

          </h1>

          <p className="text-xs text-white/70">

            Universiti Sains Malaysia

          </p>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 mt-5 px-3">

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3 rounded-xl mb-2 transition ${
                  isActive
                    ? "bg-white/10 border-l-4 border-[#FDB913] font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >

              <Icon size={20} />

              {item.title}

            </NavLink>

          );

        })}

      </div>

      {/* Footer */}

      <div className="p-5 border-t border-white/10">

        <div className="bg-white/10 rounded-xl p-4">

          <h3 className="font-semibold">

            Postgraduate Office

          </h3>

          <p className="text-xs text-white/70 mt-1">

            Universiti Sains Malaysia

          </p>

        </div>

      </div>

    </aside>
  );
}

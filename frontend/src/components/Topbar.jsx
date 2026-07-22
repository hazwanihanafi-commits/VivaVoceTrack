import {
  Bell,
  CalendarDays,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-5">

      <div className="flex items-center justify-between">

        {/* Left */}

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-gray-500">
            Welcome back to VivaTrack.
          </p>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* Search */}

          <div className="relative hidden lg:block">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search student..."
              className="w-72 rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none transition focus:border-purple-500 focus:bg-white"
            />

          </div>

          {/* Date */}

          <div className="hidden xl:flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3">

            <CalendarDays size={18} className="text-purple-600" />

            <span className="text-sm text-gray-600">
              {today}
            </span>

          </div>

          {/* Dark Mode */}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl bg-gray-100 p-3 hover:bg-gray-200 transition"
          >
            {darkMode ? (
              <Sun className="text-amber-500" size={20} />
            ) : (
              <Moon className="text-gray-600" size={20} />
            )}
          </button>

          {/* Notifications */}

          <button className="relative rounded-xl bg-gray-100 p-3 hover:bg-gray-200 transition">

            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">

            <img
              src="https://ui-avatars.com/api/?name=Hazwani&background=6D28D9&color=fff"
              className="h-10 w-10 rounded-full"
              alt=""
            />

            <div className="hidden md:block">

              <h4 className="font-semibold text-gray-700">
                Admin
              </h4>

              <p className="text-sm text-gray-500">
                Viva Administrator
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

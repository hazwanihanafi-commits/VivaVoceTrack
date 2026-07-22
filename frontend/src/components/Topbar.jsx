import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

import { useState } from "react";

export default function Topbar() {
  const [dark, setDark] = useState(false);

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white rounded-2xl shadow-sm border border-gray-200 h-20 px-8 flex items-center justify-between">

      {/* Left */}

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Dr. Hazwani
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="hidden lg:flex items-center bg-gray-100 rounded-xl px-4 h-11 w-80">

          <Search
            size={18}
            className="text-gray-500"
          />

          <input
            type="text"
            placeholder="Search student, matric no..."
            className="ml-3 flex-1 bg-transparent outline-none text-sm"
          />

        </div>

        {/* Date */}

        <div className="hidden xl:flex items-center gap-2 text-gray-600">

          <CalendarDays size={18} />

          <span className="text-sm">

            {today}

          </span>

        </div>

        {/* Dark Mode */}

        <button
          onClick={() => setDark(!dark)}
          className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          {dark ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* Notifications */}

        <button className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">

          <Bell size={19} />

          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>

        </button>

        {/* User */}

        <button className="flex items-center gap-3 rounded-xl hover:bg-gray-100 px-3 py-2 transition">

          <div className="w-11 h-11 rounded-full bg-[#53257F] text-white flex items-center justify-center font-bold">

            H

          </div>

          <div className="hidden lg:block text-left">

            <div className="font-semibold text-gray-800">

              Dr. Hazwani

            </div>

            <div className="text-xs text-gray-500">

              Administrator

            </div>

          </div>

          <ChevronDown
            size={18}
            className="text-gray-500"
          />

        </button>

      </div>

    </header>
  );
}

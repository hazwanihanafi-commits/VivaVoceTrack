import {
  Bell,
  Search,
  Settings,
  ChevronDown
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="bg-white rounded-2xl border border-slate-200 shadow-sm h-20 px-8 flex items-center justify-between">

      {/* Left */}

      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard Overview
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Viva Tracking Management System
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="hidden lg:flex items-center w-80 bg-slate-100 rounded-xl px-4 h-11">

          <Search
            size={18}
            className="text-slate-500"
          />

          <input
            className="flex-1 ml-3 bg-transparent outline-none text-sm"
            placeholder="Search student..."
          />

        </div>

        {/* Notification */}

        <button className="relative w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition">

          <Bell className="m-auto mt-3 text-slate-700" />

          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* Settings */}

        <button className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition">

          <Settings className="m-auto mt-3 text-slate-700" />

        </button>

        {/* User */}

        <button className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full bg-[#53257F] text-white flex items-center justify-center font-bold">

            H

          </div>

          <div className="hidden lg:block text-left">

            <h3 className="font-semibold">

              Dr. Hazwani

            </h3>

            <p className="text-xs text-slate-500">

              Administrator

            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-slate-500"
          />

        </button>

      </div>

    </header>
  );
}

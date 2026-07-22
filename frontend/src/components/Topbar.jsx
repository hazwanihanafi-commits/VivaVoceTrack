import {
  Bell,
  Search,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-28 bg-white border-b border-slate-200 flex items-center justify-between px-10">

      {/* Left */}

      <div>

        <h1 className="text-5xl font-bold text-slate-800">
          Dashboard Overview
        </h1>

        <p className="text-slate-500 text-xl mt-2">
          Welcome back! Here's what's happening with viva sessions.
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-8">

        {/* Notification */}

        <button className="relative">

          <Bell
            size={28}
            className="text-slate-600"
          />

          <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-semibold">

            3

          </span>

        </button>

        {/* Avatar */}

        <div className="flex items-center gap-5">

          <div className="w-16 h-16 rounded-full bg-slate-300"></div>

          <div>

            <h3 className="font-bold text-2xl">

              Prof. Dr. Ahmad

            </h3>

            <p className="text-slate-500">

              Postgraduate Office

            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

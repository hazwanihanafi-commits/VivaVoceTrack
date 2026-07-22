import {
  Bell,
  Search,
  Settings,
  CalendarDays,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-xl px-8 flex items-center justify-between">

      {/* Left */}

      <div>

        <h2 className="text-3xl font-bold text-white">
          Dashboard
        </h2>

        <p className="text-white/60">
          Welcome back to VivaTrack
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="flex items-center bg-white/10 rounded-full px-4 py-2 border border-white/20">

          <Search
            size={18}
            className="text-white/70"
          />

          <input
            type="text"
            placeholder="Search student..."
            className="ml-3 bg-transparent outline-none text-white placeholder:text-white/40 w-52"
          />

        </div>

        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">

          <CalendarDays className="text-white" />

        </button>

        <button className="relative w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">

          <Bell className="text-white" />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>

        </button>

        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">

          <Settings className="text-white" />

        </button>

        <img
          src="https://ui-avatars.com/api/?name=Hazwani&background=FDB913&color=fff"
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-white/20"
        />

      </div>

    </header>
  );
}

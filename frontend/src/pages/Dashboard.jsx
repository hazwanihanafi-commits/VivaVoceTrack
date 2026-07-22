import {
  GraduationCap,
  CalendarDays,
  FileCheck,
  Clock3,
} from "lucide-react";

const cards = [
  {
    title: "Total Students",
    value: 126,
    icon: GraduationCap,
    color: "from-violet-500 to-purple-700",
  },
  {
    title: "Upcoming Viva",
    value: 12,
    icon: CalendarDays,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Completed Viva",
    value: 94,
    icon: FileCheck,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Pending Cases",
    value: 18,
    icon: Clock3,
    color: "from-orange-400 to-red-500",
  },
];

const recent = [
  {
    matric: "PHD22001",
    name: "Ali Ahmad",
    programme: "PhD",
    status: "Ready for Viva",
  },
  {
    matric: "MSC23008",
    name: "Chen Wei",
    programme: "MSc",
    status: "Pending",
  },
  {
    matric: "PHD21005",
    name: "Nur Aina",
    programme: "PhD",
    status: "Corrections",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-white/70 mt-2">
          Welcome to VivaTrack Management System
        </p>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 hover:scale-105 transition"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${card.color} flex items-center justify-center`}
              >
                <Icon size={28} className="text-white" />
              </div>

              <p className="text-white/70 mt-5">
                {card.title}
              </p>

              <h2 className="text-5xl font-bold text-white mt-2">
                {card.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">

        <div className="p-6 border-b border-white/10">

          <h2 className="text-2xl font-bold text-white">
            Recent Students
          </h2>

        </div>

        <table className="w-full text-white">

          <thead className="bg-white/10">

            <tr>

              <th className="text-left p-4">Matric</th>

              <th className="text-left p-4">Student</th>

              <th className="text-left p-4">Programme</th>

              <th className="text-left p-4">Status</th>

            </tr>

          </thead>

          <tbody>

            {recent.map((s) => (

              <tr
                key={s.matric}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >

                <td className="p-4">{s.matric}</td>

                <td className="p-4">{s.name}</td>

                <td className="p-4">{s.programme}</td>

                <td className="p-4">

                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                    {s.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

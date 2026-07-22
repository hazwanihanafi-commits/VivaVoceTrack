import {
  FileText,
  CalendarDays,
  GraduationCap,
  CheckCircle,
  Clock,
} from "lucide-react";

const cards = [
  {
    title: "Notice of Submission",
    value: 32,
    icon: FileText,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Viva Scheduled",
    value: 18,
    icon: CalendarDays,
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Corrections",
    value: 9,
    icon: Clock,
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    title: "Completed Viva",
    value: 24,
    icon: GraduationCap,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Final Submission",
    value: 15,
    icon: CheckCircle,
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const upcoming = [
  {
    student: "Ahmad Faiz",
    date: "28 Jul 2026",
    time: "9:00 AM",
    venue: "Seminar Room 1",
  },
  {
    student: "Nur Aisyah",
    date: "29 Jul 2026",
    time: "2:30 PM",
    venue: "Meeting Room",
  },
  {
    student: "Li Wei",
    date: "30 Jul 2026",
    time: "10:00 AM",
    venue: "Conference Hall",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Statistics */}

      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-5">
          Dashboard Summary
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>

                    <h2 className="mt-2 text-4xl font-bold">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`${card.color} p-4 rounded-2xl`}
                  >
                    <Icon
                      className={card.iconColor}
                      size={28}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two Column */}

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Workflow */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-6">
            Viva Workflow
          </h2>

          <div className="flex justify-between items-center">

            {[
              "Submission",
              "Supervisor",
              "Verification",
              "Examiners",
              "Viva",
              "Completed",
            ].map((step, index) => (
              <div
                key={step}
                className="flex flex-col items-center flex-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    index < 4
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="mt-3 text-sm text-center">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Viva */}

        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <h2 className="text-lg font-bold mb-5">
            Upcoming Viva
          </h2>

          <div className="space-y-4">

            {upcoming.map((item) => (
              <div
                key={item.student}
                className="rounded-xl border p-4 hover:bg-gray-50 transition"
              >
                <h3 className="font-semibold">
                  {item.student}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.date}
                </p>

                <p className="text-sm text-gray-500">
                  {item.time}
                </p>

                <span className="inline-block mt-3 rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">
                  {item.venue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Students */}

      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-5">
          Recent Students
        </h2>

        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left text-gray-500">
              <th className="py-3">Student</th>
              <th>Programme</th>
              <th>Supervisor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-4">Ahmad Faiz</td>
              <td>PhD</td>
              <td>Prof. Hazwani</td>
              <td>
                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 text-sm">
                  On Track
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-4">Nur Aisyah</td>
              <td>MSc</td>
              <td>Dr. Ali</td>
              <td>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 text-sm">
                  Pending
                </span>
              </td>
            </tr>

            <tr>
              <td className="py-4">Li Wei</td>
              <td>PhD</td>
              <td>Prof. Tan</td>
              <td>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700 text-sm">
                  Late
                </span>
              </td>
            </tr>

          </tbody>
        </table>
      </section>
    </div>
  );
}

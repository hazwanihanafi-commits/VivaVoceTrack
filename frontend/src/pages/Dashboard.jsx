import {
  Users,
  CalendarDays,
  FileText,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: 128,
    change: "+8 This Month",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Upcoming Viva",
    value: 16,
    change: "Next 30 Days",
    icon: CalendarDays,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Notice Submitted",
    value: 42,
    change: "Awaiting Review",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Thesis Submitted",
    value: 27,
    change: "Ready for Viva",
    icon: GraduationCap,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Viva Completed",
    value: 89,
    change: "Successfully Graduated",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600",
  },
];

const workflow = [
  "Notice Submission",
  "Supervisor Review",
  "School Verification",
  "Examiners",
  "Viva",
  "Corrections",
  "Graduated",
];

const upcoming = [
  {
    student: "Nur Aisyah",
    date: "24 Jul 2026",
    venue: "Seminar Room 1",
  },
  {
    student: "Muhammad Faris",
    date: "26 Jul 2026",
    venue: "Meeting Room B",
  },
  {
    student: "Lim Wei Jie",
    date: "29 Jul 2026",
    venue: "Hybrid",
  },
];

const recent = [
  {
    matric: "P-CX001",
    name: "Nur Aisyah",
    programme: "PhD",
    status: "Supervisor Review",
  },
  {
    matric: "P-CX002",
    name: "Muhammad Faris",
    programme: "Master",
    status: "School Verification",
  },
  {
    matric: "P-CX003",
    name: "Lim Wei Jie",
    programme: "PhD",
    status: "Viva Scheduled",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm">{item.title}</p>

                  <h2 className="text-4xl font-bold mt-3">
                    {item.value}
                  </h2>

                  <p className="text-sm text-slate-500 mt-3">
                    {item.change}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color}`}
                >
                  <Icon size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow + Upcoming */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Workflow */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-8">
            Viva Workflow
          </h2>

          <div className="flex flex-wrap justify-between gap-3">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="flex flex-col items-center flex-1 min-w-[110px]"
              >
                <div className="w-14 h-14 rounded-full bg-[#53257F] text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                <p className="text-sm mt-4 text-center">
                  {step}
                </p>

                {index !== workflow.length - 1 && (
                  <ArrowRight className="text-slate-300 mt-3 hidden xl:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Viva */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">
            Upcoming Viva
          </h2>

          <div className="space-y-4">
            {upcoming.map((item) => (
              <div
                key={item.student}
                className="border rounded-xl p-4"
              >
                <h3 className="font-semibold">
                  {item.student}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {item.date}
                </p>

                <p className="text-sm text-purple-700">
                  {item.venue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            Recent Students
          </h2>

          <button className="text-[#53257F] font-semibold">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4">Matric</th>
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Programme</th>
                <th className="text-left p-4">Current Stage</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((student) => (
                <tr
                  key={student.matric}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4">
                    {student.matric}
                  </td>

                  <td className="p-4 font-medium">
                    {student.name}
                  </td>

                  <td className="p-4">
                    {student.programme}
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

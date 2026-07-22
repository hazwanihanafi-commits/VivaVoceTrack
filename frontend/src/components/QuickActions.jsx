import {
  UserPlus,
  CalendarPlus,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react";

const actions = [
  {
    title: "Add Student",
    icon: UserPlus,
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Schedule Viva",
    icon: CalendarPlus,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Assign Examiner",
    icon: UserCheck,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Generate Report",
    icon: FileSpreadsheet,
    color: "bg-orange-100 text-orange-700",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="border rounded-xl p-5 hover:shadow-md hover:border-[#53257F] transition"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="font-semibold mt-4">
                {item.title}
              </h3>
            </button>
          );
        })}

      </div>

    </div>
  );
}

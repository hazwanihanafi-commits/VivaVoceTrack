import {
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";
import { api } from "../api/api";

const cardStyle =
  "bg-white rounded-2xl shadow-sm border border-gray-200 p-6";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingViva: 0,
    completed: 0,
    pending: 0,
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await api.get("/dashboard");

      setStats(res.data.data);

      setStudents(res.data.data.recentStudents || []);
    } catch (err) {
      console.error(err);
    }
  }

  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Upcoming Viva",
      value: stats.upcomingViva,
      icon: CalendarDays,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Completed Viva",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={cardStyle}
            >
              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">

                    {card.title}

                  </p>

                  <h1 className="text-4xl font-bold mt-3">

                    {card.value}

                  </h1>

                </div>

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}
                >
                  <Icon size={28} />
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Row */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Chart */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          <h2 className="font-semibold text-xl mb-4">

            Student Statistics

          </h2>

          <div className="h-72 flex items-center justify-center text-gray-400">

            Chart Coming Soon

          </div>

        </div>

        {/* Upcoming Viva */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          <h2 className="font-semibold text-xl mb-5">

            Upcoming Viva

          </h2>

          <div className="space-y-4">

            <div className="border-l-4 border-purple-600 pl-4">

              <p className="font-semibold">

                No upcoming viva

              </p>

              <span className="text-sm text-gray-500">

                Waiting for schedule

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Recent Students */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        <div className="flex justify-between items-center px-6 py-5 border-b">

          <h2 className="font-semibold text-xl">

            Recent Students

          </h2>

          <button className="text-[#53257F] font-semibold">

            View All

          </button>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left px-6 py-4">

                Matric

              </th>

              <th className="text-left px-6 py-4">

                Student

              </th>

              <th className="text-left px-6 py-4">

                Programme

              </th>

              <th className="text-left px-6 py-4">

                Status

              </th>

            </tr>

          </thead>

          <tbody>

            {students.length === 0 ? (

              <tr>

                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-400"
                >
                  No data available.
                </td>

              </tr>

            ) : (

              students.map((s) => (

                <tr
                  key={s.StudentID}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-6 py-4">

                    {s.MatricNo}

                  </td>

                  <td className="px-6 py-4">

                    {s.StudentName}

                  </td>

                  <td className="px-6 py-4">

                    {s.Programme}

                  </td>

                  <td className="px-6 py-4">

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">

                      {s.Status}

                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

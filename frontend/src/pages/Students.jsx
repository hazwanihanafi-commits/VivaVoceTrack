import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const sampleStudents = [
  {
    id: 1,
    name: "Ahmad Faiz",
    matric: "PHD22001",
    programme: "PhD",
    supervisor: "Prof. Hazwani",
    status: "On Track",
  },
  {
    id: 2,
    name: "Nur Aisyah",
    matric: "MSC23008",
    programme: "MSc",
    supervisor: "Dr. Ali",
    status: "Pending",
  },
  {
    id: 3,
    name: "Li Wei",
    matric: "PHD22018",
    programme: "PhD",
    supervisor: "Prof. Tan",
    status: "Late",
  },
];

export default function Students() {
  const [search, setSearch] = useState("");

  const filtered = sampleStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matric.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Students
          </h1>

          <p className="text-gray-500">
            Manage postgraduate students
          </p>

        </div>

        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl">

          <Plus size={18} />

          Add Student

        </button>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">

        <div className="relative mb-6">

          <Search
            size={18}
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full rounded-xl border pl-11 py-3 outline-none"
          />

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b text-left text-gray-500">

              <th className="py-3">Name</th>

              <th>Matric</th>

              <th>Programme</th>

              <th>Supervisor</th>

              <th>Status</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((student) => (

              <tr
                key={student.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-4 font-medium">
                  {student.name}
                </td>

                <td>{student.matric}</td>

                <td>{student.programme}</td>

                <td>{student.supervisor}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      student.status === "On Track"
                        ? "bg-green-100 text-green-700"
                        : student.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status}
                  </span>

                </td>

                <td>

                  <div className="flex gap-2">

                    <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">

                      <Eye size={18} />

                    </button>

                    <button className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">

                      <Pencil size={18} />

                    </button>

                    <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">

                      <Trash2 size={18} />

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

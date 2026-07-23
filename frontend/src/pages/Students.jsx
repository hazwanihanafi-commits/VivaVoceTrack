import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Students() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const res = await fetch(`${API}/students`);
      const json = await res.json();

      if (json.success) {
        setStudents(json.data);
      } else {
        console.error(json.message);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      (s.StudentName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.MatricNo || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Table Card */}
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

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading students...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3">Name</th>
                <th>Matric</th>
                <th>Programme</th>
                <th>Supervisor</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-400"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.StudentID}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-4 font-medium">
                      {student.StudentName}
                    </td>

                    <td>{student.MatricNo}</td>

                    <td>{student.Programme}</td>

                    <td>{student.Supervisor}</td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          student.Status === "Active"
                            ? "bg-green-100 text-green-700"
                            : student.Status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.Status}
                      </span>
                    </td>

                    <td>
                      <div className="flex justify-center gap-2">
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

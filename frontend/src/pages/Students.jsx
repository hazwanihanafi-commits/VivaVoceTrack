import { useEffect, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import StudentModal from "../components/students/StudentModal";

const API = import.meta.env.VITE_API_URL || "https://vivatrack-backend.onrender.com/api";

export default function Students() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/students`);
      const json = await res.json();

      if (json.success) {
        setStudents(Array.isArray(json.data) ? json.data : []);
      } else {
        console.error(json.message || "Failed to load students.");
        setStudents([]);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteStudent(id) {
    try {
      const res = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        await loadStudents();
      } else {
        alert(json.message || "Unable to delete student.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to delete student.");
    }
  }

  const filtered = students.filter(
    (s) =>
      (s.StudentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.MatricNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.StudentID || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-gray-500">Manage postgraduate students</p>
          </div>

          <button
            onClick={() => {
              setSelectedStudent(null);
              setMode("add");
              setOpenModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full rounded-xl border py-3 pl-11 outline-none"
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading students...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3">Name</th>
                    <th>Matric No</th>
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
                        colSpan={6}
                        className="py-10 text-center text-gray-400"
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
                          {student.StudentName || "-"}
                        </td>

                        <td>{student.MatricNo || "-"}</td>

                        <td>{student.Programme || "-"}</td>

                        <td>{student.Supervisor || "-"}</td>

                        <td>
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              student.Status === "Active"
                                ? "bg-green-100 text-green-700"
                                : student.Status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {student.Status || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setMode("view");
                                setOpenModal(true);
                              }}
                              className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete ${student.StudentName}?`
                                  )
                                ) {
                                  deleteStudent(student.StudentID);
                                }
                              }}
                              className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <StudentModal
        open={openModal}
        mode={mode}
        student={selectedStudent}
        onClose={() => setOpenModal(false)}
        onSaved={loadStudents}
      />
    </>
  );
}

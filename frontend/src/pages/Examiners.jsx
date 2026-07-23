import { useEffect, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import ExaminerModal from "../components/examiners/ExaminerModal";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com/api";

export default function Examiners() {
  const [search, setSearch] = useState("");
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedExaminer, setSelectedExaminer] = useState(null);

  useEffect(() => {
    loadExaminers();
  }, []);

  async function loadExaminers() {
    try {
      setLoading(true);

      const res = await fetch(`${API}/examiners`);
      const json = await res.json();

      if (json.success) {
        setExaminers(Array.isArray(json.data) ? json.data : []);
      } else {
        setExaminers([]);
      }
    } catch (err) {
      console.error(err);
      setExaminers([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteExaminer(id) {
    try {
      const res = await fetch(`${API}/examiners/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        loadExaminers();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to delete examiner.");
    }
  }

  const filtered = examiners.filter((e) =>
    [
      e.ExaminerName,
      e.Email,
      e.University,
      e.Expertise,
      e.ExaminerID,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Examiners
            </h1>

            <p className="text-gray-500">
              Manage internal and external examiners
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedExaminer(null);
              setMode("add");
              setOpenModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Examiner
          </button>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="relative mb-6">

            <Search
              size={18}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              placeholder="Search examiner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border py-3 pl-11 outline-none"
            />

          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading examiners...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3">Name</th>
                    <th>University</th>
                    <th>Email</th>
                    <th>Type</th>
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
                        No examiners found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((examiner) => (
                      <tr
                        key={examiner.ExaminerID}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4 font-medium">
                          {examiner.ExaminerName}
                        </td>

                        <td>
                          {examiner.University}
                        </td>

                        <td>
                          {examiner.Email}
                        </td>

                        <td>
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              examiner.ExaminerType === "Internal"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {examiner.ExaminerType}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              examiner.Status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {examiner.Status}
                          </span>
                        </td>

                        <td>

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() => {
                                setSelectedExaminer(examiner);
                                setMode("view");
                                setOpenModal(true);
                              }}
                              className="rounded-lg bg-blue-100 p-2 text-blue-600"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedExaminer(examiner);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="rounded-lg bg-green-100 p-2 text-green-600"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Deactivate ${examiner.ExaminerName}?`
                                  )
                                ) {
                                  deleteExaminer(
                                    examiner.ExaminerID
                                  );
                                }
                              }}
                              className="rounded-lg bg-red-100 p-2 text-red-600"
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

      <ExaminerModal
        open={openModal}
        mode={mode}
        examiner={selectedExaminer}
        onClose={() => setOpenModal(false)}
        onSaved={loadExaminers}
      />

    </>
  );
}

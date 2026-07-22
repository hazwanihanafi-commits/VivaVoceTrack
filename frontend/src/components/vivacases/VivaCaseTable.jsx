import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";

export default function VivaCaseTable({
  cases,
  students,
  examiners,
}) {
  const [search, setSearch] = useState("");

  function studentName(id) {
    const s = students.find((x) => x.StudentID === id);
    return s?.StudentName || "-";
  }

  function examinerName(id) {
    const e = examiners.find((x) => x.ExaminerID === id);
    return e?.ExaminerName || "-";
  }

  const filteredCases = useMemo(() => {
    if (!search) return cases;

    const keyword = search.toLowerCase();

    return cases.filter((item) => {
      return (
        (item.CaseID || "")
          .toLowerCase()
          .includes(keyword) ||

        studentName(item.StudentID)
          .toLowerCase()
          .includes(keyword) ||

        examinerName(item.InternalExaminerID)
          .toLowerCase()
          .includes(keyword) ||

        examinerName(item.ExternalExaminerID)
          .toLowerCase()
          .includes(keyword) ||

        (item.CurrentStatus || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [cases, search]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow md:p-8">

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <h2 className="text-xl font-bold">
          Existing Viva Cases
        </h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case..."
          className="w-full rounded-xl border p-3 md:w-80"
        />

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-[950px] w-full">

          <thead>

            <tr className="border-b bg-gray-50">

              <th className="p-3 text-left">
                Case ID
              </th>

              <th className="p-3 text-left">
                Student
              </th>

              <th className="p-3 text-left">
                Internal Examiner
              </th>

              <th className="p-3 text-left">
                External Examiner
              </th>

              <th className="p-3 text-left">
                Due Date
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredCases.map((item) => (
                    <tr
                key={item.CaseID}
                className="border-b hover:bg-gray-50"
              >
                <td className="whitespace-nowrap p-3 font-semibold">
                  {item.CaseID}
                </td>

                <td className="whitespace-nowrap p-3">
                  {studentName(item.StudentID)}
                </td>

                <td className="whitespace-nowrap p-3">
                  {examinerName(item.InternalExaminerID)}
                </td>

                <td className="whitespace-nowrap p-3">
                  {examinerName(item.ExternalExaminerID)}
                </td>

                <td className="whitespace-nowrap p-3">
                  {item.ReportDueDate || "-"}
                </td>

                <td className="p-3">
                  <StatusBadge
                    status={item.CurrentStatus}
                  />
                </td>

                <td className="p-3 text-center">
                  <button
                    className="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-200"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredCases.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-gray-500"
                >
                  No viva cases found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

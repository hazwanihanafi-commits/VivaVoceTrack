import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";
import { Settings, Trash2 } from "lucide-react";

export default function VivaCaseTable({
  cases,
  students,
  examiners,
  onManage,
  onSchedule,
  onDelete,
}) {

  const [search, setSearch] = useState("");

  // =========================================================
  // GET CASE ID
  // =========================================================

  function getCaseID(item) {

    const id =
      item?.CaseID ??
      item?.caseID ??
      item?.caseId ??
      item?.["Case ID"] ??
      item?.["Case No"] ??
      item?.["Case Number"] ??
      "";

    return String(id).trim();
  }

  // =========================================================
  // GET STUDENT ID
  // =========================================================

  function getStudentID(item) {

    return String(
      item?.StudentID ??
      item?.studentID ??
      item?.studentId ??
      ""
    ).trim();
  }

  // =========================================================
  // GET STUDENT NAME
  // =========================================================

  function studentName(id) {

    if (!id) return "-";

    const student = (students || []).find(
      (x) =>
        String(x.StudentID || "").trim() ===
        String(id).trim()
    );

    return student?.StudentName || "-";
  }

  // =========================================================
  // GET EXAMINER NAME
  // =========================================================

  function examinerName(id) {

    if (!id) return "-";

    const examiner = (examiners || []).find(
      (x) =>
        String(x.ExaminerID || "").trim() ===
        String(id).trim()
    );

    return examiner?.ExaminerName || "-";
  }

  // =========================================================
  // INTERNAL EXAMINERS
  // =========================================================

  function internalExaminers(item) {

    const names = [

      examinerName(
        item?.InternalExaminer1ID
      ),

      examinerName(
        item?.InternalExaminer2ID
      ),

    ].filter(
      (name) =>
        name &&
        name !== "-"
    );

    return names.join("\n");
  }

  // =========================================================
  // EXTERNAL EXAMINERS
  // =========================================================

  function externalExaminers(item) {

    const names = [

      examinerName(
        item?.ExternalExaminer1ID
      ),

      examinerName(
        item?.ExternalExaminer2ID
      ),

    ].filter(
      (name) =>
        name &&
        name !== "-"
    );

    return names.join("\n");
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredCases = useMemo(() => {

    const list = Array.isArray(cases)
      ? cases
      : [];

    if (!search.trim()) {
      return list;
    }

    const keyword =
      search
        .toLowerCase()
        .trim();

    return list.filter((item) => {

      const caseID =
        getCaseID(item)
          .toLowerCase();

      const student =
        studentName(
          getStudentID(item)
        ).toLowerCase();

      const internal =
        internalExaminers(item)
          .toLowerCase();

      const external =
        externalExaminers(item)
          .toLowerCase();

      const status =
        String(
          item?.CurrentStatus ||
          item?.currentStatus ||
          ""
        ).toLowerCase();

      return (
        caseID.includes(keyword) ||
        student.includes(keyword) ||
        internal.includes(keyword) ||
        external.includes(keyword) ||
        status.includes(keyword)
      );

    });

  }, [
    cases,
    students,
    examiners,
    search,
  ]);

  // =========================================================
  // DELETE
  // =========================================================

  function handleDelete(item) {

    console.log(
      "DELETE TABLE ITEM:",
      item
    );

    const caseID =
      getCaseID(item);

    console.log(
      "CASE ID FROM TABLE:",
      caseID
    );

    if (!caseID) {

      alert(
        "Case ID is missing from this record."
      );

      return;
    }

    onDelete(caseID);
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="rounded-2xl bg-white p-4 shadow md:p-8">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <h2 className="text-xl font-bold">
          Existing Viva Cases
        </h2>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search case..."
          className="w-full rounded-xl border p-3 md:w-80"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="min-w-[1100px] w-full">

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

            {filteredCases.map(
              (item, index) => {

                const caseID =
                  getCaseID(item);

                const studentID =
                  getStudentID(item);

                const status =
                  item?.CurrentStatus ||
                  item?.currentStatus ||
                  "";

                const dueDate =
                  item?.ReportDueDate ||
                  item?.reportDueDate ||
                  item?.["Report Due Date"] ||
                  "";

                return (

                  <tr
                    key={
                      caseID ||
                      studentID ||
                      index
                    }
                    className="border-b hover:bg-gray-50"
                  >

                    {/* CASE ID */}

                    <td className="whitespace-nowrap p-3 font-semibold">

                      {caseID || "-"}

                    </td>

                    {/* STUDENT */}

                    <td className="whitespace-nowrap p-3">

                      {studentName(
                        studentID
                      )}

                    </td>

                    {/* INTERNAL */}

                    <td className="whitespace-pre-line p-3">

                      {internalExaminers(
                        item
                      ) || "-"}

                    </td>

                    {/* EXTERNAL */}

                    <td className="whitespace-pre-line p-3">

                      {externalExaminers(
                        item
                      ) || "-"}

                    </td>

                    {/* DUE DATE */}

                    <td className="whitespace-nowrap p-3">

                      {dueDate || "-"}

                    </td>

                    {/* STATUS */}

                    <td className="p-3">

                      {status ? (

                        <StatusBadge
                          status={status}
                        />

                      ) : (

                        "-"

                      )}

                    </td>

                    {/* ACTION */}

                    <td className="p-3">

                      <div className="flex justify-center gap-2">

                        {/* MANAGE */}

                        <button
                          type="button"
                          onClick={() =>
                            onManage(item)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >

                          <Settings
                            size={16}
                          />

                          Manage

                        </button>

                        {/* SCHEDULE */}

                        <button
                          type="button"
                          onClick={() =>
                            onSchedule(item)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
                        >

                          Schedule

                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          disabled={!caseID}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >

                          <Trash2
                            size={16}
                          />

                          Delete

                        </button>

                      </div>

                    </td>

                  </tr>

                );

              }
            )}

            {/* EMPTY */}

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

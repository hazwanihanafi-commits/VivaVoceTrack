import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  FileText,
  RefreshCw,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

export default function ExaminerReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * =====================================================
   * LOAD REPORTS
   * GET /api/reports
   * =====================================================
   */
  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/reports`
      );

      const result = await response.json();

      console.log(
        "EXAMINER REPORTS API:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load examiner reports."
        );
      }

      setReports(
        Array.isArray(result.reports)
          ? result.reports
          : []
      );

    } catch (err) {
      console.error(
        "LOAD EXAMINER REPORTS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load examiner reports."
      );

      setReports([]);

    } finally {
      setLoading(false);
    }
  }

  /**
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */
  useEffect(() => {
    loadReports();
  }, []);

  /**
   * =====================================================
   * FILTER
   * =====================================================
   */
  const filteredReports = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return reports.filter((report) => {

      const matchesSearch =
        !keyword ||
        [
          report.CaseID,
          report.StudentID,
          report.ExaminerID,
          report.ExaminerType,
          report.ReportFileName,
          report.CurrentStatus,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const received =
        String(
          report.ReportReceived || ""
        )
          .trim()
          .toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Received" &&
          received === "yes") ||
        (statusFilter === "Pending" &&
          received !== "yes");

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    reports,
    search,
    statusFilter,
  ]);

  /**
   * =====================================================
   * SUMMARY
   * =====================================================
   */
  const totalReports =
    reports.length;

  const submittedReports =
    reports.filter(
      (report) =>
        String(
          report.ReportReceived || ""
        )
          .trim()
          .toLowerCase() === "yes"
    ).length;

  const pendingReports =
    totalReports -
    submittedReports;

  /**
   * =====================================================
   * DATE FORMAT
   * =====================================================
   */
  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /**
   * =====================================================
   * REPORT STATUS
   * =====================================================
   */
  function isReceived(report) {
    return (
      String(
        report.ReportReceived || ""
      )
        .trim()
        .toLowerCase() === "yes"
    );
  }

  /**
   * =====================================================
   * VIEW REPORT
   * =====================================================
   */
  function viewReport(report) {

    if (
      report.ReportFileURL
    ) {
      window.open(
        report.ReportFileURL,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (
      report.GoogleDriveFileID
    ) {
      const url =
        `https://drive.google.com/file/d/${report.GoogleDriveFileID}/view`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    alert(
      "The examiner report file is not available yet."
    );
  }

  /**
   * =====================================================
   * LOADING
   * =====================================================
   */
  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Examiner Reports
          </h1>

          <p className="text-gray-500">
            Monitor examiner report submissions
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

          <RefreshCw
            size={28}
            className="mx-auto mb-3 animate-spin text-purple-600"
          />

          <p className="text-gray-500">
            Loading examiner reports...
          </p>

        </div>

      </div>
    );
  }

  /**
   * =====================================================
   * PAGE
   * =====================================================
   */
  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
          ================================================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Examiner Reports
          </h1>

          <p className="text-gray-500">
            Monitor examiner report submissions
          </p>
        </div>

        <button
          onClick={loadReports}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
          ================================================= */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <strong>
            Unable to load reports:
          </strong>{" "}
          {error}
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
          ================================================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* TOTAL */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Reports
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalReports}
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <FileText size={24} />
            </div>

          </div>

        </div>

        {/* SUBMITTED */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Submitted
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                {submittedReports}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <CheckCircle2 size={24} />
            </div>

          </div>

        </div>

        {/* PENDING */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="mt-1 text-3xl font-bold text-orange-600">
                {pendingReports}
              </p>
            </div>

            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <Clock3 size={24} />
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          TABLE CONTAINER
          ================================================= */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        {/* SEARCH + FILTER */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}
          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search case, examiner, student..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-purple-500"
            />

          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
          >
            <option value="All">
              All Reports
            </option>

            <option value="Received">
              Received
            </option>

            <option value="Pending">
              Pending
            </option>
          </select>

        </div>

        {/* =================================================
            TABLE
            ================================================= */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>

              <tr className="border-b text-left text-sm text-gray-500">

                <th className="px-3 py-3">
                  Case ID
                </th>

                <th className="px-3 py-3">
                  Student
                </th>

                <th className="px-3 py-3">
                  Examiner
                </th>

                <th className="px-3 py-3">
                  Type
                </th>

                <th className="px-3 py-3">
                  Report Status
                </th>

                <th className="px-3 py-3">
                  Report Date
                </th>

                <th className="px-3 py-3">
                  Due Date
                </th>

                <th className="px-3 py-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredReports.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="px-3 py-12 text-center text-gray-400"
                  >
                    No examiner reports found.
                  </td>

                </tr>

              ) : (

                filteredReports.map(
                  (report, index) => {

                    const received =
                      isReceived(
                        report
                      );

                    return (
                      <tr
                        key={`${report.CaseID}-${report.ExaminerID}-${index}`}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        {/* CASE */}
                        <td className="px-3 py-4">

                          <span className="font-semibold">
                            {report.CaseID ||
                              "-"}
                          </span>

                        </td>

                        {/* STUDENT */}
                        <td className="px-3 py-4">

                          <span className="text-gray-700">
                            {report.StudentID ||
                              "-"}
                          </span>

                        </td>

                        {/* EXAMINER */}
                        <td className="px-3 py-4">

                          <div>
                            <p className="font-medium">
                              {report.ExaminerID ||
                                "-"}
                            </p>

                            {report.ReportFileName && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                                {report.ReportFileName}
                              </p>
                            )}
                          </div>

                        </td>

                        {/* TYPE */}
                        <td className="px-3 py-4">

                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                            {report.ExaminerType ||
                              "-"}
                          </span>

                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-4">

                          {received ? (

                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              <CheckCircle2
                                size={14}
                              />
                              Received
                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                              <Clock3
                                size={14}
                              />
                              Pending
                            </span>

                          )}

                        </td>

                        {/* REPORT DATE */}
                        <td className="px-3 py-4 text-sm text-gray-600">
                          {formatDate(
                            report.ReportDate
                          )}
                        </td>

                        {/* DUE DATE */}
                        <td className="px-3 py-4 text-sm text-gray-600">
                          {formatDate(
                            report.ReportDueDate
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-3 py-4 text-center">

                          {received ? (

                            <button
                              onClick={() =>
                                viewReport(
                                  report
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                            >

                              <Eye
                                size={16}
                              />

                              View

                            </button>

                          ) : (

                            <span className="text-sm text-gray-400">
                              Pending
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            RESULT COUNT
            ================================================= */}
        <div className="mt-4 text-sm text-gray-500">

          Showing{" "}
          <strong>
            {filteredReports.length}
          </strong>{" "}
          of{" "}
          <strong>
            {reports.length}
          </strong>{" "}
          reports

        </div>

      </div>

    </div>
  );
}

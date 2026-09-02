import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

const API_URL = `${API_BASE_URL}/api/reports`;

export default function Report() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading reports from:", API_URL);

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load reports."
        );
      }

      setCases(result.data || []);
    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err);

      setError(
        err.message || "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = (value) => {
    return (
      String(value || "").trim().toLowerCase() === "yes"
    );
  };

  const getProgress = (item) => {
    const submitted = [
      item.Internal1ReportReceived,
      item.Internal2ReportReceived,
      item.External1ReportReceived,
      item.External2ReportReceived,
    ].filter(isSubmitted).length;

    return submitted;
  };

  const getStatus = (item) => {
    const progress = getProgress(item);

    if (progress === 4) {
      return "Completed";
    }

    if (progress > 0) {
      return "In Progress";
    }

    return "Pending";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const ReportStatus = ({ value, date }) => {
    if (isSubmitted(value)) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle size={14} />
            Submitted
          </span>

          {date && (
            <div className="mt-1 text-xs text-gray-400">
              {formatDate(date)}
            </div>
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle size={14} />
          Completed
        </span>
      );
    }

    if (status === "In Progress") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          <FileText size={14} />
          In Progress
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  const totalCases = cases.length;

  const completedCases = cases.filter(
    (item) => getProgress(item) === 4
  ).length;

  const submittedCases = cases.filter(
    (item) => getProgress(item) > 0
  ).length;

  const pendingCases = cases.filter(
    (item) => getProgress(item) === 0
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Examiner Reports
          </h1>

          <p className="mt-1 text-gray-500">
            Track Viva Voce report submissions from examiners.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />

          <div>
            <div className="font-semibold">
              Unable to load reports
            </div>

            <div className="text-sm">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        <SummaryCard
          title="Total Cases"
          value={totalCases}
          icon={<FileText size={22} />}
        />

        <SummaryCard
          title="Reports Submitted"
          value={submittedCases}
          icon={<CheckCircle size={22} />}
        />

        <SummaryCard
          title="Pending Reports"
          value={pendingCases}
          icon={<Clock size={22} />}
        />

        <SummaryCard
          title="Fully Completed"
          value={completedCases}
          icon={<CheckCircle size={22} />}
        />

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Examiner Report Tracking
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monitor individual examiner report submissions.
          </p>

        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <RefreshCw
              size={22}
              className="mr-3 animate-spin"
            />

            Loading reports...
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center">

            <FileText
              size={45}
              className="mx-auto mb-4 text-gray-300"
            />

            <h3 className="font-semibold text-gray-700">
              No Viva cases found
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Viva cases will appear here when available.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-gray-50">

                <tr className="border-b border-gray-200 text-left">

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Case ID
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Internal 1
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Internal 2
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    External 1
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    External 2
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Progress
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Due Date
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {cases.map((item, index) => {

                  const progress =
                    getProgress(item);

                  const status =
                    getStatus(item);

                  return (
                    <tr
                      key={
                        item.CaseID ||
                        index
                      }
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >

                      {/* CASE ID */}
                      <td className="px-5 py-5">

                        <span className="font-semibold text-purple-700">
                          {item.CaseID || "-"}
                        </span>

                      </td>

                      {/* STUDENT */}
                      <td className="px-5 py-5">

                        <div className="font-medium text-gray-800">
                          {item.StudentID || "-"}
                        </div>

                      </td>

                      {/* INTERNAL 1 */}
                      <td className="px-5 py-5">

                        <ReportStatus
                          value={
                            item.Internal1ReportReceived
                          }
                          date={
                            item.Internal1ReportDate
                          }
                        />

                      </td>

                      {/* INTERNAL 2 */}
                      <td className="px-5 py-5">

                        <ReportStatus
                          value={
                            item.Internal2ReportReceived
                          }
                          date={
                            item.Internal2ReportDate
                          }
                        />

                      </td>

                      {/* EXTERNAL 1 */}
                      <td className="px-5 py-5">

                        <ReportStatus
                          value={
                            item.External1ReportReceived
                          }
                          date={
                            item.External1ReportDate
                          }
                        />

                      </td>

                      {/* EXTERNAL 2 */}
                      <td className="px-5 py-5">

                        <ReportStatus
                          value={
                            item.External2ReportReceived
                          }
                          date={
                            item.External2ReportDate
                          }
                        />

                      </td>

                      {/* PROGRESS */}
                      <td className="px-5 py-5">

                        <div className="mb-1 text-sm font-semibold text-gray-700">
                          {progress}/4 Submitted
                        </div>

                        <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">

                          <div
                            className="h-full rounded-full bg-purple-600 transition-all"
                            style={{
                              width: `${progress * 25}%`,
                            }}
                          />

                        </div>

                      </td>

                      {/* DUE DATE */}
                      <td className="px-5 py-5 text-sm text-gray-600">

                        {formatDate(
                          item.ReportDueDate
                        )}

                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-5">

                        <StatusBadge
                          status={status}
                        />

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
          {icon}
        </div>

      </div>

    </div>
  );
}

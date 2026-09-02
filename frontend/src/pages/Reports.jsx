import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/reports`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load reports."
        );
      }

      setReports(data.data || []);

    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err);

      setError(
        err.message || "Unable to load reports."
      );

    } finally {
      setLoading(false);
    }
  };

  const getStatus = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };

  const getReportStatus = (row, examiner) => {
    const received =
      row[`${examiner}ReportReceived`];

    const date =
      row[`${examiner}ReportDate`];

    if (
      getStatus(received) === "yes" ||
      date
    ) {
      return "Submitted";
    }

    return "Pending";
  };

  const statusClass = (status) => {
    if (status === "Submitted") {
      return "bg-green-100 text-green-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-white p-10 text-center shadow">
          Loading reports...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Viva Voce Reports
        </h1>

        <p className="mt-2 text-gray-500">
          Track examiner report submissions
          for each Viva Voce case.
        </p>

      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Cases
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-700">
            {reports.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Reports Received
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              reports.filter(
                (row) =>
                  getStatus(
                    row.Internal1ReportReceived
                  ) === "yes" ||
                  getStatus(
                    row.Internal2ReportReceived
                  ) === "yes" ||
                  getStatus(
                    row.External1ReportReceived
                  ) === "yes" ||
                  getStatus(
                    row.External2ReportReceived
                  ) === "yes"
              ).length
            }
          </p>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Pending Cases
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {
              reports.filter(
                (row) =>
                  getStatus(
                    row.Internal1ReportReceived
                  ) !== "yes" &&
                  getStatus(
                    row.Internal2ReportReceived
                  ) !== "yes" &&
                  getStatus(
                    row.External1ReportReceived
                  ) !== "yes" &&
                  getStatus(
                    row.External2ReportReceived
                  ) !== "yes"
              ).length
            }
          </p>

        </div>

      </div>

      {/* REPORT TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-lg font-semibold text-gray-800">
            Examiner Report Tracking
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Case ID
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Student
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Internal 1
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Internal 2
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  External 1
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  External 2
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {reports.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No Viva Voce reports found.
                  </td>

                </tr>

              ) : (

                reports.map((row, index) => {

                  const submitted =
                    [
                      row.Internal1ReportReceived,
                      row.Internal2ReportReceived,
                      row.External1ReportReceived,
                      row.External2ReportReceived,
                    ].filter(
                      (value) =>
                        getStatus(value) === "yes"
                    ).length;

                  return (

                    <tr
                      key={
                        row.CaseID ||
                        index
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-semibold text-purple-700">
                        {row.CaseID || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {row.StudentID || "-"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            getReportStatus(
                              row,
                              "Internal1"
                            )
                          )}`}
                        >
                          {getReportStatus(
                            row,
                            "Internal1"
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            getReportStatus(
                              row,
                              "Internal2"
                            )
                          )}`}
                        >
                          {getReportStatus(
                            row,
                            "Internal2"
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            getReportStatus(
                              row,
                              "External1"
                            )
                          )}`}
                        >
                          {getReportStatus(
                            row,
                            "External1"
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            getReportStatus(
                              row,
                              "External2"
                            )
                          )}`}
                        >
                          {getReportStatus(
                            row,
                            "External2"
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">

                          {submitted}/4 Submitted

                        </span>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

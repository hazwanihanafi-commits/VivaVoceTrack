import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function responseLabel(value) {
  if (value === "Yes") return "Accepted";
  if (value === "No") return "Unable to Attend";
  if (value === "Suggest") return "Suggested Alternative";
  return "No Response";
}

function responseClass(value) {
  if (value === "Yes") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "No") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "Suggest") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-gray-50 text-gray-500 border-gray-200";
}

function ResponseIcon({ value, size = 18 }) {
  if (value === "Yes") {
    return <CheckCircle2 size={size} />;
  }

  if (value === "No") {
    return <XCircle size={size} />;
  }

  if (value === "Suggest") {
    return <Clock3 size={size} />;
  }

  return <Clock3 size={size} />;
}

export default function PanelResponses() {
  const [cases, setCases] = useState([]);
  const [students, setStudents] = useState([]);
  const [panelData, setPanelData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function getJson(url) {
    const response = await fetch(url);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load panel responses."
      );
    }

    return data;
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [scheduleData, studentData] =
        await Promise.all([
          getJson(`${API}/schedule`),
          getJson(`${API}/students`),
        ]);

      const scheduleCases = Array.isArray(scheduleData.data)
        ? scheduleData.data
        : [];

      const studentRows = Array.isArray(studentData.data)
        ? studentData.data
        : [];

      setCases(scheduleCases);
      setStudents(studentRows);

      /*
       * Load panel members for every Viva case.
       */
      const panelResults = await Promise.all(
        scheduleCases.map(async (item) => {
          try {
            const result = await getJson(
              `${API}/api/panel/viva/${encodeURIComponent(
                item.CaseID
              )}`
            );

            return {
              vivaID: item.CaseID,
              data: Array.isArray(result.data)
                ? result.data
                : [],
            };
          } catch (err) {
            console.error(
              `Unable to load panel ${item.CaseID}:`,
              err
            );

            return {
              vivaID: item.CaseID,
              data: [],
            };
          }
        })
      );

      const map = {};

      panelResults.forEach((item) => {
        map[item.vivaID] = item.data;
      });

      setPanelData(map);
    } catch (err) {
      console.error("LOAD PANEL RESPONSES ERROR:", err);

      setError(
        err.message ||
          "Unable to load panel responses."
      );
    } finally {
      setLoading(false);
    }
  }

  const studentMap = useMemo(
    () =>
      Object.fromEntries(
        students.map((s) => [
          s.StudentID,
          s,
        ])
      ),
    [students]
  );

  function studentName(item) {
    return (
      studentMap[item.StudentID]?.StudentName ||
      item.StudentID ||
      "Unknown student"
    );
  }

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();

    return cases.filter((item) => {
      if (!q) return true;

      const panels =
        panelData[item.CaseID] || [];

      const panelText = panels
        .map(
          (p) =>
            `${p.PanelID} ${p.PanelName || ""} ${
              p.Role || ""
            } ${p.PersonType || ""} ${
              p.Accepted || ""
            }`
        )
        .join(" ");

      return `${item.CaseID} ${
        item.StudentID
      } ${studentName(item)} ${panelText}`
        .toLowerCase()
        .includes(q);
    });
  }, [cases, panelData, search, studentMap]);

  function openResponses(item) {
    setSelectedCase(item);
  }

  async function openPreview(panel) {
    try {
      const result = await getJson(
        `${API}/api/panel/${encodeURIComponent(
          panel.PanelID
        )}`
      );

      setSelectedPanel(result.data);
      setPreviewOpen(true);
    } catch (err) {
      alert(
        err.message ||
          "Unable to load panel response."
      );
    }
  }

  function closeAll() {
    setPreviewOpen(false);
    setSelectedPanel(null);
  }

  const stats = useMemo(() => {
    let total = 0;
    let accepted = 0;
    let unable = 0;
    let suggested = 0;
    let pending = 0;

    Object.values(panelData).forEach(
      (panels) => {
        panels.forEach((panel) => {
          total++;

          if (panel.Accepted === "Yes") {
            accepted++;
          } else if (panel.Accepted === "No") {
            unable++;
          } else if (
            panel.Accepted === "Suggest"
          ) {
            suggested++;
          } else {
            pending++;
          }
        });
      }
    );

    return {
      total,
      accepted,
      unable,
      suggested,
      pending,
    };
  }, [panelData]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel Responses
          </h1>

          <p className="mt-1 text-gray-500">
            Monitor panel availability and Viva Voce schedule responses.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <StatCard
          icon={Users}
          label="Total Panels"
          value={stats.total}
        />

        <StatCard
          icon={CheckCircle2}
          label="Accepted"
          value={stats.accepted}
        />

        <StatCard
          icon={XCircle}
          label="Unable"
          value={stats.unable}
        />

        <StatCard
          icon={Clock3}
          label="Suggested"
          value={stats.suggested}
        />

        <StatCard
          icon={UserCheck}
          label="Pending"
          value={stats.pending}
        />

      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search Case ID, student, panel or response..."
            className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-purple-500"
          />

        </div>

      </div>

      {/* CASE LIST */}
      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-5 py-4">
          <h2 className="font-bold text-gray-900">
            Viva Cases
          </h2>

          <p className="text-sm text-gray-500">
            Select a case to view panel responses.
          </p>
        </div>

        {loading ? (
          <div className="py-14 text-center text-gray-500">
            Loading panel responses...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-14 text-center text-gray-500">
            No Viva cases found.
          </div>
        ) : (
          <div className="divide-y">

            {filteredCases.map((item) => {

              const panels =
                panelData[item.CaseID] || [];

              const responded =
                panels.filter(
                  (p) => p.Accepted
                ).length;

              return (
                <div
                  key={item.CaseID}
                  className="flex flex-col gap-4 p-5 hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                >

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                        <CalendarDays size={22} />
                      </div>

                      <div>
                        <div className="font-bold text-gray-900">
                          {studentName(item)}
                        </div>

                        <div className="text-sm text-gray-400">
                          {item.CaseID}
                        </div>
                      </div>

                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

                      <span>
                        Viva Date:{" "}
                        <strong className="text-gray-700">
                          {formatDate(
                            item.ConfirmedVivaDate ||
                              item.TentativeVivaDate
                          )}
                        </strong>
                      </span>

                      <span>
                        Time:{" "}
                        <strong className="text-gray-700">
                          {item.VivaTime || "—"}
                        </strong>
                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <div className="text-right">

                      <div className="text-sm text-gray-500">
                        Panel Responses
                      </div>

                      <div className="font-bold text-gray-900">
                        {responded} / {panels.length}
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        openResponses(item)
                      }
                      className="rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                    >
                      View Responses
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* RESPONSE MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Panel Responses
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedCase.CaseID} —{" "}
                  {studentName(selectedCase)}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCase(null)
                }
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X />
              </button>

            </div>

            {/* TABLE */}
            <div className="max-h-[70vh] overflow-auto">

              {(
                panelData[
                  selectedCase.CaseID
                ] || []
              ).length === 0 ? (

                <div className="py-16 text-center text-gray-500">
                  No panel members found for this Viva case.
                </div>

              ) : (

                <table className="w-full min-w-[850px]">

                  <thead className="sticky top-0 bg-gray-50">

                    <tr className="border-b text-left text-sm text-gray-500">

                      <th className="px-6 py-4">
                        Panel
                      </th>

                      <th className="px-4 py-4">
                        Role
                      </th>

                      <th className="px-4 py-4">
                        Response
                      </th>

                      <th className="px-4 py-4">
                        Response Date
                      </th>

                      <th className="px-4 py-4">
                        Remarks
                      </th>

                      <th className="px-6 py-4 text-center">
                        Preview
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {(
                      panelData[
                        selectedCase.CaseID
                      ] || []
                    ).map((panel) => (

                      <tr
                        key={panel.PanelID}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <div className="font-semibold text-gray-900">
                            {panel.PanelName ||
                              panel.Name ||
                              panel.PanelID}
                          </div>

                          <div className="text-xs text-gray-400">
                            {panel.PanelID}
                          </div>

                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {panel.Role || "—"}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${responseClass(
                              panel.Accepted
                            )}`}
                          >

                            <ResponseIcon
                              value={
                                panel.Accepted
                              }
                              size={15}
                            />

                            {responseLabel(
                              panel.Accepted
                            )}

                          </span>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {formatDateTime(
                            panel.ResponseDate
                          )}
                        </td>

                        <td className="max-w-[220px] px-4 py-4 text-sm text-gray-500">
                          {panel.Remarks || "—"}
                        </td>

                        <td className="px-6 py-4 text-center">

                          <button
                            onClick={() =>
                              openPreview(panel)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                          >
                            <Eye size={16} />
                            Preview
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </div>
      )}

      {/* ADMIN PREVIEW */}
      {previewOpen && selectedPanel && (
        <PanelPreview
          panel={selectedPanel}
          onClose={closeAll}
        />
      )}

    </div>
  );
}


/* ======================================================
   ADMIN PREVIEW
====================================================== */

function PanelPreview({ panel, onClose }) {

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* PREVIEW HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <div className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Admin Preview
            </div>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Panel Response
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>

        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto">

          {/* UNIVERSITY */}
          <div className="border-b px-6 py-7 text-center">

            <div className="text-2xl font-bold text-purple-600">
              Universiti Sains Malaysia
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Pusat Kanser Tun Abdullah Ahmad Badawi
            </div>

          </div>

          <div className="space-y-7 p-6">

            {/* TITLE */}
            <div className="rounded-2xl border bg-gray-50 px-6 py-7 text-center">

              <h1 className="text-2xl font-bold text-gray-900">
                Viva Voce Schedule Confirmation
              </h1>

              <p className="mt-2 text-gray-500">
                Panel Member Response
              </p>

            </div>

            {/* PANEL INFORMATION */}
            <PreviewSection title="Panel Information">

              <PreviewGrid>

                <Info
                  label="Panel ID"
                  value={panel.PanelID}
                />

                <Info
                  label="Panel Name"
                  value={
                    panel.PanelName ||
                    panel.Name
                  }
                />

                <Info
                  label="Role"
                  value={panel.Role}
                />

                <Info
                  label="Person Type"
                  value={panel.PersonType}
                />

              </PreviewGrid>

            </PreviewSection>

            {/* VIVA INFORMATION */}
            <PreviewSection title="Viva Voce Schedule">

              <PreviewGrid>

                <Info
                  label="Viva ID"
                  value={panel.VivaID}
                />

                <Info
                  label="Proposed Date"
                  value={formatDate(
                    panel.TentativeVivaDate
                  )}
                />

                <Info
                  label="Time"
                  value={panel.VivaTime}
                />

                <Info
                  label="Venue"
                  value={panel.Venue}
                />

              </PreviewGrid>

            </PreviewSection>

            {/* RESPONSE */}
            <PreviewSection title="Panel Response">

              <div
                className={`rounded-2xl border p-5 ${responseClass(
                  panel.Accepted
                )}`}
              >

                <div className="flex items-start gap-4">

                  <ResponseIcon
                    value={panel.Accepted}
                    size={25}
                  />

                  <div>

                    <div className="text-lg font-bold">
                      {responseLabel(
                        panel.Accepted
                      )}
                    </div>

                    {panel.ResponseDate && (
                      <div className="mt-1 text-sm opacity-75">
                        Submitted{" "}
                        {formatDateTime(
                          panel.ResponseDate
                        )}
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </PreviewSection>

            {/* SUGGESTED DATE */}
            {panel.Accepted === "Suggest" && (
              <PreviewSection title="Suggested Schedule">

                <PreviewGrid>

                  <Info
                    label="Suggested Date"
                    value={formatDate(
                      panel.SuggestedDate
                    )}
                  />

                  <Info
                    label="Suggested Time"
                    value={
                      panel.SuggestedTime
                    }
                  />

                </PreviewGrid>

              </PreviewSection>
            )}

            {/* REMARKS */}
            {panel.Remarks && (
              <PreviewSection title="Remarks">

                <div className="rounded-xl border bg-gray-50 p-4 text-gray-700">
                  {panel.Remarks}
                </div>

              </PreviewSection>
            )}

          </div>

          {/* FOOTER */}
          <div className="border-t bg-gray-50 px-6 py-5 text-center">

            <button
              onClick={onClose}
              className="rounded-xl bg-purple-600 px-7 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Close Preview
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


function PreviewSection({ title, children }) {
  return (
    <section>

      <h3 className="mb-3 text-lg font-bold text-gray-900">
        {title}
      </h3>

      {children}

    </section>
  );
}


function PreviewGrid({ children }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {children}
    </div>
  );
}


function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <div className="text-xs font-medium text-gray-400">
        {label}
      </div>

      <div className="mt-1 font-semibold text-gray-900">
        {value || "—"}
      </div>

    </div>
  );
}


function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
          <Icon size={21} />
        </div>

        <div>

          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

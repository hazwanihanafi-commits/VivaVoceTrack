import React, { useEffect, useState } from "react";

import {
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  RefreshCw,
  Users,
  CalendarDays,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

export default function PanelResponses() {

  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPanel, setSelectedPanel] = useState(null);

  const loadPanels = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/panel`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Unable to load panel responses."
        );
      }

      setPanels(data.data || []);

    } catch (err) {

      console.error(
        "LOAD PANEL RESPONSES ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to load panel responses."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadPanels();
  }, []);


  const formatDate = (date) => {

    if (!date) return "-";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-MY",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatDateTime = (date) => {

    if (!date) return "-";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString(
      "en-MY",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  const getStatus = (panel) => {

    const response =
      String(panel?.Accepted || "")
        .trim()
        .toLowerCase();

    if (
      response === "yes" ||
      response === "accepted"
    ) {
      return "accepted";
    }

    if (
      response === "no" ||
      response === "declined"
    ) {
      return "declined";
    }

    if (
      response === "suggest"
    ) {
      return "suggest";
    }

    return "pending";
  };


  const statusConfig = {
    accepted: {
      label: "Accepted",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    declined: {
      label: "Declined",
      icon: XCircle,
      className:
        "bg-red-50 text-red-700 border-red-200",
    },

    suggest: {
      label: "Suggested",
      icon: CalendarDays,
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    pending: {
      label: "Pending",
      icon: Clock3,
      className:
        "bg-gray-50 text-gray-600 border-gray-200",
    },
  };


  const acceptedCount =
    panels.filter(
      (p) => getStatus(p) === "accepted"
    ).length;


  const declinedCount =
    panels.filter(
      (p) => getStatus(p) === "declined"
    ).length;


  const suggestedCount =
    panels.filter(
      (p) => getStatus(p) === "suggest"
    ).length;


  const pendingCount =
    panels.filter(
      (p) => getStatus(p) === "pending"
    ).length;


  if (loading) {

    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <RefreshCw
            className="mx-auto mb-3 animate-spin text-purple-600"
            size={30}
          />

          <p className="text-gray-500">
            Loading panel responses...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Panel Responses
          </h1>

          <p className="mt-1 text-gray-500">
            Monitor Viva Voce panel invitation responses.
          </p>

        </div>

        <button
          onClick={loadPanels}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <SummaryCard
          icon={Users}
          title="Total Panels"
          value={panels.length}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Accepted"
          value={acceptedCount}
        />

        <SummaryCard
          icon={XCircle}
          title="Declined"
          value={declinedCount}
        />

        <SummaryCard
          icon={Clock3}
          title="Pending"
          value={pendingCount}
        />

      </div>


      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Panel Response List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {panels.length} panel invitation
            {panels.length !== 1 ? "s" : ""}
          </p>

        </div>


        {panels.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <Users
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <h3 className="font-semibold text-gray-700">
              No panel responses
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Panel invitations will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Panel
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Viva
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Proposed Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Response
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Responded
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {panels.map((panel, index) => {

                  const status =
                    getStatus(panel);

                  const config =
                    statusConfig[status];

                  const Icon =
                    config.icon;

                  return (
                    <tr
                      key={
                        panel.PanelID ||
                        index
                      }
                      className="transition hover:bg-purple-50/30"
                    >

                      {/* PANEL */}
                      <td className="px-6 py-5">

                        <div className="font-semibold text-gray-900">
                          {panel.PanelID || "-"}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          {panel.PanelName ||
                            panel.Name ||
                            "-"}
                        </div>

                      </td>


                      {/* VIVA */}
                      <td className="px-6 py-5">

                        <div className="font-semibold text-gray-800">
                          {panel.VivaID || "-"}
                        </div>

                      </td>


                      {/* ROLE */}
                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                          {panel.Role || "-"}
                        </span>

                      </td>


                      {/* DATE */}
                      <td className="px-6 py-5 text-sm text-gray-700">

                        {formatDate(
                          panel.TentativeVivaDate
                        )}

                      </td>


                      {/* STATUS */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.className}`}
                        >

                          <Icon size={15} />

                          {config.label}

                        </span>

                      </td>


                      {/* RESPONSE DATE */}
                      <td className="px-6 py-5 text-sm text-gray-600">

                        {panel.ResponseDate
                          ? formatDateTime(
                              panel.ResponseDate
                            )
                          : "-"}

                      </td>


                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">

                        <button
                          onClick={() =>
                            setSelectedPanel(panel)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                        >

                          <Eye size={17} />

                          View

                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* PREVIEW MODAL */}
      {selectedPanel && (
        <PanelPreview
          panel={selectedPanel}
          onClose={() =>
            setSelectedPanel(null)
          }
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          getStatus={getStatus}
          statusConfig={statusConfig}
        />
      )}

    </div>
  );
}


/* ======================================================
   SUMMARY CARD
====================================================== */

function SummaryCard({
  icon: Icon,
  title,
  value,
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

          <Icon size={24} />

        </div>

      </div>

    </div>
  );
}


/* ======================================================
   PREVIEW MODAL
====================================================== */

function PanelPreview({
  panel,
  onClose,
  formatDate,
  formatDateTime,
  getStatus,
  statusConfig,
}) {

  const status =
    getStatus(panel);

  const config =
    statusConfig[status];

  const Icon =
    config.icon;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Admin Preview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Panel Response
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={24} />
          </button>

        </div>


        {/* CONTENT */}
        <div className="overflow-y-auto">

          {/* UNIVERSITY */}
          <div className="border-b px-6 py-7 text-center">

            <h1 className="text-2xl font-bold text-purple-600">
              Universiti Sains Malaysia
            </h1>

            <p className="mt-2 text-gray-500">
              Pusat Kanser Tun Abdullah Ahmad Badawi
            </p>

          </div>


          {/* TITLE */}
          <div className="mx-6 mt-6 rounded-2xl border border-gray-300 bg-gray-50 px-6 py-6 text-center">

            <h2 className="text-xl font-bold text-gray-900">
              Viva Voce Schedule Confirmation
            </h2>

            <p className="mt-2 text-gray-500">
              Panel Member Response
            </p>

          </div>


          <div className="space-y-7 px-6 py-7">

            {/* PANEL INFORMATION */}
            <PreviewSection title="Panel Information">

              <PreviewGrid>

                <PreviewItem
                  label="Panel ID"
                  value={panel.PanelID}
                />

                <PreviewItem
                  label="Panel Name"
                  value={
                    panel.PanelName ||
                    panel.Name
                  }
                />

                <PreviewItem
                  label="Role"
                  value={panel.Role}
                />

                <PreviewItem
                  label="Person Type"
                  value={panel.PersonType}
                />

              </PreviewGrid>

            </PreviewSection>


            {/* VIVA */}
            <PreviewSection title="Viva Voce Schedule">

              <PreviewGrid>

                <PreviewItem
                  label="Viva ID"
                  value={panel.VivaID}
                />

                <PreviewItem
                  label="Proposed Date"
                  value={formatDate(
                    panel.TentativeVivaDate
                  )}
                />

                <PreviewItem
                  label="Time"
                  value={
                    panel.VivaTime
                  }
                />

                <PreviewItem
                  label="Venue"
                  value={
                    panel.Venue
                  }
                />

              </PreviewGrid>

            </PreviewSection>


            {/* RESPONSE */}
            <PreviewSection title="Panel Response">

              <div
                className={`rounded-2xl border p-5 ${config.className}`}
              >

                <div className="flex items-start gap-4">

                  <Icon size={25} />

                  <div>

                    <p className="text-lg font-bold">
                      {config.label}
                    </p>

                    <p className="mt-1 text-sm opacity-80">

                      {panel.ResponseDate
                        ? `Submitted ${formatDateTime(
                            panel.ResponseDate
                          )}`
                        : "No response submitted yet"}

                    </p>

                  </div>

                </div>

              </div>

            </PreviewSection>


            {/* SUGGESTED DATE */}
            {panel.SuggestedDate && (
              <PreviewSection title="Suggested Schedule">

                <PreviewGrid>

                  <PreviewItem
                    label="Suggested Date"
                    value={formatDate(
                      panel.SuggestedDate
                    )}
                  />

                  <PreviewItem
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

                <div className="rounded-xl bg-gray-50 p-4 text-gray-700">
                  {panel.Remarks}
                </div>

              </PreviewSection>
            )}

          </div>

        </div>


        {/* FOOTER */}
        <div className="border-t bg-gray-50 px-6 py-5 text-center">

          <button
            onClick={onClose}
            className="rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Close Preview
          </button>

        </div>

      </div>

    </div>
  );
}


/* ======================================================
   PREVIEW COMPONENTS
====================================================== */

function PreviewSection({
  title,
  children,
}) {
  return (
    <section>

      <h3 className="mb-3 text-lg font-bold text-gray-900">
        {title}
      </h3>

      {children}

    </section>
  );
}


function PreviewGrid({
  children,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
}


function PreviewItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-gray-800">
        {value || "—"}
      </p>

    </div>
  );
}

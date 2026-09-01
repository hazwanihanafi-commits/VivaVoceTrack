import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Eye,
  Link as LinkIcon,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  X,
  Users,
  CheckCircle2,
  XCircle,
  Clock4,
  MessageSquare,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

const emptyForm = {
  caseID: "",
  TentativeVivaDate: "",
  ConfirmedVivaDate: "",
  VivaTime: "",
  Venue: "",
  VivaMode: "Physical",
  MeetingLink: "",
  Chairperson: "",
  Secretary: "",
};

function statusClass(status) {
  const map = {
    Scheduled: "bg-amber-100 text-amber-700",
    Confirmed: "bg-emerald-100 text-emerald-700",
    Postponed: "bg-orange-100 text-orange-700",
    Cancelled: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
    Draft: "bg-gray-100 text-gray-600",
  };

  return map[status] || "bg-gray-100 text-gray-600";
}

function displayDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
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

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const requestedCaseID = searchParams.get("caseID");

  const [cases, setCases] = useState([]);
  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [staff, setStaff] = useState([]);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [selectedCase, setSelectedCase] = useState(null);
  const [panelResponses, setPanelResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const [selectedPanel, setSelectedPanel] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, [requestedCaseID]);

  async function getJson(url, options) {
    const res = await fetch(url, options);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [
        scheduleData,
        studentData,
        examinerData,
        staffData,
      ] = await Promise.all([
        getJson(`${API}/api/schedule`),
        getJson(`${API}/api/students`),
        getJson(`${API}/api/examiners`),
        getJson(`${API}/api/staff`),
      ]);

      setCases(
        Array.isArray(scheduleData.data)
          ? scheduleData.data
          : []
      );

      setStudents(
        Array.isArray(studentData.data)
          ? studentData.data
          : []
      );

      setExaminers(
        Array.isArray(examinerData.data)
          ? examinerData.data
          : []
      );

      setStaff(
        Array.isArray(staffData.data)
          ? staffData.data
          : []
      );

      if (requestedCaseID) {
        try {
          const caseData = await getJson(
            `${API}/api/schedule/${requestedCaseID}`
          );

          if (caseData?.data) {
            openCreate(caseData.data);
          }
        } catch (err) {
          console.error(
            "Unable to load requested Viva case:",
            err
          );
        }
      }
    } catch (err) {
      console.error("LOAD SCHEDULE ERROR:", err);

      setError(
        err.message ||
          "Unable to load Viva schedules."
      );
    } finally {
      setLoading(false);
    }
  }

  const studentMap = useMemo(
    () =>
      Object.fromEntries(
        students.map((s) => [s.StudentID, s])
      ),
    [students]
  );

  const examinerMap = useMemo(
    () =>
      Object.fromEntries(
        examiners.map((e) => [e.ExaminerID, e])
      ),
    [examiners]
  );

  const staffMap = useMemo(
    () =>
      Object.fromEntries(
        staff.map((s) => [s.StaffID, s])
      ),
    [staff]
  );

  function studentName(item) {
    return (
      studentMap[item.StudentID]?.StudentName ||
      item.StudentID ||
      "Unknown student"
    );
  }

  function examinerName(value) {
    if (!value) return "—";

    return (
      examinerMap[value]?.ExaminerName ||
      value
    );
  }

  function staffName(value) {
    if (!value) return "—";

    return (
      staffMap[value]?.StaffName ||
      value
    );
  }

  function openCreate(item = null) {
    if (!item) {
      setForm({ ...emptyForm });
      setModalOpen(true);
      return;
    }

    setForm({
      caseID: item.CaseID || "",

      TentativeVivaDate:
        dateInput(item.TentativeVivaDate),

      ConfirmedVivaDate:
        dateInput(item.ConfirmedVivaDate),

      VivaTime: item.VivaTime || "",

      Venue: item.Venue || "",

      VivaMode:
        item.VivaMode || "Physical",

      MeetingLink:
        item.MeetingLink || "",

      Chairperson:
        item.Chairperson ||
        item.ChairpersonID ||
        "",

      Secretary:
        item.Secretary ||
        item.SecretaryID ||
        "",
    });

    setModalOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveSchedule(event) {
    event.preventDefault();

    if (!form.caseID) {
      alert("Please select a Viva Case.");
      return;
    }

    if (
      !form.TentativeVivaDate &&
      !form.ConfirmedVivaDate
    ) {
      alert("Please select a Viva date.");
      return;
    }

    try {
      setSaving(true);

      const existing = cases.find(
        (item) =>
          item.CaseID === form.caseID
      );

      const hasExistingSchedule =
        existing?.TentativeVivaDate ||
        existing?.ConfirmedVivaDate ||
        existing?.VivaTime ||
        existing?.Venue;

      const payload = {
        TentativeVivaDate:
          form.TentativeVivaDate || "",

        ConfirmedVivaDate:
          form.ConfirmedVivaDate ||
          form.TentativeVivaDate ||
          "",

        VivaTime:
          form.VivaTime || "",

        Venue:
          form.Venue || "",

        VivaMode:
          form.VivaMode || "Physical",

        MeetingLink:
          form.MeetingLink || "",

        ChairpersonID:
          form.Chairperson || "",

        SecretaryID:
          form.Secretary || "",

        CurrentStatus:
          "Scheduled",
      };

      const method =
        hasExistingSchedule
          ? "PUT"
          : "POST";

      await getJson(
        `${API}/api/schedule/${form.caseID}`,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      setModalOpen(false);

      await loadAll();

      alert(
        "Viva schedule saved successfully."
      );
    } catch (err) {
      console.error(
        "SAVE SCHEDULE ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to save Viva schedule."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================
   * LOAD PANEL RESPONSES
   * ==========================================
   */

  async function openPanelResponses(item) {
    try {
      setSelectedCase(item);
      setResponseModalOpen(true);
      setLoadingResponses(true);
      setPanelResponses([]);
      setSelectedPanel(null);

      /*
       * IMPORTANT:
       *
       * This assumes your backend supports:
       *
       * GET /api/panel/viva/:caseID
       *
       * If your backend uses another endpoint,
       * change ONLY this URL.
       */

      const result = await getJson(
        `${API}/api/panel/viva/${encodeURIComponent(
          item.CaseID
        )}`
      );

      setPanelResponses(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD PANEL RESPONSES ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to load panel responses."
      );
    } finally {
      setLoadingResponses(false);
    }
  }

  /*
   * ==========================================
   * PANEL RESPONSE STATUS
   * ==========================================
   */

  function responseValue(panel) {
    const value =
      panel?.Accepted ||
      panel?.Response ||
      panel?.response ||
      "";

    return String(value)
      .trim()
      .toLowerCase();
  }

  function responseLabel(panel) {
    const value = responseValue(panel);

    if (
      value === "yes" ||
      value === "accepted" ||
      value === "agree"
    ) {
      return "Accepted";
    }

    if (
      value === "no" ||
      value === "declined" ||
      value === "unable"
    ) {
      return "Unable";
    }

    if (
      value === "suggest" ||
      value === "suggested"
    ) {
      return "Suggested";
    }

    return "Pending";
  }

  function responseIcon(panel) {
    const status = responseLabel(panel);

    if (status === "Accepted") {
      return (
        <CheckCircle2
          size={18}
          className="text-emerald-600"
        />
      );
    }

    if (status === "Unable") {
      return (
        <XCircle
          size={18}
          className="text-red-600"
        />
      );
    }

    if (status === "Suggested") {
      return (
        <Clock4
          size={18}
          className="text-orange-500"
        />
      );
    }

    return (
      <Clock4
        size={18}
        className="text-gray-400"
      />
    );
  }

  function responseBadge(panel) {
    const status =
      responseLabel(panel);

    const classes = {
      Accepted:
        "bg-emerald-100 text-emerald-700",
      Unable:
        "bg-red-100 text-red-700",
      Suggested:
        "bg-orange-100 text-orange-700",
      Pending:
        "bg-gray-100 text-gray-600",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          classes[status]
        }`}
      >
        {status}
      </span>
    );
  }

  function getPanelName(panel) {
    if (!panel) return "Unknown Panel";

    if (panel.PanelName) {
      return panel.PanelName;
    }

    if (panel.StaffName) {
      return panel.StaffName;
    }

    if (panel.ExaminerName) {
      return panel.ExaminerName;
    }

    if (panel.PersonName) {
      return panel.PersonName;
    }

    const id =
      panel.PersonID ||
      panel.StaffID ||
      panel.ExaminerID ||
      panel.PanelID;

    if (panel.PersonType === "Staff") {
      return staffName(id);
    }

    if (panel.PersonType === "Examiner") {
      return examinerName(id);
    }

    return id || "Unknown Panel";
  }

  function getResponseCounts(item) {
    /*
     * This uses response fields already loaded
     * into the case if your backend provides them.
     *
     * Otherwise the button will load the detailed
     * responses when clicked.
     */

    return {
      accepted:
        Number(item.PanelAccepted || 0),

      suggested:
        Number(item.PanelSuggested || 0),

      pending:
        Number(item.PanelPending || 0),

      unable:
        Number(item.PanelUnable || 0),
    };
  }

  async function action(caseID, type) {
    const labels = {
      confirm:
        "confirm this Viva schedule",
      postpone:
        "postpone this Viva",
      cancel:
        "cancel this Viva",
    };

    if (
      !window.confirm(
        `Are you sure you want to ${labels[type]}?`
      )
    ) {
      return;
    }

    try {
      const item = cases.find(
        (x) => x.CaseID === caseID
      );

      const payload =
        type === "confirm"
          ? {
              ConfirmedVivaDate:
                item?.ConfirmedVivaDate ||
                item?.TentativeVivaDate,

              VivaTime:
                item?.VivaTime || "",

              Venue:
                item?.Venue || "",

              VivaMode:
                item?.VivaMode || "",

              MeetingLink:
                item?.MeetingLink || "",
            }
          : {
              Remarks:
                type === "postpone"
                  ? "Viva postponed from Schedule page."
                  : "Viva cancelled from Schedule page.",
            };

      await getJson(
        `${API}/api/schedule/${caseID}/${type}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      await loadAll();
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          `Unable to ${type} Viva.`
      );
    }
  }

  const counts = useMemo(() => {
    const scheduled =
      cases.filter(
        (x) =>
          x.CurrentStatus ===
          "Scheduled"
      ).length;

    const confirmed =
      cases.filter(
        (x) =>
          x.CurrentStatus ===
          "Confirmed"
      ).length;

    const upcoming =
      cases.filter((x) => {
        const date = new Date(
          x.ConfirmedVivaDate ||
            x.TentativeVivaDate
        );

        return (
          ["Scheduled", "Confirmed"].includes(
            x.CurrentStatus
          ) &&
          !Number.isNaN(
            date.getTime()
          ) &&
          date >= new Date()
        );
      }).length;

    return {
      scheduled,
      confirmed,
      upcoming,
    };
  }, [cases]);

  const filtered = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    return cases
      .filter((item) => {
        if (
          tab === "scheduled"
        )
          return (
            item.CurrentStatus ===
            "Scheduled"
          );

        if (
          tab === "confirmed"
        )
          return (
            item.CurrentStatus ===
            "Confirmed"
          );

        if (
          tab === "postponed"
        )
          return (
            item.CurrentStatus ===
            "Postponed"
          );

        if (
          tab === "cancelled"
        )
          return (
            item.CurrentStatus ===
            "Cancelled"
          );

        return [
          "Scheduled",
          "Confirmed",
          "Postponed",
          "Cancelled",
        ].includes(
          item.CurrentStatus
        );
      })
      .filter((item) => {
        if (!q) return true;

        return [
          item.CaseID,
          item.StudentID,
          studentName(item),
          item.Programme,
          item.Venue,
          item.VivaMode,
          item.VivaTime,
          item.CurrentStatus,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const da = new Date(
          a.ConfirmedVivaDate ||
            a.TentativeVivaDate ||
            "2999-12-31"
        );

        const db = new Date(
          b.ConfirmedVivaDate ||
            b.TentativeVivaDate ||
            "2999-12-31"
        );

        return da - db;
      });
  }, [
    cases,
    search,
    tab,
    studentMap,
  ]);

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Viva Schedule
          </h1>

          <p className="mt-1 text-gray-500">
            Plan, confirm and manage Viva
            Voce examination schedules.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={loadAll}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() =>
              openCreate()
            }
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-purple-700"
          >
            <Plus size={18} />
            Schedule Viva
          </button>

        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 md:grid-cols-3">

        <StatCard
          icon={CalendarDays}
          label="Scheduled"
          value={counts.scheduled}
        />

        <StatCard
          icon={Check}
          label="Confirmed"
          value={counts.confirmed}
        />

        <StatCard
          icon={Clock3}
          label="Upcoming"
          value={counts.upcoming}
        />

      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-5">

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
              placeholder="Search student, Case ID, venue, status..."
              className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-purple-500"
            />

          </div>

          <div className="mt-4 flex flex-wrap gap-2">

            {[
              ["all", "All"],
              ["scheduled", "Scheduled"],
              ["confirmed", "Confirmed"],
              ["postponed", "Postponed"],
              ["cancelled", "Cancelled"],
            ].map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setTab(key)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    tab === key
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  {label}
                </button>
              )
            )}

          </div>
        </div>

        <div className="overflow-x-auto">

          {loading ? (
            <div className="py-14 text-center text-gray-500">
              Loading Viva schedules...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">

              <CalendarDays
                className="mx-auto mb-3 text-gray-300"
                size={40}
              />

              <p className="font-medium text-gray-600">
                No Viva schedules found.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Create a schedule from
                an existing Viva case.
              </p>

            </div>
          ) : (
            <table className="w-full min-w-[1300px]">

              <thead>

                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">

                  <th className="px-5 py-4">
                    Student / Case
                  </th>

                  <th>Date</th>

                  <th>Time</th>

                  <th>Mode / Venue</th>

                  <th>Chairperson</th>

                  <th>Panel Responses</th>

                  <th>Status</th>

                  <th className="px-5 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filtered.map(
                  (item) => {

                    const date =
                      item.ConfirmedVivaDate ||
                      item.TentativeVivaDate;

                    const responseCounts =
                      getResponseCounts(
                        item
                      );

                    return (
                      <tr
                        key={item.CaseID}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <div className="font-semibold text-gray-900">
                            {studentName(
                              item
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            {item.CaseID}
                          </div>

                        </td>

                        <td className="font-medium text-gray-700">
                          {displayDate(
                            date
                          )}
                        </td>

                        <td className="text-gray-600">
                          {item.VivaTime ||
                            "—"}
                        </td>

                        <td>

                          <div className="font-medium text-gray-700">
                            {item.VivaMode ||
                              "—"}
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-400">

                            {item.VivaMode ===
                              "Online" &&
                            item.MeetingLink ? (
                              <LinkIcon
                                size={13}
                              />
                            ) : (
                              <MapPin
                                size={13}
                              />
                            )}

                            {item.VivaMode ===
                              "Online" &&
                            item.MeetingLink
                              ? "Online meeting"
                              : item.Venue ||
                                "—"}

                          </div>

                        </td>

                        <td className="text-gray-600">
                          {staffName(
                            item.ChairpersonID ||
                              item.Chairperson
                          )}
                        </td>

                        {/* PANEL RESPONSE */}

                        <td>

                          <button
                            onClick={() =>
                              openPanelResponses(
                                item
                              )
                            }
                            className="group rounded-xl border bg-white px-3 py-2 text-left hover:border-purple-300 hover:bg-purple-50"
                          >

                            <div className="flex items-center gap-2">

                              <Users
                                size={16}
                                className="text-purple-600"
                              />

                              <span className="font-semibold text-gray-700">
                                View Responses
                              </span>

                              <Eye
                                size={14}
                                className="text-gray-400 group-hover:text-purple-600"
                              />

                            </div>

                          </button>

                        </td>

                        <td>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              item.CurrentStatus
                            )}`}
                          >
                            {item.CurrentStatus ||
                              "Draft"}
                          </span>

                        </td>

                        <td className="px-5">

                          <div className="flex justify-center gap-2">

                            <button
                              title="Edit schedule"
                              onClick={() =>
                                openCreate(
                                  item
                                )
                              }
                              className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100"
                            >
                              <Edit3
                                size={16}
                              />
                            </button>

                            {item.CurrentStatus ===
                              "Scheduled" && (
                              <button
                                title="Confirm"
                                onClick={() =>
                                  action(
                                    item.CaseID,
                                    "confirm"
                                  )
                                }
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check
                                  size={16}
                                />
                              </button>
                            )}

                            {![
                              "Cancelled",
                              "Postponed",
                              "Completed",
                            ].includes(
                              item.CurrentStatus
                            ) && (
                              <button
                                title="Postpone"
                                onClick={() =>
                                  action(
                                    item.CaseID,
                                    "postpone"
                                  )
                                }
                                className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50"
                              >
                                <Clock3
                                  size={16}
                                />
                              </button>
                            )}

                            {![
                              "Cancelled",
                              "Completed",
                            ].includes(
                              item.CurrentStatus
                            ) && (
                              <button
                                title="Cancel"
                                onClick={() =>
                                  action(
                                    item.CaseID,
                                    "cancel"
                                  )
                                }
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              >
                                <X
                                  size={16}
                                />
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>
          )}

        </div>
      </div>

      {/* ==========================================
          SCHEDULE MODAL
          ========================================== */}

      {modalOpen && (
        <ScheduleModal
          form={form}
          setForm={setForm}
          updateField={updateField}
          saveSchedule={saveSchedule}
          saving={saving}
          cases={cases}
          studentName={studentName}
          staff={staff}
          close={() =>
            setModalOpen(false)
          }
        />
      )}

      {/* ==========================================
          PANEL RESPONSE MODAL
          ========================================== */}

      {responseModalOpen && (
        <PanelResponseModal
          selectedCase={selectedCase}
          panelResponses={panelResponses}
          loading={loadingResponses}
          responseLabel={responseLabel}
          responseBadge={responseBadge}
          responseIcon={responseIcon}
          getPanelName={getPanelName}
          formatDateTime={formatDateTime}
          onPreview={(panel) => {
            setSelectedPanel(panel);
            setPreviewOpen(true);
          }}
          close={() => {
            setResponseModalOpen(false);
            setSelectedPanel(null);
          }}
        />
      )}

      {/* ==========================================
          RESPONSE PREVIEW
          ========================================== */}

      {previewOpen && (
        <ResponsePreview
          panel={selectedPanel}
          selectedCase={selectedCase}
          responseLabel={responseLabel}
          formatDateTime={formatDateTime}
          close={() =>
            setPreviewOpen(false)
          }
        />
      )}

    </div>
  );
}

/* ======================================================
   STAT CARD
====================================================== */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
          <Icon size={22} />
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

/* ======================================================
   SCHEDULE MODAL
====================================================== */

function ScheduleModal({
  form,
  setForm,
  updateField,
  saveSchedule,
  saving,
  cases,
  studentName,
  staff,
  close,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b p-5">

          <div>

            <h2 className="text-xl font-bold">
              {form.caseID
                ? "Viva Schedule"
                : "Schedule Viva"}
            </h2>

            <p className="text-sm text-gray-500">
              Enter the examination date,
              time and venue details.
            </p>

          </div>

          <button
            onClick={close}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        <form
          onSubmit={saveSchedule}
          className="space-y-5 p-6"
        >

          {!form.caseID ? (
            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Viva Case
              </span>

              <select
                name="caseID"
                value={form.caseID}
                onChange={updateField}
                required
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
              >

                <option value="">
                  Select a Viva case
                </option>

                {cases
                  .filter(
                    (x) =>
                      ![
                        "Completed",
                        "Cancelled",
                      ].includes(
                        x.CurrentStatus
                      )
                  )
                  .map((item) => (
                    <option
                      key={item.CaseID}
                      value={item.CaseID}
                    >
                      {item.CaseID} —{" "}
                      {studentName(item)}
                    </option>
                  ))}

              </select>

            </label>
          ) : (
            <div className="rounded-xl bg-purple-50 p-4">

              <div className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                Viva Case
              </div>

              <div className="mt-1 font-semibold text-purple-900">
                {form.caseID} —{" "}
                {studentName(
                  cases.find(
                    (x) =>
                      x.CaseID ===
                      form.caseID
                  ) || {}
                )}
              </div>

            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Tentative Viva Date"
              name="TentativeVivaDate"
              type="date"
              value={
                form.TentativeVivaDate
              }
              onChange={updateField}
            />

            <Field
              label="Confirmed Viva Date"
              name="ConfirmedVivaDate"
              type="date"
              value={
                form.ConfirmedVivaDate
              }
              onChange={updateField}
            />

            <Field
              label="Viva Time"
              name="VivaTime"
              type="time"
              value={form.VivaTime}
              onChange={updateField}
            />

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Viva Mode
              </span>

              <select
                name="VivaMode"
                value={form.VivaMode}
                onChange={updateField}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
              >

                <option>
                  Physical
                </option>

                <option>
                  Online
                </option>

                <option>
                  Hybrid
                </option>

              </select>

            </label>

            <Field
              label="Venue"
              name="Venue"
              value={form.Venue}
              onChange={updateField}
              placeholder="e.g. DK 1, PPS"
            />

            <Field
              label="Meeting Link"
              name="MeetingLink"
              value={
                form.MeetingLink
              }
              onChange={updateField}
              placeholder="https://..."
            />

            <PersonField
              label="Chairperson"
              name="Chairperson"
              value={form.Chairperson}
              onChange={updateField}
              staff={staff}
            />

            <PersonField
              label="Secretary"
              name="Secretary"
              value={form.Secretary}
              onChange={updateField}
              staff={staff}
            />

          </div>

          <div className="flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={close}
              className="rounded-xl border px-5 py-3 font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              type="submit"
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Schedule"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* ======================================================
   PANEL RESPONSE MODAL
====================================================== */

function PanelResponseModal({
  selectedCase,
  panelResponses,
  loading,
  responseLabel,
  responseBadge,
  responseIcon,
  getPanelName,
  formatDateTime,
  onPreview,
  close,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">
              Panel Responses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {selectedCase?.CaseID} —{" "}
              {selectedCase
                ? "Viva panel response status"
                : ""}
            </p>

          </div>

          <button
            onClick={close}
            className="rounded-xl p-2 hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        {/* SCHEDULE SUMMARY */}

        <div className="grid gap-4 border-b bg-gray-50 p-6 md:grid-cols-4">

          <SummaryBox
            label="Viva Date"
            value={displayDate(
              selectedCase?.ConfirmedVivaDate ||
                selectedCase?.TentativeVivaDate
            )}
            icon={CalendarDays}
          />

          <SummaryBox
            label="Time"
            value={
              selectedCase?.VivaTime ||
              "—"
            }
            icon={Clock3}
          />

          <SummaryBox
            label="Mode"
            value={
              selectedCase?.VivaMode ||
              "—"
            }
            icon={Users}
          />

          <SummaryBox
            label="Venue"
            value={
              selectedCase?.Venue ||
              "—"
            }
            icon={MapPin}
          />

        </div>

        {/* RESPONSE LIST */}

        <div className="p-6">

          {loading ? (
            <div className="py-16 text-center text-gray-500">

              <RefreshCw
                className="mx-auto mb-3 animate-spin"
                size={30}
              />

              Loading panel responses...

            </div>
          ) : panelResponses.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">

              <Users
                className="mx-auto mb-4 text-gray-300"
                size={45}
              />

              <h3 className="font-semibold text-gray-700">
                No panel responses found
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Panel invitations may not
                have been created yet.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {panelResponses.map(
                (panel, index) => {

                  const status =
                    responseLabel(panel);

                  return (
                    <div
                      key={
                        panel.PanelID ||
                        panel.PersonID ||
                        index
                      }
                      className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                            <Users
                              size={22}
                            />

                          </div>

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {getPanelName(
                                panel
                              )}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {panel.Role ||
                                "Panel Member"}
                              {panel.PanelID
                                ? ` · ${panel.PanelID}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <div className="flex items-center gap-2">

                            {responseIcon(
                              panel
                            )}

                            {responseBadge(
                              panel
                            )}

                          </div>

                          <button
                            onClick={() =>
                              onPreview(
                                panel
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Eye
                              size={16}
                            />
                            Preview
                          </button>

                        </div>

                      </div>

                      {status ===
                        "Suggested" && (
                        <div className="mt-4 rounded-xl bg-orange-50 p-4">

                          <div className="flex items-center gap-2 font-semibold text-orange-800">

                            <Clock3
                              size={17}
                            />

                            Suggested
                            Schedule

                          </div>

                          <div className="mt-2 grid gap-3 text-sm md:grid-cols-3">

                            <div>
                              <span className="text-orange-600">
                                Date
                              </span>

                              <div className="font-semibold">
                                {displayDate(
                                  panel.SuggestedDate
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-orange-600">
                                Time
                              </span>

                              <div className="font-semibold">
                                {panel.SuggestedTime ||
                                  "—"}
                              </div>
                            </div>

                            <div>
                              <span className="text-orange-600">
                                Remarks
                              </span>

                              <div className="font-semibold">
                                {panel.Remarks ||
                                  "—"}
                              </div>
                            </div>

                          </div>

                        </div>
                      )}

                      {panel.ResponseDate && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">

                          <CheckCircle2
                            size={14}
                          />

                          Responded{" "}
                          {formatDateTime(
                            panel.ResponseDate
                          )}

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

/* ======================================================
   RESPONSE PREVIEW
====================================================== */

function ResponsePreview({
  panel,
  selectedCase,
  responseLabel,
  formatDateTime,
  close,
}) {
  if (!panel) return null;

  const status =
    responseLabel(panel);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">

      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b p-6">

          <div>

            <div className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Admin Preview
            </div>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Panel Response
            </h2>

          </div>

          <button
            onClick={close}
            className="rounded-xl p-2 hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        {/* FORM PREVIEW */}

        <div className="p-6">

          <div className="mb-6 text-center">

            <div className="text-xl font-bold text-purple-700">
              Universiti Sains Malaysia
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Pusat Kanser Tun Abdullah
              Ahmad Badawi
            </div>

          </div>

          <div className="rounded-2xl border bg-gray-50 p-5">

            <h1 className="text-center text-xl font-bold text-gray-900">
              Viva Voce Schedule
              Confirmation
            </h1>

            <p className="mt-1 text-center text-sm text-gray-500">
              Panel Member Response
            </p>

          </div>

          {/* PANEL INFO */}

          <div className="mt-6">

            <h3 className="mb-3 font-semibold text-gray-900">
              Panel Information
            </h3>

            <div className="grid gap-3 md:grid-cols-2">

              <PreviewInfo
                label="Panel ID"
                value={
                  panel.PanelID
                }
              />

              <PreviewInfo
                label="Panel Name"
                value={
                  panel.PanelName ||
                  panel.PersonName ||
                  panel.StaffName ||
                  panel.ExaminerName ||
                  "—"
                }
              />

              <PreviewInfo
                label="Role"
                value={
                  panel.Role
                }
              />

              <PreviewInfo
                label="Person Type"
                value={
                  panel.PersonType
                }
              />

            </div>

          </div>

          {/* VIVA INFO */}

          <div className="mt-6">

            <h3 className="mb-3 font-semibold text-gray-900">
              Viva Voce Schedule
            </h3>

            <div className="grid gap-3 md:grid-cols-2">

              <PreviewInfo
                label="Viva ID"
                value={
                  panel.VivaID ||
                  selectedCase?.CaseID
                }
              />

              <PreviewInfo
                label="Proposed Date"
                value={displayDate(
                  panel.TentativeVivaDate ||
                    selectedCase?.TentativeVivaDate
                )}
              />

              <PreviewInfo
                label="Time"
                value={
                  panel.VivaTime ||
                  selectedCase?.VivaTime ||
                  "—"
                }
              />

              <PreviewInfo
                label="Venue"
                value={
                  panel.Venue ||
                  selectedCase?.Venue ||
                  "—"
                }
              />

            </div>

          </div>

          {/* RESPONSE */}

          <div className="mt-6">

            <h3 className="mb-3 font-semibold text-gray-900">
              Panel Response
            </h3>

            <div
              className={`rounded-2xl border p-5 ${
                status === "Accepted"
                  ? "border-emerald-200 bg-emerald-50"
                  : status === "Unable"
                  ? "border-red-200 bg-red-50"
                  : status === "Suggested"
                  ? "border-orange-200 bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >

              <div className="flex items-center gap-3">

                {status ===
                "Accepted" ? (
                  <CheckCircle2
                    className="text-emerald-600"
                    size={24}
                  />
                ) : status ===
                  "Unable" ? (
                  <XCircle
                    className="text-red-600"
                    size={24}
                  />
                ) : (
                  <Clock4
                    className="text-orange-500"
                    size={24}
                  />
                )}

                <div>

                  <div className="text-lg font-bold">
                    {status}
                  </div>

                  {panel.ResponseDate && (
                    <div className="text-sm text-gray-500">
                      Submitted{" "}
                      {formatDateTime(
                        panel.ResponseDate
                      )}
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* SUGGESTION */}

          {status ===
            "Suggested" && (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">

              <h3 className="font-semibold text-orange-900">
                Suggested Schedule
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <PreviewInfo
                  label="Suggested Date"
                  value={displayDate(
                    panel.SuggestedDate
                  )}
                />

                <PreviewInfo
                  label="Suggested Time"
                  value={
                    panel.SuggestedTime ||
                    "—"
                  }
                />

              </div>

            </div>
          )}

          {/* REMARKS */}

          {panel.Remarks && (
            <div className="mt-6">

              <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900">

                <MessageSquare
                  size={17}
                />

                Remarks

              </div>

              <div className="rounded-xl border bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                {panel.Remarks}
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="border-t bg-gray-50 p-5 text-center">

          <button
            onClick={close}
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Close Preview
          </button>

        </div>

      </div>

    </div>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function SummaryBox({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border bg-white p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
          <Icon size={18} />
        </div>

        <div>

          <div className="text-xs text-gray-400">
            {label}
          </div>

          <div className="font-semibold text-gray-800">
            {value}
          </div>

        </div>

      </div>

    </div>
  );
}

function PreviewInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <div className="text-xs text-gray-400">
        {label}
      </div>

      <div className="mt-1 font-semibold text-gray-800">
        {value || "—"}
      </div>

    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
      />

    </label>
  );
}

function PersonField({
  label,
  name,
  value,
  onChange,
  staff,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
      >

        <option value="">
          Select {label}
        </option>

        {staff.map((s) => (
          <option
            key={s.StaffID}
            value={s.StaffID}
          >
            {s.StaffName} —{" "}
            {s.Role}
          </option>
        ))}

      </select>

    </label>
  );
}

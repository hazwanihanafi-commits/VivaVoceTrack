import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Link as LinkIcon,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com/api";

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
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const requestedCaseID = searchParams.get("caseID");
  
  const [cases, setCases] = useState([]);
  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

 useEffect(() => {
  loadAll();
}, [requestedCaseID]);

  async function getJson(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed.");
    return data;
  }

  async function loadAll() {
  try {
    setLoading(true);
    setError("");

    const [scheduleData, studentData, examinerData] =
      await Promise.all([
        getJson(`${API}/schedule`),
        getJson(`${API}/students`),
        getJson(`${API}/examiners`),
      ]);

    const loadedSchedules = Array.isArray(scheduleData.data)
      ? scheduleData.data
      : [];

    setCases(loadedSchedules);

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

    // ============================================
    // OPEN SPECIFIC CASE FROM VIVA CASES
    // ============================================

    if (requestedCaseID) {
      try {

        const caseData = await getJson(
          `${API}/schedule/${requestedCaseID}`
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
    () => Object.fromEntries(students.map((s) => [s.StudentID, s])),
    [students]
  );

  const examinerMap = useMemo(
    () => Object.fromEntries(examiners.map((e) => [e.ExaminerID, e])),
    [examiners]
  );

  function studentName(item) {
    return studentMap[item.StudentID]?.StudentName || item.StudentID || "Unknown student";
  }

  function examinerName(value) {
    if (!value) return "—";
    return examinerMap[value]?.ExaminerName || value;
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

    VivaTime:
      item.VivaTime || "",

    Venue:
      item.Venue || "",

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
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveSchedule(event) {
  event.preventDefault();

  if (!form.caseID) {
    alert("Please select a Viva Case.");
    return;
  }

  if (!form.TentativeVivaDate && !form.ConfirmedVivaDate) {
    alert("Please select a Viva date.");
    return;
  }

  try {
    setSaving(true);

    const existing = cases.find(
      (item) => item.CaseID === form.caseID
    );

    const hasExistingSchedule =
      existing?.TentativeVivaDate ||
      existing?.ConfirmedVivaDate ||
      existing?.VivaTime ||
      existing?.Venue;

    const payload = {
      TentativeVivaDate: form.TentativeVivaDate || "",

      ConfirmedVivaDate:
        form.ConfirmedVivaDate ||
        form.TentativeVivaDate ||
        "",

      VivaTime: form.VivaTime || "",

      Venue: form.Venue || "",

      VivaMode: form.VivaMode || "Physical",

      MeetingLink: form.MeetingLink || "",

      ChairpersonID: form.Chairperson || "",
SecretaryID: form.Secretary || "",

      // IMPORTANT
      CurrentStatus: "Scheduled",
    };

    const method = hasExistingSchedule ? "PUT" : "POST";

    const response = await getJson(
      `${API}/schedule/${form.caseID}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("Schedule saved successfully:", response);

    setModalOpen(false);

    // Reload from Google Sheets
    await loadAll();

    alert("Viva schedule saved successfully.");

  } catch (err) {
    console.error("SAVE SCHEDULE ERROR:", err);

    alert(
      err.message ||
      "Unable to save Viva schedule."
    );

  } finally {
    setSaving(false);
  }
}
  
  async function action(caseID, type) {
    const labels = {
      confirm: "confirm this Viva schedule",
      postpone: "postpone this Viva",
      cancel: "cancel this Viva",
    };
    if (!window.confirm(`Are you sure you want to ${labels[type]}?`)) return;

    try {
      const item = cases.find((x) => x.CaseID === caseID);
      const payload =
        type === "confirm"
          ? {
              ConfirmedVivaDate: item?.ConfirmedVivaDate || item?.TentativeVivaDate,
              VivaTime: item?.VivaTime || "",
              Venue: item?.Venue || "",
              VivaMode: item?.VivaMode || "",
              MeetingLink: item?.MeetingLink || "",
            }
          : { Remarks: type === "postpone" ? "Viva postponed from Schedule page." : "Viva cancelled from Schedule page." };

      await getJson(`${API}/schedule/${caseID}/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(err.message || `Unable to ${type} Viva.`);
    }
  }

  const counts = useMemo(() => {
    const scheduled = cases.filter((x) => x.CurrentStatus === "Scheduled").length;
    const confirmed = cases.filter((x) => x.CurrentStatus === "Confirmed").length;
    const upcoming = cases.filter((x) => {
      const date = new Date(x.ConfirmedVivaDate || x.TentativeVivaDate);
      return ["Scheduled", "Confirmed"].includes(x.CurrentStatus) && !Number.isNaN(date.getTime()) && date >= new Date();
    }).length;
    return { scheduled, confirmed, upcoming };
  }, [cases]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases
      .filter((item) => {
        if (tab === "scheduled") return item.CurrentStatus === "Scheduled";
        if (tab === "confirmed") return item.CurrentStatus === "Confirmed";
        if (tab === "postponed") return item.CurrentStatus === "Postponed";
        if (tab === "cancelled") return item.CurrentStatus === "Cancelled";
        return ["Scheduled", "Confirmed", "Postponed", "Cancelled"].includes(item.CurrentStatus);
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
        const da = new Date(a.ConfirmedVivaDate || a.TentativeVivaDate || "2999-12-31");
        const db = new Date(b.ConfirmedVivaDate || b.TentativeVivaDate || "2999-12-31");
        return da - db;
      });
  }, [cases, search, tab, studentMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viva Schedule</h1>
          <p className="mt-1 text-gray-500">Plan, confirm and manage Viva Voce examination schedules.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw size={18} /> Refresh
          </button>
          <button onClick={() => openCreate()} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-purple-700">
            <Plus size={18} /> Schedule Viva
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={CalendarDays} label="Scheduled" value={counts.scheduled} />
        <StatCard icon={Check} label="Confirmed" value={counts.confirmed} />
        <StatCard icon={Clock3} label="Upcoming" value={counts.upcoming} />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${tab === key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-14 text-center text-gray-500">Loading Viva schedules...</div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <CalendarDays className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="font-medium text-gray-600">No Viva schedules found.</p>
              <p className="mt-1 text-sm text-gray-400">Create a schedule from an existing Viva case.</p>
            </div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-5 py-4">Student / Case</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Mode / Venue</th>
                  <th>Chairperson</th>
                  <th>Status</th>
                  <th className="px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const date = item.ConfirmedVivaDate || item.TentativeVivaDate;
                  return (
                    <tr key={item.CaseID} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{studentName(item)}</div>
                        <div className="text-xs text-gray-400">{item.CaseID}</div>
                      </td>
                      <td className="font-medium text-gray-700">{displayDate(date)}</td>
                      <td className="text-gray-600">{item.VivaTime || "—"}</td>
                      <td>
                        <div className="font-medium text-gray-700">{item.VivaMode || "—"}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          {item.VivaMode === "Online" && item.MeetingLink ? <LinkIcon size={13} /> : <MapPin size={13} />}
                          {item.VivaMode === "Online" && item.MeetingLink ? "Online meeting" : item.Venue || "—"}
                        </div>
                      </td>
                      <td className="text-gray-600">{examinerName(item.ChairpersonID || item.Chairperson)}</td>
                      <td>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.CurrentStatus)}`}>
                          {item.CurrentStatus || "Draft"}
                        </span>
                      </td>
                      <td className="px-5">
                        <div className="flex justify-center gap-2">
                          <button title="Edit schedule" onClick={() => openCreate(item)} className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100">
                            <Edit3 size={16} />
                          </button>
                          {item.CurrentStatus === "Scheduled" && (
                            <button title="Confirm" onClick={() => action(item.CaseID, "confirm")} className="rounded-lg border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50">
                              <Check size={16} />
                            </button>
                          )}
                          {!["Cancelled", "Postponed", "Completed"].includes(item.CurrentStatus) && (
                            <button title="Postpone" onClick={() => action(item.CaseID, "postpone")} className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50">
                              <Clock3 size={16} />
                            </button>
                          )}
                          {!["Cancelled", "Completed"].includes(item.CurrentStatus) && (
                            <button title="Cancel" onClick={() => action(item.CaseID, "cancel")} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">{form.caseID ? "Viva Schedule" : "Schedule Viva"}</h2>
                <p className="text-sm text-gray-500">Enter the examination date, time and venue details.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-gray-100"><X /></button>
            </div>

            <form onSubmit={saveSchedule} className="space-y-5 p-6">
              {!form.caseID ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Viva Case</span>
                  <select name="caseID" value={form.caseID} onChange={updateField} required className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500">
                    <option value="">Select a Viva case</option>
                    {cases.filter((x) => !["Completed", "Cancelled"].includes(x.CurrentStatus)).map((item) => (
                      <option key={item.CaseID} value={item.CaseID}>{item.CaseID} — {studentName(item)}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-xl bg-purple-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-purple-500">Viva Case</div>
                  <div className="mt-1 font-semibold text-purple-900">{form.caseID} — {studentName(cases.find((x) => x.CaseID === form.caseID) || {})}</div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tentative Viva Date" name="TentativeVivaDate" type="date" value={form.TentativeVivaDate} onChange={updateField} />
                <Field label="Confirmed Viva Date" name="ConfirmedVivaDate" type="date" value={form.ConfirmedVivaDate} onChange={updateField} />
                <Field label="Viva Time" name="VivaTime" type="time" value={form.VivaTime} onChange={updateField} />
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Viva Mode</span>
                  <select name="VivaMode" value={form.VivaMode} onChange={updateField} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500">
                    <option>Physical</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </label>
                <Field label="Venue" name="Venue" value={form.Venue} onChange={updateField} placeholder="e.g. DK 1, PPS" />
                <Field label="Meeting Link" name="MeetingLink" value={form.MeetingLink} onChange={updateField} placeholder="https://..." />
                <PersonField label="Chairperson" name="Chairperson" value={form.Chairperson} onChange={updateField} examiners={examiners} />
                <PersonField label="Secretary" name="Secretary" value={form.Secretary} onChange={updateField} examiners={examiners} />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border px-5 py-3 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={saving} type="submit" className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-purple-50 p-3 text-purple-600"><Icon size={22} /></div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500" />
    </label>
  );
}

function PersonField({ label, name, value, onChange, examiners }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <select name={name} value={value} onChange={onChange} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500">
        <option value="">Select examiner / staff</option>
        {examiners.map((e) => (
          <option key={e.ExaminerID} value={e.ExaminerID}>{e.ExaminerName} — {e.ExaminerType || "Examiner"}</option>
        ))}
      </select>
    </label>
  );
}

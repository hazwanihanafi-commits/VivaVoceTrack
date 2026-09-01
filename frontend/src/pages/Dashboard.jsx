import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

const cardConfig = [
  {
    key: "totalCases",
    title: "Total Viva Cases",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
  },
  {
    key: "scheduled",
    title: "Scheduled Viva",
    icon: CalendarDays,
    color: "bg-green-100 text-green-600",
  },
  {
    key: "confirmed",
    title: "Confirmed Viva",
    icon: CheckCircle2,
    color: "bg-purple-100 text-purple-600",
  },
  {
    key: "completed",
    title: "Completed Viva",
    icon: GraduationCap,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "pendingReports",
    title: "Pending Reports",
    icon: Clock3,
    color: "bg-yellow-100 text-yellow-600",
  },
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";

  // Google Sheets may already return a readable time such as 9:00 AM.
  if (/am|pm/i.test(value)) return value;

  const date = new Date(`1970-01-01T${value}`);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return value;
}

function statusClasses(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" || normalized === "reports complete") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "confirmed") {
    return "bg-purple-100 text-purple-700";
  }

  if (normalized === "scheduled") {
    return "bg-blue-100 text-blue-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "postponed" ||
    normalized === "overdue"
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    normalized === "waiting reports" ||
    normalized === "pending" ||
    normalized === "draft"
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-gray-100 text-gray-700";
}

function getStudentName(studentID, studentsById) {
  if (!studentID) return "Unknown student";
  return studentsById[studentID]?.StudentName || studentID;
}

function getSupervisor(studentID, studentsById) {
  return studentsById[studentID]?.Supervisor || "—";
}

function getProgramme(studentID, studentsById) {
  return studentsById[studentID]?.Programme || "—";
}

async function getJson(url) {
  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed: ${response.status}`);
  }

  return body;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [students, setStudents] = useState([]);
  const [reportStats, setReportStats] = useState({ submitted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const [summaryRes, upcomingRes, recentRes, studentsRes, reportsRes] =
        await Promise.all([
        getJson(`${API}/api/dashboard`)
getJson(`${API}/api/dashboard/upcoming`)
getJson(`${API}/api/dashboard/recent`)
getJson(`${API}/api/students`)
getJson(`${API}/api/dashboard/reports`)
        ]);

      setSummary(summaryRes.summary || {});
      setUpcoming(upcomingRes.data || []);
      setRecent(recentRes.data || []);
      setStudents(studentsRes.data || []);
      setReportStats({
        submitted: reportsRes.submitted || 0,
        pending: reportsRes.pending || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const studentsById = useMemo(
    () =>
      students.reduce((map, student) => {
        if (student.StudentID) map[student.StudentID] = student;
        return map;
      }, {}),
    [students]
  );

  const visibleUpcoming = upcoming.slice(0, 5);
  const visibleRecent = recent.slice(0, 10);
  const totalReports = reportStats.submitted + reportStats.pending;
  const reportPercentage =
    totalReports > 0
      ? Math.round((reportStats.submitted / totalReports) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Overview of your postgraduate viva examination workflow.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-400">
              Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          Refresh
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="mt-3 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-700">Dashboard Summary</h2>
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Loading data...
            </span>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {cardConfig.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-800">
                      {loading ? "—" : summary?.[card.key] ?? 0}
                    </p>
                  </div>
                  <div className={`rounded-2xl p-3.5 ${card.color}`}>
                    <Icon size={25} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alerts / report progress */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Report Progress</h2>
              <p className="mt-1 text-sm text-gray-500">
                Examiner report submission across all viva cases.
              </p>
            </div>
            <FileText className="text-gray-400" size={24} />
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${reportPercentage}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-800">{reportStats.submitted}</strong> submitted
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-800">{reportStats.pending}</strong> pending
            </span>
            <span className="text-gray-500">{reportPercentage}% received</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <Clock3 size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue Reports</p>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? "—" : summary?.overdueReports ?? 0}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            Reports past their due date and not yet marked as received.
          </p>
        </div>
      </section>

      {/* Upcoming Viva */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Upcoming Viva</h2>
              <p className="mt-1 text-sm text-gray-500">
                Confirmed viva sessions coming up next.
              </p>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {summary?.upcomingVivas ?? visibleUpcoming.length} upcoming
            </span>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : visibleUpcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
              No upcoming viva has been confirmed.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleUpcoming.map((item, index) => (
                <div
                  key={item.CaseID || `${item.StudentID}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800">
                      {getStudentName(item.StudentID, studentsById)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {getProgramme(item.StudentID, studentsById)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
                      {formatDate(item.ConfirmedVivaDate)}
                    </span>
                    <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
                      {formatTime(item.VivaTime)}
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {item.Venue || item.VivaMode || "Venue TBC"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">Viva Workflow</h2>
          <p className="mt-1 text-sm text-gray-500">Current case distribution.</p>

          <div className="mt-6 space-y-4">
            {[
              ["Scheduled", summary?.scheduled, "bg-blue-500"],
              ["Confirmed", summary?.confirmed, "bg-purple-500"],
              ["Completed", summary?.completed, "bg-green-500"],
              ["Postponed", summary?.postponed, "bg-yellow-500"],
              ["Cancelled", summary?.cancelled, "bg-red-500"],
            ].map(([label, value, dot]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {loading ? "—" : value ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Cases */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Viva Cases</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest cases based on confirmed viva date.
            </p>
          </div>
          <Users className="text-gray-400" size={23} />
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : visibleRecent.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
            No viva cases found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="py-3 pr-4 font-medium">Student</th>
                  <th className="pr-4 font-medium">Programme</th>
                  <th className="pr-4 font-medium">Supervisor</th>
                  <th className="pr-4 font-medium">Viva Date</th>
                  <th className="font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecent.map((item, index) => (
                  <tr
                    key={item.CaseID || `${item.StudentID}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 pr-4 font-medium text-gray-800">
                      {getStudentName(item.StudentID, studentsById)}
                    </td>
                    <td className="pr-4 text-sm text-gray-600">
                      {getProgramme(item.StudentID, studentsById)}
                    </td>
                    <td className="pr-4 text-sm text-gray-600">
                      {getSupervisor(item.StudentID, studentsById)}
                    </td>
                    <td className="pr-4 text-sm text-gray-600">
                      {formatDate(item.ConfirmedVivaDate)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          item.CurrentStatus
                        )}`}
                      >
                        {item.CurrentStatus || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function CaseStatusCard({ selectedCase }) {
  if (!selectedCase) return null;

  // =====================================================
  // EXAMINER REPORT STATUS
  // =====================================================

  const reports = [
    selectedCase.Internal1ReportReceived,
    selectedCase.Internal2ReportReceived,
    selectedCase.External1ReportReceived,
    selectedCase.External2ReportReceived,
  ];

  const isReceived = (value) => {
    return [
      "yes",
      "true",
      "submitted",
      "received",
    ].includes(
      String(value || "")
        .trim()
        .toLowerCase()
    );
  };

  const submitted = reports.filter(isReceived).length;

  const total = reports.filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  ).length;

  // =====================================================
  // IMPORTANT
  // Count assigned examiners only
  // =====================================================

  const assignedReports = [
    {
      id: selectedCase.InternalExaminer1ID,
      status: selectedCase.Internal1ReportReceived,
    },
    {
      id: selectedCase.InternalExaminer2ID,
      status: selectedCase.Internal2ReportReceived,
    },
    {
      id: selectedCase.ExternalExaminer1ID,
      status: selectedCase.External1ReportReceived,
    },
    {
      id: selectedCase.ExternalExaminer2ID,
      status: selectedCase.External2ReportReceived,
    },
  ].filter(
    (examiner) =>
      examiner.id &&
      String(examiner.id).trim() !== ""
  );

  const totalAssigned =
    assignedReports.length;

  const submittedAssigned =
    assignedReports.filter(
      (examiner) =>
        isReceived(examiner.status)
    ).length;

  const percentage =
    totalAssigned > 0
      ? (submittedAssigned / totalAssigned) * 100
      : 0;

  // =====================================================
  // DUE DATE
  // =====================================================

  const due = selectedCase.ReportDueDate
    ? new Date(selectedCase.ReportDueDate)
    : null;

  const today = new Date();

  let daysLeft = null;

  if (due && !isNaN(due.getTime())) {
    daysLeft = Math.ceil(
      (due - today) /
        (1000 * 60 * 60 * 24)
    );
  }

  // =====================================================
  // INVITATION STATUS
  // =====================================================

  const invitationSent =
    String(
      selectedCase.AppointmentEmailSent || ""
    )
      .trim()
      .toLowerCase() === "yes";

  // =====================================================
  // CASE STATUS
  // =====================================================

  return (
    <div className="rounded-2xl border bg-white p-6 shadow">

      <h3 className="mb-5 text-lg font-bold">
        Case Status
      </h3>

      {/* =================================================
          REPORT PROGRESS
          ================================================= */}

      <div className="mb-5">

        <p className="text-sm text-gray-500">
          Progress
        </p>

        <p
          className={`font-semibold ${
            submittedAssigned === totalAssigned &&
            totalAssigned > 0
              ? "text-green-600"
              : "text-yellow-600"
          }`}
        >
          {submittedAssigned}/{totalAssigned} Reports Submitted
        </p>

      </div>

      {/* =================================================
          PROGRESS BAR
          ================================================= */}

      <div className="mb-6">

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-purple-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* =================================================
          INVITATION
          ================================================= */}

      <div className="space-y-3">

        <div className="flex justify-between">

          <span>
            Invitation
          </span>

          <span
            className={`font-medium ${
              invitationSent
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {invitationSent
              ? "Sent"
              : "Not Sent"}
          </span>

        </div>

        {/* =================================================
            DUE DATE
            ================================================= */}

        <div className="flex justify-between">

          <span>
            Due Date
          </span>

          <span>
            {selectedCase.ReportDueDate ||
              "Not specified"}
          </span>

        </div>

        {/* =================================================
            REMAINING
            ================================================= */}

        <div className="flex justify-between">

          <span>
            Remaining
          </span>

          <span
            className={
              daysLeft !== null &&
              daysLeft < 0
                ? "font-semibold text-red-600"
                : "font-semibold text-blue-600"
            }
          >
            {daysLeft === null
              ? "-"
              : daysLeft < 0
              ? `${Math.abs(daysLeft)} Days Overdue`
              : `${daysLeft} Days`}
          </span>

        </div>

      </div>

    </div>
  );
}

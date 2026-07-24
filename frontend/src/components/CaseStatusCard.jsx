export default function CaseStatusCard({ selectedCase }) {
  if (!selectedCase) return null;

  const reports = [
    selectedCase.Internal1Report,
    selectedCase.Internal2Report,
    selectedCase.External1Report,
    selectedCase.External2Report,
  ];

  const submitted = reports.filter(
    (x) => x === "Submitted"
  ).length;

  const percentage = (submitted / 4) * 100;

  const due = new Date(selectedCase.ReportDueDate);
  const today = new Date();

  const daysLeft = Math.ceil(
    (due - today) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-2xl border bg-white p-6 shadow">

      <h3 className="mb-5 text-lg font-bold">
        Case Status
      </h3>

      <div className="mb-5">

        <p className="text-sm text-gray-500">
          Progress
        </p>

        <p className="font-semibold text-yellow-600">
          {submitted}/4 Reports Submitted
        </p>

      </div>

      <div className="mb-5">

        <div className="h-3 rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-purple-600"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Invitation</span>
          <span className="font-medium text-green-600">
            Sent
          </span>
        </div>

        <div className="flex justify-between">
          <span>Due Date</span>
          <span>{selectedCase.ReportDueDate}</span>
        </div>

        <div className="flex justify-between">
          <span>Remaining</span>

          <span
            className={
              daysLeft < 0
                ? "font-semibold text-red-600"
                : "font-semibold text-blue-600"
            }
          >
            {daysLeft < 0
              ? `${Math.abs(daysLeft)} Days Overdue`
              : `${daysLeft} Days`}
          </span>

        </div>

      </div>

    </div>
  );
}

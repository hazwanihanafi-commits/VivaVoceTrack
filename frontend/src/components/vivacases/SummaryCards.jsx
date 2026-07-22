function Card({ title, value, color }) {
  const colors = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div
        className={`inline-flex rounded-xl px-4 py-2 font-semibold ${colors[color]}`}
      >
        {title}
      </div>

      <h2 className="mt-5 text-4xl font-bold">
        {value}
      </h2>
    </div>
  );
}

export default function SummaryCards({ cases }) {
  return (
    <>
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Viva Cases
          </h1>

          <p className="text-gray-500">
            Manage thesis examination workflow
          </p>

        </div>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

        <Card
          title="Total Cases"
          value={cases.length}
          color="purple"
        />

        <Card
          title="Waiting Reports"
          value={
            cases.filter(
              (c) => c.CurrentStatus === "Waiting Reports"
            ).length
          }
          color="amber"
        />

        <Card
          title="Reports Complete"
          value={
            cases.filter(
              (c) => c.CurrentStatus === "Reports Complete"
            ).length
          }
          color="green"
        />

        <Card
          title="Scheduled Viva"
          value={
            cases.filter(
              (c) => c.CurrentStatus === "Scheduled"
            ).length
          }
          color="blue"
        />

      </div>
    </>
  );
}

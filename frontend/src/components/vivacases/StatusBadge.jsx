export default function StatusBadge({ status }) {
  const styles = {
    Draft: "bg-gray-100 text-gray-700",
    "Waiting Reports": "bg-yellow-100 text-yellow-700",
    "Reports Complete": "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "-"}
    </span>
  );
}

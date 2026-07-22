export default function Topbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-semibold">
        VivaTrack
      </h2>

      <div className="text-right">
        <div className="font-medium">
          Administrator
        </div>

        <div className="text-sm text-gray-500">
          Universiti Sains Malaysia
        </div>
      </div>
    </header>
  );
}

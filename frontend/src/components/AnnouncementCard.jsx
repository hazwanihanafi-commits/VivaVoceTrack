import { Megaphone } from "lucide-react";

const announcements = [
  {
    title: "Faculty Meeting",
    date: "25 Jul 2026",
  },
  {
    title: "Examiner Submission Deadline",
    date: "31 Jul 2026",
  },
  {
    title: "Senate Meeting",
    date: "5 Aug 2026",
  },
];

export default function AnnouncementCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">

        <Megaphone className="text-[#53257F]" />

        <h2 className="text-xl font-bold">
          Announcements
        </h2>

      </div>

      <div className="space-y-4">

        {announcements.map((item) => (

          <div
            key={item.title}
            className="border rounded-xl p-4 hover:bg-slate-50"
          >

            <h3 className="font-semibold">
              {item.title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {item.date}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

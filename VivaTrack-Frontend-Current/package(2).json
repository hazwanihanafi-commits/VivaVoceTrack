import {
  Bell,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Settings,
  BarChart3,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Notice of Submission",
      value: "120",
      subtitle: "12 Pending",
      icon: <FileText size={28} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Viva Scheduled",
      value: "35",
      subtitle: "This Month",
      icon: <Calendar size={28} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Reports Submitted",
      value: "18",
      subtitle: "Awaiting Decision",
      icon: <ClipboardCheck size={28} />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Corrections",
      value: "27",
      subtitle: "In Progress",
      icon: <AlertCircle size={28} />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Final Submission",
      value: "42",
      subtitle: "Completed",
      icon: <CheckCircle2 size={28} />,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      active: true,
    },
    {
      name: "Submissions",
      icon: <FileText size={20} />,
    },
    {
      name: "Viva Schedule",
      icon: <Calendar size={20} />,
    },
    {
      name: "Examiners",
      icon: <Users size={20} />,
    },
    {
      name: "Viva Reports",
      icon: <ClipboardCheck size={20} />,
    },
    {
      name: "Students",
      icon: <GraduationCap size={20} />,
    },
    {
      name: "Analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
    },
  ];

  const submissions = [
    {
      student: "Aisyah Maisarah",
      title: "AI-Based Predictive Model",
      status: "In Progress",
      stage: "Supervisor Verification",
    },
    {
      student: "Muhammad Khairi",
      title: "Blockchain Academic Verification",
      status: "Pending",
      stage: "School Approval",
    },
    {
      student: "Sarah Lee",
      title: "Sustainable Waste Management",
      status: "Under Review",
      stage: "Examiner Review",
    },
    {
      student: "Zulkarnain Wahid",
      title: "Smart Grid Forecasting",
      status: "Scheduled",
      stage: "Viva Scheduled",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        
        <div className="p-8 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-purple-700">
            VivaTrack
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Viva Tracking System
          </p>
        </div>

        <div className="flex-1 p-5 space-y-2">
          {menu.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition ${
                item.active
                  ? "bg-purple-600 text-white shadow-lg"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {item.icon}
              <span className="font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="bg-slate-100 rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              Your Role
            </p>

            <h3 className="font-bold mt-2 text-slate-800">
              Postgraduate Admin
            </h3>

            <p className="text-sm text-purple-600 mt-1">
              Universiti Sains Malaysia
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard Overview
            </h1>

            <p className="text-slate-500 mt-1">
              Welcome back! Here's what's happening with viva sessions.
            </p>
          </div>

          <div className="flex items-center gap-6">
            
            <button className="relative">
              <Bell className="text-slate-600" />

              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="flex items-center gap-4">
              
              <div className="w-12 h-12 rounded-full bg-slate-300"></div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Prof. Dr. Ahmad
                </h3>

                <p className="text-sm text-slate-500">
                  Postgraduate Office
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
            {stats.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  
                  <div>
                    <h3 className="text-4xl font-bold text-slate-800">
                      {item.value}
                    </h3>

                    <p className="font-semibold mt-2 text-slate-700">
                      {item.title}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow + Upcoming */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            
            {/* Workflow */}
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              
              <h2 className="text-2xl font-bold text-slate-800 mb-8">
                Viva Workflow Tracker
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                
                {[
                  "Submission",
                  "Supervisor",
                  "School",
                  "Examiner",
                  "Scheduled",
                  "Completed",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                      {index + 1}
                    </div>

                    <p className="text-sm font-medium mt-4 text-center text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              
              <div className="flex items-center justify-between mb-6">
                
                <h2 className="text-2xl font-bold text-slate-800">
                  Upcoming Viva
                </h2>

                <Clock3 className="text-slate-500" />
              </div>

              <div className="space-y-5">
                
                {[
                  {
                    name: "Aisyah Maisarah",
                    date: "22 May",
                    status: "Confirmed",
                  },
                  {
                    name: "Muhammad Khairi",
                    date: "23 May",
                    status: "Confirmed",
                  },
                  {
                    name: "Sarah Lee",
                    date: "24 May",
                    status: "Pending",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {item.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {item.date}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.status === "Confirmed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            
            <div className="flex items-center justify-between mb-8">
              
              <h2 className="text-2xl font-bold text-slate-800">
                Recent Submissions
              </h2>

              <button className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-medium">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              
              <table className="w-full">
                
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-4 text-slate-500">Student</th>
                    <th className="pb-4 text-slate-500">Thesis Title</th>
                    <th className="pb-4 text-slate-500">Status</th>
                    <th className="pb-4 text-slate-500">Current Stage</th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100"
                    >
                      <td className="py-5 font-medium text-slate-800">
                        {item.student}
                      </td>

                      <td className="text-slate-600">
                        {item.title}
                      </td>

                      <td>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                          {item.status}
                        </span>
                      </td>

                      <td className="text-slate-600">
                        {item.stage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

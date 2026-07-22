import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Send,
  Save,
  Upload,
  Calendar,
  Link,
} from "lucide-react";
const API = "http://localhost:5000/api";

export default function VivaCases() {
  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [cases, setCases] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    studentId: "",
    internalExaminer: "",
    externalExaminer: "",
    driveLink: "",
    thesisPDF: "",
    receivedDate: "",
    dueDate: "",
    emailSubject: "",
    emailBody: "",
    reminder: true,
  });

  useEffect(() => {
    loadStudents();
    loadExaminers();
    loadCases();
  }, []);

  async function loadStudents() {
    try {
      const res = await fetch(`${API}/students`);
      const data = await res.json();
      setStudents(data.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadExaminers() {
    try {
      const res = await fetch(`${API}/examiners`);
      const data = await res.json();
      setExaminers(data.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadCases() {
    try {
      const res = await fetch(`${API}/vivacases`);
      const data = await res.json();
      setCases(data.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  function handleStudent(id) {
    const student = students.find((s) => s.StudentID === id);

    setSelectedStudent(student);

    setForm({
      ...form,
      studentId: id,
      emailSubject: `Invitation to Examine Thesis - ${student?.StudentName || ""}`,
      emailBody: `Dear Examiner,

You have been appointed as an examiner for the thesis entitled:

"${student?.ThesisTitle || ""}"

Please submit your examination report before the due date.

Thank you.

PKTAAB
Universiti Sains Malaysia`,
    });
  }

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  }

  async function saveDraft() {
  try {
    const res = await fetch(`${API}/vivacases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        StudentID: form.studentId,
        InternalExaminerID: form.internalExaminer,
        ExternalExaminerID: form.externalExaminer,
        GoogleDriveLink: form.driveLink,
        DateReceivedFromIPS: form.receivedDate,
        ReportDueDate: form.dueDate,
        EmailSubject: form.emailSubject,
        EmailBody: form.emailBody,
        ReminderEnabled: form.reminder,
        CurrentStatus: "Draft",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to save draft");
      return;
    }

    alert("Draft saved successfully.");

    loadCases();

  } catch (err) {
    console.error(err);
    alert("Server connection failed.");
  }
}
  async function sendToExaminer() {

  await saveDraft();

  alert("Email sending module will be connected next.");

}

  function getStudentName(studentId) {
  const student = students.find((s) => s.StudentID === studentId);
  return student ? student.StudentName : "-";
}

function getExaminerName(examinerId) {
  const examiner = examiners.find(
    (e) => e.ExaminerID === examinerId
  );
  return examiner ? examiner.ExaminerName : "-";
}

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Viva Cases
          </h1>

          <p className="text-gray-500">
            Manage thesis examination workflow
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700">

          <Plus size={18} />

          New Case

        </button>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-4 gap-5">

        <Card
          title="Total Cases"
          value={cases.length}
          color="purple"
        />

        <Card
          title="Waiting Reports"
          value={
            cases.filter(
              (x) => x.CurrentStatus === "Waiting Reports"
            ).length
          }
          color="amber"
        />

        <Card
          title="Reports Complete"
          value={
            cases.filter(
              (x) => x.CurrentStatus === "Reports Complete"
            ).length
          }
          color="green"
        />

        <Card
          title="Scheduled Viva"
          value={
            cases.filter(
              (x) => x.CurrentStatus === "Scheduled"
            ).length
          }
          color="blue"
        />

      </div>

      {/* Form */}

      <div className="rounded-2xl bg-white p-8 shadow">

        <h2 className="mb-6 text-xl font-bold">
          Create New Viva Case
        </h2>

        <div className="grid grid-cols-2 gap-6">

          {/* Student */}

          <div>

            <label className="mb-2 block font-medium">

              Student

            </label>

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <select
                className="w-full rounded-xl border pl-10 p-3"
                value={form.studentId}
                onChange={(e) =>
                  handleStudent(e.target.value)
                }
              >
                <option>Select Student</option>

                {students.map((s) => (
                  <option
                    key={s.StudentID}
                    value={s.StudentID}
                  >
                    {s.StudentName}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* Programme */}

          <div>

            <label className="mb-2 block font-medium">
              Programme
            </label>

            <input
              readOnly
              value={selectedStudent?.Programme || ""}
              className="w-full rounded-xl border bg-gray-50 p-3"
            />

          </div>

          {/* Supervisor */}

          <div>

            <label className="mb-2 block font-medium">
              Supervisor
            </label>

            <input
              readOnly
              value={selectedStudent?.Supervisor || ""}
              className="w-full rounded-xl border bg-gray-50 p-3"
            />

          </div>

          {/* Thesis */}

          <div>

            <label className="mb-2 block font-medium">
              Thesis Title
            </label>

            <input
              readOnly
              value={selectedStudent?.ThesisTitle || ""}
              className="w-full rounded-xl border bg-gray-50 p-3"
            />

          </div>

          {/* Internal */}

          <div>

            <label className="mb-2 block font-medium">
              Internal Examiner
            </label>

            <select
              name="internalExaminer"
              value={form.internalExaminer}
              onChange={updateField}
              className="w-full rounded-xl border p-3"
            >
              <option>Select Examiner</option>

              {examiners.map((e) => (
                <option
                  key={e.ExaminerID}
                  value={e.ExaminerID}
                >
                  {e.ExaminerName}
                </option>
              ))}

            </select>

          </div>

          {/* External */}

          <div>

            <label className="mb-2 block font-medium">
              External Examiner
            </label>

            <select
              name="externalExaminer"
              value={form.externalExaminer}
              onChange={updateField}
              className="w-full rounded-xl border p-3"
            >
              <option>Select Examiner</option>

              {examiners.map((e) => (
                <option
                  key={e.ExaminerID}
                  value={e.ExaminerID}
                >
                  {e.ExaminerName}
                </option>
              ))}

            </select>

          </div>

                    {/* Google Drive */}

          <div>

            <label className="mb-2 block font-medium">
              Google Drive Link
            </label>

            <div className="relative">

              <Link
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                name="driveLink"
                value={form.driveLink}
                onChange={updateField}
                placeholder="Paste Google Drive link"
                className="w-full rounded-xl border pl-10 p-3"
              />

            </div>

          </div>

          {/* PDF */}

          <div>

            <label className="mb-2 block font-medium">
              Thesis PDF
            </label>

            <div className="relative">

              <Upload
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="file"
                className="w-full rounded-xl border pl-10 p-2"
              />

            </div>

          </div>

          {/* Received */}

          <div>

            <label className="mb-2 block font-medium">
              Date Received from IPS
            </label>

            <div className="relative">

              <Calendar
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="date"
                name="receivedDate"
                value={form.receivedDate}
                onChange={updateField}
                className="w-full rounded-xl border pl-10 p-3"
              />

            </div>

          </div>

          {/* Due */}

          <div>

            <label className="mb-2 block font-medium">
              Report Due Date
            </label>

            <div className="relative">

              <Calendar
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={updateField}
                className="w-full rounded-xl border pl-10 p-3"
              />

            </div>

          </div>

        </div>

        {/* Email */}

        <div className="mt-8">

          <label className="mb-2 block font-medium">
            Email Subject
          </label>

          <input
            type="text"
            name="emailSubject"
            value={form.emailSubject}
            onChange={updateField}
            className="mb-5 w-full rounded-xl border p-3"
          />

          <label className="mb-2 block font-medium">
            Email Body
          </label>

          <textarea
            rows={8}
            name="emailBody"
            value={form.emailBody}
            onChange={updateField}
            className="w-full rounded-xl border p-4"
          />

        </div>

        {/* Reminder */}

        <div className="mt-6 flex items-center gap-3">

          <input
            type="checkbox"
            checked={form.reminder}
            name="reminder"
            onChange={updateField}
          />

          <span>
            Enable automatic reminder emails
          </span>

        </div>

        {/* Buttons */}

        <div className="mt-8 flex gap-4">

          <button
            onClick={saveDraft}
            className="flex items-center gap-2 rounded-xl bg-gray-700 px-6 py-3 text-white hover:bg-gray-800"
          >

            <Save size={18} />

            Save Draft

          </button>

          <button
            onClick={sendToExaminer}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
          >

            <Send size={18} />

            Send to Examiners

          </button>

        </div>

      </div>

      {/* Existing Cases */}

      <div className="rounded-2xl bg-white p-8 shadow">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-bold">
            Existing Viva Cases
          </h2>

          <input
            placeholder="Search case..."
            className="rounded-xl border p-3 w-72"
          />

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b bg-gray-50">

              <th className="p-3 text-left">Case ID</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Internal</th>
              <th className="p-3 text-left">External</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>

            </tr>

          </thead>

          <tbody>

            {cases.map((item) => (

              <tr
                key={item.CaseID}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 font-semibold">
                  {item.CaseID}
                </td>

                <td className="p-3">
                  {getStudentName(item.StudentID)}
                </td>

                <td className="p-3">
                  {getExaminerName(item.InternalExaminerID)}
                </td>

                <td className="p-3">
                  {getExaminerName(item.ExternalExaminerID)}
                </td>

                <td className="p-3">
                  {item.ReportDueDate}
                </td>

                <td className="p-3">

                  <StatusBadge
                    status={item.CurrentStatus}
                  />

                </td>

                <td className="p-3">

                  <button className="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200">

                    View

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

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

function StatusBadge({ status }) {

  const styles = {
    Draft: "bg-gray-100 text-gray-700",
    "Waiting Reports": "bg-yellow-100 text-yellow-700",
    "Reports Complete": "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

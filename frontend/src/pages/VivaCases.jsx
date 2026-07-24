import { useEffect, useState } from "react";

import SummaryCards from "../components/vivacases/SummaryCards";
import VivaCaseForm from "../components/vivacases/VivaCaseForm";
import VivaCaseTable from "../components/vivacases/VivaCaseTable";

const API = "https://vivatrack-backend.onrender.com/api";

export default function VivaCases() {
  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [form, setForm] = useState({
  studentId: "",
  internalExaminers: [""],
  externalExaminers: [""],
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
      console.error(err);
    }
  }

  async function loadExaminers() {
    try {
      const res = await fetch(`${API}/examiners`);
      const data = await res.json();
      setExaminers(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCases() {
    try {
      const res = await fetch(`${API}/vivacases`);
      const data = await res.json();
      setCases(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleStudent(id) {
    const student = students.find((s) => s.StudentID === id);

    setSelectedStudent(student);

    setForm((prev) => ({
      ...prev,
      studentId: id,
      emailSubject: `Invitation to Examine Thesis - ${student?.StudentName || ""}`,
      emailBody: `Dear Examiner,

You have been appointed as an examiner for the thesis entitled:

"${student?.ThesisTitle || ""}"

Please submit your examination report before the due date.

Thank you.

PKTAAB
Universiti Sains Malaysia`,
    }));
  }

  function updateField(e) {
  const { name, value, type, checked, index } = e.target;

  setForm((prev) => {
    if (name === "addInternal") {
      return {
        ...prev,
        internalExaminers: [...prev.internalExaminers, ""],
      };
    }

    if (name === "removeInternal") {
      return {
        ...prev,
        internalExaminers: prev.internalExaminers.filter(
          (_, i) => i !== index
        ),
      };
    }

    if (name === "addExternal") {
      return {
        ...prev,
        externalExaminers: [...prev.externalExaminers, ""],
      };
    }

    if (name === "removeExternal") {
      return {
        ...prev,
        externalExaminers: prev.externalExaminers.filter(
          (_, i) => i !== index
        ),
      };
    }

    if (name === "internalExaminer") {
      const list = [...prev.internalExaminers];
      list[index] = value;

      return {
        ...prev,
        internalExaminers: list,
      };
    }

    if (name === "externalExaminer") {
      const list = [...prev.externalExaminers];
      list[index] = value;

      return {
        ...prev,
        externalExaminers: list,
      };
    }

    return {
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    };
  });
}

  function handleManage(item) {
  setSelectedCase(item);

  const student = students.find(
    (s) => s.StudentID === item.StudentID
  );

  setSelectedStudent(student);

  setForm({
    studentId: item.StudentID,

    internalExaminers: [
      item.InternalExaminer1ID || "",
      item.InternalExaminer2ID || "",
    ].filter(Boolean),

    externalExaminers: [
      item.ExternalExaminer1ID || "",
      item.ExternalExaminer2ID || "",
    ].filter(Boolean),

    driveLink: item.GoogleDriveLink || "",
    thesisPDF: item.ThesisPDF || "",
    receivedDate: item.DateReceivedFromIPS || "",
    dueDate: item.ReportDueDate || "",
    emailSubject: item.EmailSubject || "",
    emailBody: item.EmailBody || "",
    reminder: item.ReminderEnabled ?? true,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
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
          InternalExaminer1ID: form.internalExaminers[0] || "",
          InternalExaminer2ID: form.internalExaminers[1] || "",
          ExternalExaminer1ID: form.externalExaminers[0] || "",
          ExternalExaminer2ID: form.externalExaminers[1] || "",
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
      alert("Unable to connect to server.");
    }
  }

  async function sendToExaminer() {
    await saveDraft();
    alert("Email module will be connected next.");
  }

  return (
    <div className="space-y-8">

      <SummaryCards cases={cases} />

    <VivaCaseForm
  selectedCase={selectedCase}
  students={students}
  examiners={examiners}
  selectedStudent={selectedStudent}
  form={form}
  handleStudent={handleStudent}
  updateField={updateField}
  saveDraft={saveDraft}
  sendToExaminer={sendToExaminer}
/>

      <VivaCaseTable
  cases={cases}
  students={students}
  examiners={examiners}
  onManage={handleManage}
/>

    </div>
  );
}

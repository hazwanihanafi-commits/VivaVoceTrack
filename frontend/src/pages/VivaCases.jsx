import { useEffect, useState } from "react";

import SummaryCards from "../components/vivacases/SummaryCards";
import VivaCaseForm from "../components/vivacases/VivaCaseForm";
import VivaCaseTable from "../components/vivacases/VivaCaseTable";
import CaseStatusCard from "../components/vivacases/CaseStatusCard";

const API = "https://vivatrack-backend.onrender.com/api";

export default function VivaCases() {
  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
const [previewHtml, setPreviewHtml] = useState("");
const [previewSubject, setPreviewSubject] = useState("");
const [previewType, setPreviewType] = useState("thesis");
  

  const [form, setForm] = useState({
  studentId: "",
  internalExaminers: [""],
  externalExaminers: [""],
  driveLink: "",
  receivedDate: "",
  dueDate: "",
  emailSubject: "",
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
      emailSubject: `Submission of Thesis for Examination – ${student?.StudentName || ""} (${student?.MatricNo || ""}), ${student?.Programme || ""}, PKTAAB, Universiti Sains Malaysia`,
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
    receivedDate: item.DateReceivedFromIPS || "",
    dueDate: item.ReportDueDate || "",
    emailSubject: item.EmailSubject || "",
    reminder: item.ReminderEnabled ?? true,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

  async function previewEmailHandler(type = "thesis") {

  if (!selectedCase) {
  alert(
    "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
  );
  return;
}
    
  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/preview/${type}`
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Unable to preview email.");
      return;
    }

    setPreviewType(type);
    setPreviewSubject(data.subject);
    setPreviewHtml(data.html);
    setPreviewOpen(true);

  } catch (err) {

    console.error(err);
    alert("Unable to load email preview.");

  }

}
  async function deleteCase(caseID) {
  const ok = window.confirm(
    "Are you sure you want to delete this viva case?"
  );

  if (!ok) return;

  try {
    const res = await fetch(`${API}/vivacases/${caseID}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Unable to delete case.");
      return;
    }

    alert("Viva case deleted successfully.");

    loadCases();

    setSelectedCase(null);
    setSelectedStudent(null);

  } catch (err) {
    console.error(err);
    alert("Server connection failed.");
  }
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
        ReportDueDate: form.dueDate,

VivaDate: form.vivaDate,
VivaTime: form.vivaTime,
VivaVenue: form.vivaVenue,
VivaMode: form.vivaMode,
MeetingLink: form.meetingLink,

EmailSubject: form.emailSubject,
        EmailSubject: form.emailSubject,
        ReminderEnabled: form.reminder,
        CurrentStatus: "Draft",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to save draft");
      return;
    }

    alert(
      "Draft saved successfully.\n\nA Viva Case Number has been generated. Please select the case from the Viva Case List below to preview or send emails."
    );

    loadCases();

  } catch (err) {
    console.error(err);
    alert("Unable to connect to server.");
  }
}

  async function sendAppointment() {

  if (!selectedCase) {
    alert(
  "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
  );
    return;
}
    
  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/send-appointment`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    loadCases();

  } catch (err) {

    console.error(err);
    alert("Unable to send appointment email.");

  }

}

async function sendThesis() {

  if (!selectedCase) {
  alert(
    "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
  );
  return;
}
  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/send-thesis`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    loadCases();

  } catch (err) {

    console.error(err);
    alert("Unable to send thesis email.");

  }

}

async function sendReminder() {

  if (!selectedCase) {
  alert(
    "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
  );
  return;
}

  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/send-reminder`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    loadCases();

  } catch (err) {

    console.error(err);
    alert("Unable to send reminder email.");

  }

}

async function sendSchedule() {

  if (!selectedCase) {
  alert(
    "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
  );
  return;
}

  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/send-schedule`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    loadCases();

  } catch (err) {

    console.error(err);
    alert("Unable to send schedule email.");

  }

}

async function sendThankYou() {

 if (!selectedCase) {
  alert(
    "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
  );
  return;
}

  try {

    const res = await fetch(
      `${API}/emails/${selectedCase.CaseID}/send-thankyou`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    loadCases();

  } catch (err) {

    console.error(err);
    alert("Unable to send thank-you email.");

  }

}

  

  return (
    <div className="space-y-8">

    <SummaryCards cases={cases} />

<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

  <div className="lg:col-span-2">
    <VivaCaseForm
      selectedCase={selectedCase}
      students={students}
      examiners={examiners}
      selectedStudent={selectedStudent}
      form={form}
      handleStudent={handleStudent}
      updateField={updateField}
     saveDraft={saveDraft}
sendAppointment={sendAppointment}
sendThesis={sendThesis}
sendReminder={sendReminder}
sendSchedule={sendSchedule}
sendThankYou={sendThankYou}
previewEmailHandler={previewEmailHandler}
/>
  </div>

  <CaseStatusCard
    selectedCase={selectedCase}
  />

</div>

<VivaCaseTable
  cases={cases}
  students={students}
  examiners={examiners}
  onManage={handleManage}
  onDelete={deleteCase}
/>

      {previewOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">

      <h2 className="mb-4 text-xl font-bold">
        Email Preview
      </h2>

      <div className="mb-4 rounded border bg-gray-50 p-4">
        <div className="mb-4">
  <p className="font-semibold">Subject</p>

<div className="mb-4 rounded border bg-gray-100 p-3">
  {previewSubject}
</div>

  <p className="font-semibold">Body</p>
  <div className="rounded border bg-gray-50 p-4">
    <div
  className="prose max-w-none"
  dangerouslySetInnerHTML={{
    __html: previewHtml,
  }}
/>
  </div>
</div>
      </div>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setPreviewOpen(false)}
          className="rounded bg-gray-500 px-4 py-2 text-white"
        >
          Close
        </button>

       <button
  onClick={async () => {

    setPreviewOpen(false);

    switch (previewType) {

      case "appointment":
        await sendAppointment();
        break;

      case "thesis":
        await sendThesis();
        break;

      case "reminder":
        await sendReminder();
        break;

      case "schedule":
        await sendSchedule();
        break;

      case "thankyou":
        await sendThankYou();
        break;

      default:
        break;

    }

  }}
  className="rounded bg-purple-600 px-4 py-2 text-white"
>
  Send Email
</button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}

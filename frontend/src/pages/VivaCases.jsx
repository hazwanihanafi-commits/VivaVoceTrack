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
const [previewEmail, setPreviewEmail] = useState("");
  

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
      emailSubject: `Submission of Thesis for Examination – ${student?.StudentName || ""} (${student?.MatricNo || ""}), ${student?.Programme || ""}, PKTAAB, Universiti Sains Malaysia`,

emailBody: `Assalamualaikum W.B.T. dan Salam Sejahtera Y.Brs. {{ExaminerTitle}} {{ExaminerName}},

Thank you for accepting our invitation to serve as an {{ExaminerType}} Examiner for the thesis examination of the following postgraduate candidate.

Student Name : ${student?.StudentName || ""}
Matric No.   : ${student?.MatricNo || ""}
Programme    : ${student?.Programme || ""}
School/Centre: Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)
University   : Universiti Sains Malaysia

Thesis Title:
${student?.ThesisTitle || ""}

The candidate has now submitted the thesis for examination. The thesis and supporting documents are available for your review through the link below:

📂 Thesis & Supporting Documents
{{DriveLink}}

Password to open the thesis PDF:
${student?.IC_Passport || ""}

(The password is the student's identification/passport number.)

We would appreciate your attention to the following:

1. The official Thesis Examiner's Report Form may be downloaded from the Institute of Postgraduate Studies (IPS), Universiti Sains Malaysia:
https://ips.usm.my/index.php/download/viva-voce

2. Please review the thesis and submit the completed Thesis Examiner's Report together with the annotated thesis (PDF), where applicable, on or before:

Submission Due Date:
{{DueDate}}

3. Kindly submit your report securely via the VivaTrack platform using the link below:

🔗 Submit Examination Report
{{SubmissionLink}}

4. Upon successful submission through VivaTrack, your report will be automatically forwarded to the Institute of Postgraduate Studies (IPS), Universiti Sains Malaysia. A copy will also be retained by the PKTAAB Viva Secretariat for record purposes. No separate email submission is required.

5. To facilitate the candidate's thesis revision following the viva voce examination, you are kindly requested to provide a comprehensive and detailed evaluation in the official report and, where appropriate, include comments directly on the thesis PDF.

6. As an appointed examiner, you are required to attend the viva voce examination on the scheduled date. Details of the viva session will be communicated to you separately. Participation via Microsoft Teams may be arranged where appropriate.

Should you require any clarification or technical assistance regarding the thesis documents or VivaTrack platform, please do not hesitate to contact the PKTAAB Viva Secretariat.

The University sincerely appreciates your time, expertise and valuable contribution towards maintaining the quality and standards of postgraduate education at Universiti Sains Malaysia.

Thank you.

Yours sincerely,

Viva Secretariat
Academic & International Division
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)
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

  function previewEmailHandler() {
 const examinerId =
  form.externalExaminers[0] ||
  form.internalExaminers[0];

const examiner = examiners.find(
  e => e.ExaminerID === examinerId
);
let preview = form.emailBody;

preview = preview
  .replaceAll("{{ExaminerTitle}}", examiner?.Title || "")
  .replaceAll("{{ExaminerName}}", examiner?.ExaminerName || "")
  .replaceAll("{{ExaminerType}}", examiner?.ExaminerType || "")
  .replaceAll("{{DriveLink}}", form.driveLink)
  .replaceAll("{{DueDate}}", form.dueDate)
  .replaceAll("{{SubmissionLink}}", "https://vivatrack.onrender.com/submit");

setPreviewEmail(preview);
  setPreviewOpen(true);
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
      sendToExaminer={sendToExaminer}
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
    {form.emailSubject}
  </div>

  <p className="font-semibold">Body</p>
  <div className="rounded border bg-gray-50 p-4">
    <pre className="whitespace-pre-wrap text-sm">
      {previewEmail}
    </pre>
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
          onClick={() => {
            setPreviewOpen(false);
            sendToExaminer();
          }}
          className="rounded bg-purple-600 px-4 py-2 text-white"
        >
          📧 Send Email
        </button>

      </div>

    </div>
  </div>
)}

    </div>
  );
}

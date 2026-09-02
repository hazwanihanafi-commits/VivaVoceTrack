import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SummaryCards from "../components/vivacases/SummaryCards";
import VivaCaseForm from "../components/vivacases/VivaCaseForm";
import VivaCaseTable from "../components/vivacases/VivaCaseTable";
import CaseStatusCard from "../components/vivacases/CaseStatusCard";

const API = "https://vivatrack-backend.onrender.com/api";

export default function VivaCases() {
  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [cases, setCases] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewType, setPreviewType] = useState("thesis");

  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] = useState({
    studentId: "",
    chairpersonId: "",
    secretaryId: "",
    internalExaminers: [""],
    externalExaminers: [""],
    driveLink: "",
    receivedDate: "",
    dueDate: "",
    emailSubject: "",
    reminder: true,
  });

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadStudents();
    loadExaminers();
    loadStaff();
    loadCases();
  }, []);

  // ======================================================
  // LOAD STUDENTS
  // GET /api/students
  // ======================================================

  async function loadStudents() {
    try {
      const res = await fetch(`${API}/students`);
      const data = await res.json();

      console.log("STUDENTS API RESPONSE:", data);

      if (!res.ok) {
        console.error("LOAD STUDENTS ERROR:", data);
        setStudents([]);
        return;
      }

      const studentData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      console.log("STUDENTS:", studentData);

      setStudents(studentData);
    } catch (err) {
      console.error("LOAD STUDENTS ERROR:", err);
      setStudents([]);
    }
  }

  // ======================================================
  // LOAD EXAMINERS
  // GET /api/examiners
  // ======================================================

  async function loadExaminers() {
    try {
      const res = await fetch(`${API}/examiners`);
      const data = await res.json();

      console.log("EXAMINERS API RESPONSE:", data);

      if (!res.ok) {
        console.error("LOAD EXAMINERS ERROR:", data);
        setExaminers([]);
        return;
      }

      const examinerData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setExaminers(examinerData);
    } catch (err) {
      console.error("LOAD EXAMINERS ERROR:", err);
      setExaminers([]);
    }
  }

  // ======================================================
  // LOAD STAFF
  // GET /api/staff
  // ======================================================

  async function loadStaff() {
    try {
      const res = await fetch(`${API}/staff`);
      const data = await res.json();

      console.log("STAFF API RESPONSE:", data);

      if (!res.ok) {
        console.error("LOAD STAFF ERROR:", data);
        setStaff([]);
        return;
      }

      const staffData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setStaff(staffData);
    } catch (err) {
      console.error("LOAD STAFF ERROR:", err);
      setStaff([]);
    }
  }

  // ======================================================
  // LOAD VIVA CASES
  // GET /api/vivacases
  // ======================================================

  async function loadCases() {
    try {
      const res = await fetch(`${API}/vivacases`);

      const data = await res.json();

      console.log("=================================");
      console.log("VIVA CASES API RESPONSE:", data);
      console.log("=================================");

      if (!res.ok) {
        console.error("LOAD CASES ERROR:", data);
        setCases([]);
        return;
      }

      const rawCases = Array.isArray(data.data)
        ? data.data
        : [];

      console.log("RAW VIVA CASES:", rawCases);

      // ==================================================
      // IMPORTANT
      //
      // Backend getRows() already uses the Google Sheet
      // header names. Therefore CaseID should be CaseID.
      // No complicated key conversion is necessary.
      // ==================================================

      const normalizedCases = rawCases.map((item) => ({
        ...item,

        CaseID: String(item.CaseID || "").trim(),

        StudentID: String(item.StudentID || "").trim(),

        InternalExaminer1ID:
          String(item.InternalExaminer1ID || "").trim(),

        InternalExaminer2ID:
          String(item.InternalExaminer2ID || "").trim(),

        ExternalExaminer1ID:
          String(item.ExternalExaminer1ID || "").trim(),

        ExternalExaminer2ID:
          String(item.ExternalExaminer2ID || "").trim(),

        ReportDueDate:
          item.ReportDueDate || "",

        CurrentStatus:
          item.CurrentStatus || "",
      }));

      console.log(
        "NORMALIZED VIVA CASES:",
        normalizedCases
      );

      console.log(
        "CASE IDS:",
        normalizedCases.map((item) => item.CaseID)
      );

      setCases(normalizedCases);
    } catch (err) {
      console.error("LOAD CASES ERROR:", err);
      setCases([]);
    }
  }

  // ======================================================
  // STUDENT SELECT
  // ======================================================

  function handleStudent(id) {
    const student = students.find(
      (s) =>
        String(s.StudentID || "").trim() ===
        String(id || "").trim()
    );

    setSelectedStudent(student || null);

    setForm((prev) => ({
      ...prev,

      studentId: id,

      emailSubject:
        `Submission of Thesis for Examination – ${
          student?.StudentName || ""
        } (${
          student?.MatricNo || ""
        }), ${
          student?.Programme || ""
        }, PKTAAB, Universiti Sains Malaysia`,
    }));
  }

  // ======================================================
  // FORM UPDATE
  // ======================================================

  function updateField(e) {
    const {
      name,
      value,
      type,
      checked,
      index,
    } = e.target;

    setForm((prev) => {
      // ==================================================
      // ADD INTERNAL
      // ==================================================

      if (name === "addInternal") {
        return {
          ...prev,
          internalExaminers: [
            ...prev.internalExaminers,
            "",
          ],
        };
      }

      // ==================================================
      // REMOVE INTERNAL
      // ==================================================

      if (name === "removeInternal") {
        return {
          ...prev,

          internalExaminers:
            prev.internalExaminers.filter(
              (_, i) => i !== index
            ),
        };
      }

      // ==================================================
      // ADD EXTERNAL
      // ==================================================

      if (name === "addExternal") {
        return {
          ...prev,

          externalExaminers: [
            ...prev.externalExaminers,
            "",
          ],
        };
      }

      // ==================================================
      // REMOVE EXTERNAL
      // ==================================================

      if (name === "removeExternal") {
        return {
          ...prev,

          externalExaminers:
            prev.externalExaminers.filter(
              (_, i) => i !== index
            ),
        };
      }

      // ==================================================
      // INTERNAL EXAMINER
      // ==================================================

      if (name === "internalExaminer") {
        const list = [
          ...prev.internalExaminers,
        ];

        list[index] = value;

        return {
          ...prev,

          internalExaminers: list,
        };
      }

      // ==================================================
      // EXTERNAL EXAMINER
      // ==================================================

      if (name === "externalExaminer") {
        const list = [
          ...prev.externalExaminers,
        ];

        list[index] = value;

        return {
          ...prev,

          externalExaminers: list,
        };
      }

      // ==================================================
      // NORMAL FIELD
      // ==================================================

      return {
        ...prev,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      };
    });
  }

  // ======================================================
  // OPEN SCHEDULE PAGE
  // ======================================================

  function handleSchedule(item) {
    const caseID = String(
      item?.CaseID || ""
    ).trim();

    console.log(
      "SCHEDULE CASE ID:",
      caseID
    );

    if (!caseID) {
      alert(
        "Viva Case ID is required."
      );
      return;
    }

    navigate(
      `/schedule?caseID=${encodeURIComponent(
        caseID
      )}`
    );
  }

  // ======================================================
  // MANAGE CASE
  // ======================================================

  function handleManage(item) {
    console.log(
      "MANAGE CASE:",
      item
    );

    const caseID = String(
      item?.CaseID || ""
    ).trim();

    if (!caseID) {
      console.error(
        "MANAGE CASE: CaseID missing",
        item
      );

      alert(
        "This Viva Case does not have a valid Case ID."
      );

      return;
    }

    setSelectedCase(item);

    const student = students.find(
      (s) =>
        String(s.StudentID || "").trim() ===
        String(item.StudentID || "").trim()
    );

    setSelectedStudent(
      student || null
    );

    setForm({
      studentId:
        item.StudentID || "",

      chairpersonId:
        item.ChairpersonID || "",

      secretaryId:
        item.SecretaryID || "",

      internalExaminers: [
        item.InternalExaminer1ID || "",
        item.InternalExaminer2ID || "",
      ].filter(Boolean),

      externalExaminers: [
        item.ExternalExaminer1ID || "",
        item.ExternalExaminer2ID || "",
      ].filter(Boolean),

      driveLink:
        item.GoogleDriveLink || "",

      receivedDate:
        item.DateReceivedFromIPS || "",

      dueDate:
        item.ReportDueDate || "",

      emailSubject:
        item.EmailSubject || "",

      reminder:
        item.ReminderEnabled === "No"
          ? false
          : true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ======================================================
  // PREVIEW EMAIL
  // ======================================================

  async function previewEmailHandler(
    type = "thesis"
  ) {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res = await fetch(
        `${API}/emails/${encodeURIComponent(
          caseID
        )}/preview/${type}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to preview email."
        );

        return;
      }

      setPreviewType(type);
      setPreviewSubject(
        data.subject || ""
      );
      setPreviewHtml(
        data.html || ""
      );
      setPreviewOpen(true);
    } catch (err) {
      console.error(
        "PREVIEW EMAIL ERROR:",
        err
      );

      alert(
        "Unable to load email preview."
      );
    }
  }

  // ======================================================
  // DELETE CASE
  // ======================================================

  async function deleteCase(caseID) {
    const id = String(
      caseID || ""
    ).trim();

    console.log(
      "================================="
    );

    console.log(
      "DELETE CLICKED"
    );

    console.log(
      "DELETE CASE ID:",
      id
    );

    console.log(
      "================================="
    );

    if (!id) {
      alert(
        "Case ID is missing."
      );

      return;
    }

    const ok = window.confirm(
      `Are you sure you want to delete ${id}?`
    );

    if (!ok) {
      return;
    }

    try {
      const url =
        `${API}/vivacases/${encodeURIComponent(
          id
        )}`;

      console.log(
        "DELETE URL:",
        url
      );

      const res = await fetch(
        url,
        {
          method: "DELETE",
        }
      );

      const data =
        await res.json();

      console.log(
        "DELETE RESPONSE:",
        data
      );

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to delete case."
        );

        return;
      }

      alert(
        `Viva Case ${id} deleted successfully.`
      );

      // ==================================================
      // REFRESH CASE LIST
      // ==================================================

      await loadCases();

      // ==================================================
      // CLEAR SELECTED CASE
      // ==================================================

      setSelectedCase(null);
      setSelectedStudent(null);

      // ==================================================
      // RESET FORM
      // ==================================================

      setForm({
        studentId: "",
        chairpersonId: "",
        secretaryId: "",
        internalExaminers: [""],
        externalExaminers: [""],
        driveLink: "",
        receivedDate: "",
        dueDate: "",
        emailSubject: "",
        reminder: true,
      });
    } catch (err) {
      console.error(
        "DELETE CASE ERROR:",
        err
      );

      alert(
        "Server connection failed."
      );
    }
  }

  // ======================================================
  // SAVE DRAFT
  // ======================================================

  async function saveDraft() {
    try {
      const payload = {
        StudentID:
          form.studentId,

        ChairpersonID:
          form.chairpersonId || "",

        SecretaryID:
          form.secretaryId || "",

        InternalExaminer1ID:
          form.internalExaminers[0] ||
          "",

        InternalExaminer2ID:
          form.internalExaminers[1] ||
          "",

        ExternalExaminer1ID:
          form.externalExaminers[0] ||
          "",

        ExternalExaminer2ID:
          form.externalExaminers[1] ||
          "",

        GoogleDriveLink:
          form.driveLink || "",

        DateReceivedFromIPS:
          form.receivedDate || "",

        ReportDueDate:
          form.dueDate || "",

        EmailSubject:
          form.emailSubject || "",

        ReminderEnabled:
          form.reminder
            ? "Yes"
            : "No",

        CurrentStatus:
          "Draft",
      };

      console.log(
        "SAVE PAYLOAD:",
        payload
      );

      let res;

      // ==================================================
      // UPDATE EXISTING CASE
      // ==================================================

      if (
        selectedCase?.CaseID
      ) {
        const caseID = String(
          selectedCase.CaseID
        ).trim();

        console.log(
          "UPDATING CASE:",
          caseID
        );

        res = await fetch(
          `${API}/vivacases/${encodeURIComponent(
            caseID
          )}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      // ==================================================
      // CREATE NEW CASE
      // ==================================================

      else {
        console.log(
          "CREATING NEW VIVA CASE"
        );

        res = await fetch(
          `${API}/vivacases`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      const data =
        await res.json();

      console.log(
        "SAVE RESPONSE:",
        data
      );

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to save draft."
        );

        return;
      }

      // ==================================================
      // EXISTING CASE
      // ==================================================

      if (data.existing) {
        const existing =
          data.data;

        if (existing) {
          setSelectedCase(
            existing
          );

          const student =
            students.find(
              (s) =>
                String(
                  s.StudentID || ""
                ).trim() ===
                String(
                  existing.StudentID ||
                    ""
                ).trim()
            );

          setSelectedStudent(
            student || null
          );
        }

        alert(
          `Existing Viva Case found.\n\nCase ID: ${data.caseID}\n\nThe existing case has been opened instead of creating a duplicate.`
        );
      }

      // ==================================================
      // NEW CASE
      // ==================================================

      else if (
        data.caseID
      ) {
        alert(
          `Draft saved successfully.\n\nCase ID: ${data.caseID}`
        );
      }

      // ==================================================
      // REFRESH
      // ==================================================

      await loadCases();

      // ==================================================
      // GET LATEST CASE
      // ==================================================

      const refreshed =
        await fetch(
          `${API}/vivacases`
        );

      const json =
        await refreshed.json();

      const targetCaseID =
        data.caseID ||
        data.data?.CaseID ||
        selectedCase?.CaseID;

      const latest =
        Array.isArray(
          json.data
        )
          ? json.data.find(
              (c) =>
                String(
                  c.CaseID || ""
                ).trim() ===
                String(
                  targetCaseID ||
                    ""
                ).trim()
            )
          : null;

      console.log(
        "LATEST CASE:",
        latest
      );

      if (latest) {
        handleManage(
          latest
        );
      }
    } catch (err) {
      console.error(
        "SAVE DRAFT ERROR:",
        err
      );

      alert(
        "Unable to connect to server."
      );
    }
  }

  // ======================================================
  // SEND APPOINTMENT
  // ======================================================

  async function sendAppointment() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/emails/${encodeURIComponent(
            caseID
          )}/send-appointment`,
          {
            method: "POST",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to send appointment email."
        );

        return;
      }

      alert(
        data.message
      );

      await loadCases();
    } catch (err) {
      console.error(
        "SEND APPOINTMENT ERROR:",
        err
      );

      alert(
        "Unable to send appointment email."
      );
    }
  }

  // ======================================================
  // SEND THESIS
  // ======================================================

  async function sendThesis() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/emails/${encodeURIComponent(
            caseID
          )}/send-thesis`,
          {
            method: "POST",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to send thesis email."
        );

        return;
      }

      alert(
        data.message
      );

      await loadCases();
    } catch (err) {
      console.error(
        "SEND THESIS ERROR:",
        err
      );

      alert(
        "Unable to send thesis email."
      );
    }
  }

  // ======================================================
  // SEND REMINDER
  // ======================================================

  async function sendReminder() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/emails/${encodeURIComponent(
            caseID
          )}/send-reminder`,
          {
            method: "POST",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to send reminder email."
        );

        return;
      }

      alert(
        data.message
      );

      await loadCases();
    } catch (err) {
      console.error(
        "SEND REMINDER ERROR:",
        err
      );

      alert(
        "Unable to send reminder email."
      );
    }
  }

  // ======================================================
  // SEND SCHEDULE
  // ======================================================

  async function sendSchedule() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/emails/${encodeURIComponent(
            caseID
          )}/send-schedule`,
          {
            method: "POST",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to send schedule email."
        );

        return;
      }

      alert(
        data.message
      );

      await loadCases();
    } catch (err) {
      console.error(
        "SEND SCHEDULE ERROR:",
        err
      );

      alert(
        "Unable to send schedule email."
      );
    }
  }

  // ======================================================
  // SEND THANK YOU
  // ======================================================

  async function sendThankYou() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/emails/${encodeURIComponent(
            caseID
          )}/send-thankyou`,
          {
            method: "POST",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to send thank-you email."
        );

        return;
      }

      alert(
        data.message
      );

      await loadCases();
    } catch (err) {
      console.error(
        "SEND THANK YOU ERROR:",
        err
      );

      alert(
        "Unable to send thank-you email."
      );
    }
  }

  // ======================================================
  // CREATE GOOGLE DRIVE FOLDER
  // ======================================================

  async function createDriveFolder() {
    if (!selectedCase?.CaseID) {
      alert(
        "Please save the Viva Case first before creating the Google Drive folder."
      );

      return;
    }

    try {
      const caseID = String(
        selectedCase.CaseID
      ).trim();

      const res =
        await fetch(
          `${API}/vivacases/${encodeURIComponent(
            caseID
          )}/create-drive-folder`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Unable to create Google Drive folder."
        );

        return;
      }

      setForm((prev) => ({
        ...prev,

        driveLink:
          data.googleDriveLink ||
          "",
      }));

      setSelectedCase((prev) => ({
        ...prev,

        GoogleDriveLink:
          data.googleDriveLink ||
          "",
      }));

      await loadCases();

      alert(
        `Google Drive folder created successfully.\n\nCase ID: ${data.caseID}`
      );
    } catch (err) {
      console.error(
        "CREATE DRIVE FOLDER ERROR:",
        err
      );

      alert(
        "Unable to connect to the server."
      );
    }
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="space-y-8">

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <SummaryCards
        cases={cases}
      />

      {/* ==================================================
          FORM + STATUS
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">

          <VivaCaseForm
            selectedCase={
              selectedCase
            }

            students={
              students
            }

            examiners={
              examiners
            }

            staff={
              staff
            }

            selectedStudent={
              selectedStudent
            }

            form={
              form
            }

            handleStudent={
              handleStudent
            }

            updateField={
              updateField
            }

            saveDraft={
              saveDraft
            }

            sendAppointment={
              sendAppointment
            }

            sendThesis={
              sendThesis
            }

            sendReminder={
              sendReminder
            }

            sendSchedule={
              sendSchedule
            }

            sendThankYou={
              sendThankYou
            }

            previewEmailHandler={
              previewEmailHandler
            }

            createDriveFolder={
              createDriveFolder
            }
          />

        </div>

        <CaseStatusCard
          selectedCase={
            selectedCase
          }
        />

      </div>

      {/* ==================================================
          CASE TABLE
      ================================================== */}

      <VivaCaseTable
        cases={
          cases
        }

        students={
          students
        }

        examiners={
          examiners
        }

        onManage={
          handleManage
        }

        onSchedule={
          handleSchedule
        }

        onDelete={
          deleteCase
        }
      />

      {/* ==================================================
          EMAIL PREVIEW MODAL
      ================================================== */}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-[95vw] max-w-7xl rounded-lg bg-white p-6 shadow-xl">

            {/* TITLE */}

            <h2 className="mb-4 text-xl font-bold">
              Email Preview
            </h2>

            {/* SUBJECT + BODY */}

            <div className="mb-4 rounded border bg-gray-50 p-4">

              <div className="mb-4">

                <p className="font-semibold">
                  Subject
                </p>

                <div className="mb-4 rounded border bg-gray-100 p-3">
                  {previewSubject}
                </div>

                <p className="font-semibold">
                  Body
                </p>

                <div className="max-h-[75vh] overflow-auto rounded border bg-gray-50 p-4">

                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        previewHtml,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3">

              {/* CLOSE */}

              <button
                onClick={() =>
                  setPreviewOpen(
                    false
                  )
                }
                className="rounded bg-gray-500 px-4 py-2 text-white"
              >
                Close
              </button>

              {/* SEND */}

              <button
                onClick={async () => {
                  setPreviewOpen(
                    false
                  );

                  switch (
                    previewType
                  ) {
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SummaryCards from "../components/vivacases/SummaryCards";
import VivaCaseForm from "../components/vivacases/VivaCaseForm";
import VivaCaseTable from "../components/vivacases/VivaCaseTable";
import CaseStatusCard from "../components/vivacases/CaseStatusCard";

const API =
  "https://vivatrack-backend.onrender.com/api";

export default function VivaCases() {

  const navigate = useNavigate();

  /* ======================================================
     STATE
  ====================================================== */

  const [students, setStudents] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [cases, setCases] = useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [selectedCase, setSelectedCase] =
    useState(null);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [previewHtml, setPreviewHtml] =
    useState("");

  const [previewSubject, setPreviewSubject] =
    useState("");

  const [previewType, setPreviewType] =
    useState("thesis");


  /* ======================================================
     FORM
  ====================================================== */

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


  /* ======================================================
     LOAD INITIAL DATA
  ====================================================== */

  useEffect(() => {

    loadStudents();
    loadExaminers();
    loadStaff();
    loadCases();

  }, []);


  /* ======================================================
     LOAD STUDENTS
  ====================================================== */

  // ======================================================
// LOAD VIVA CASES
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
    // NORMALISE OBJECT KEYS
    // ==================================================

    const normalizedCases = rawCases.map((item) => {

      // Get all keys
      const keys = Object.keys(item || {});

      // Find CaseID regardless of capitalisation / spacing
      const caseIDKey = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return (
          clean === "caseid" ||
          clean === "caseno" ||
          clean === "casenumber"
        );
      });

      const studentIDKey = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "studentid";
      });

      const internal1Key = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "internalexaminer1id";
      });

      const internal2Key = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "internalexaminer2id";
      });

      const external1Key = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "externalexaminer1id";
      });

      const external2Key = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "externalexaminer2id";
      });

      const dueDateKey = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "reportduedate";
      });

      const statusKey = keys.find((key) => {
        const clean = String(key)
          .replace(/[\s_-]/g, "")
          .toLowerCase();

        return clean === "currentstatus";
      });

      // ==================================================
      // ACTUAL CASE ID
      // ==================================================

      const caseID = caseIDKey
        ? String(item[caseIDKey] || "").trim()
        : "";

      console.log(
        "CASE:",
        caseID,
        "ORIGINAL KEY:",
        caseIDKey
      );

      return {
        ...item,

        CaseID: caseID,

        StudentID: studentIDKey
          ? item[studentIDKey] || ""
          : "",

        InternalExaminer1ID: internal1Key
          ? item[internal1Key] || ""
          : "",

        InternalExaminer2ID: internal2Key
          ? item[internal2Key] || ""
          : "",

        ExternalExaminer1ID: external1Key
          ? item[external1Key] || ""
          : "",

        ExternalExaminer2ID: external2Key
          ? item[external2Key] || ""
          : "",

        ReportDueDate: dueDateKey
          ? item[dueDateKey] || ""
          : "",

        CurrentStatus: statusKey
          ? item[statusKey] || ""
          : "",
      };
    });

    console.log(
      "================================="
    );

    console.log(
      "NORMALIZED VIVA CASES:",
      normalizedCases
    );

    console.log(
      "CASE IDS:",
      normalizedCases.map(
        (x) => x.CaseID
      )
    );

    console.log(
      "================================="
    );

    setCases(normalizedCases);

  } catch (err) {

    console.error(
      "LOAD CASES ERROR:",
      err
    );

    setCases([]);
  }
}
  /* ======================================================
     LOAD EXAMINERS
  ====================================================== */

  async function loadExaminers() {

    try {

      const res =
        await fetch(`${API}/examiners`);

      const data =
        await res.json();

      setExaminers(
        data.data || []
      );

    } catch (err) {

      console.error(
        "LOAD EXAMINERS ERROR:",
        err
      );

    }

  }


  /* ======================================================
     LOAD STAFF
  ====================================================== */

  async function loadStaff() {

    try {

      const res =
        await fetch(`${API}/staff`);

      const data =
        await res.json();

      setStaff(
        data.data || []
      );

    } catch (err) {

      console.error(
        "LOAD STAFF ERROR:",
        err
      );

    }

  }


  /* ======================================================
     LOAD VIVA CASES
  ====================================================== */

  async function loadCases() {
  try {
    const res = await fetch(`${API}/vivacases`);

    const data = await res.json();

    console.log("VIVA CASES API RESPONSE:", data);

    if (!res.ok) {
      console.error("LOAD CASES ERROR:", data);
      setCases([]);
      return;
    }

    const rawCases = Array.isArray(data.data)
      ? data.data
      : [];

    console.log("RAW VIVA CASES:", rawCases);

    const normalizedCases = rawCases.map((item) => ({
      ...item,

      // ============================================
      // CASE ID
      // ============================================
      CaseID:
        item.CaseID ??
        item.caseID ??
        item.caseId ??
        item["Case ID"] ??
        item["Case No"] ??
        item["Case Number"] ??
        "",

      // ============================================
      // STUDENT
      // ============================================
      StudentID:
        item.StudentID ??
        item.studentID ??
        item.studentId ??
        "",

      // ============================================
      // INTERNAL EXAMINER
      // ============================================
      InternalExaminer1ID:
        item.InternalExaminer1ID ??
        item.internalExaminer1ID ??
        "",

      InternalExaminer2ID:
        item.InternalExaminer2ID ??
        item.internalExaminer2ID ??
        "",

      // ============================================
      // EXTERNAL EXAMINER
      // ============================================
      ExternalExaminer1ID:
        item.ExternalExaminer1ID ??
        item.externalExaminer1ID ??
        "",

      ExternalExaminer2ID:
        item.ExternalExaminer2ID ??
        item.externalExaminer2ID ??
        "",

      // ============================================
      // DUE DATE
      // ============================================
      ReportDueDate:
        item.ReportDueDate ??
        item.reportDueDate ??
        item["Report Due Date"] ??
        "",

      // ============================================
      // STATUS
      // ============================================
      CurrentStatus:
        item.CurrentStatus ??
        item.currentStatus ??
        "",
    }));

    console.log(
      "NORMALIZED VIVA CASES:",
      normalizedCases
    );

    setCases(normalizedCases);

  } catch (err) {

    console.error(
      "LOAD CASES ERROR:",
      err
    );

    setCases([]);
  }
}


  /* ======================================================
     STUDENT SELECT
  ====================================================== */

  function handleStudent(id) {

    const student =
      students.find(
        (s) =>
          s.StudentID === id
      );

    setSelectedStudent(
      student || null
    );

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


  /* ======================================================
     FORM UPDATE
  ====================================================== */

  function updateField(e) {

    const {
      name,
      value,
      type,
      checked,
      index,
    } = e.target;


    setForm((prev) => {


      /* -----------------------------------------------
         ADD INTERNAL
      ----------------------------------------------- */

      if (
        name === "addInternal"
      ) {

        return {

          ...prev,

          internalExaminers: [
            ...prev.internalExaminers,
            "",
          ],

        };

      }


      /* -----------------------------------------------
         REMOVE INTERNAL
      ----------------------------------------------- */

      if (
        name === "removeInternal"
      ) {

        return {

          ...prev,

          internalExaminers:
            prev.internalExaminers.filter(
              (_, i) =>
                i !== index
            ),

        };

      }


      /* -----------------------------------------------
         ADD EXTERNAL
      ----------------------------------------------- */

      if (
        name === "addExternal"
      ) {

        return {

          ...prev,

          externalExaminers: [
            ...prev.externalExaminers,
            "",
          ],

        };

      }


      /* -----------------------------------------------
         REMOVE EXTERNAL
      ----------------------------------------------- */

      if (
        name === "removeExternal"
      ) {

        return {

          ...prev,

          externalExaminers:
            prev.externalExaminers.filter(
              (_, i) =>
                i !== index
            ),

        };

      }


      /* -----------------------------------------------
         INTERNAL EXAMINER
      ----------------------------------------------- */

      if (
        name ===
        "internalExaminer"
      ) {

        const list = [
          ...prev.internalExaminers,
        ];

        list[index] =
          value;

        return {

          ...prev,

          internalExaminers:
            list,

        };

      }


      /* -----------------------------------------------
         EXTERNAL EXAMINER
      ----------------------------------------------- */

      if (
        name ===
        "externalExaminer"
      ) {

        const list = [
          ...prev.externalExaminers,
        ];

        list[index] =
          value;

        return {

          ...prev,

          externalExaminers:
            list,

        };

      }


      /* -----------------------------------------------
         NORMAL FIELD
      ----------------------------------------------- */

      return {

        ...prev,

        [name]:
          type === "checkbox"
            ? checked
            : value,

      };

    });

  }


  /* ======================================================
     OPEN SCHEDULE PAGE
  ====================================================== */

  function handleSchedule(item) {

    if (!item?.CaseID) {

      alert(
        "Viva Case ID is required."
      );

      return;

    }

    navigate(
      `/schedule?caseID=${encodeURIComponent(
        item.CaseID
      )}`
    );

  }


  /* ======================================================
     MANAGE CASE
  ====================================================== */

  function handleManage(item) {

    setSelectedCase(
      item
    );


    const student =
      students.find(
        (s) =>
          s.StudentID ===
          item.StudentID
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

        item.InternalExaminer1ID ||
          "",

        item.InternalExaminer2ID ||
          "",

      ].filter(Boolean),

      externalExaminers: [

        item.ExternalExaminer1ID ||
          "",

        item.ExternalExaminer2ID ||
          "",

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
        item.ReminderEnabled ===
        "No"
          ? false
          : true,

    });


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  }


  /* ======================================================
     PREVIEW EMAIL
  ====================================================== */

  async function previewEmailHandler(
    type = "thesis"
  ) {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/preview/${type}`
        );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.message ||
            "Unable to preview email."
        );

        return;

      }


      setPreviewType(
        type
      );

      setPreviewSubject(
        data.subject
      );

      setPreviewHtml(
        data.html
      );

      setPreviewOpen(
        true
      );

    } catch (err) {

      console.error(
        err
      );

      alert(
        "Unable to load email preview."
      );

    }

  }


  /* ======================================================
     DELETE CASE
  ====================================================== */

  async function deleteCase(caseID) {
  const id = String(caseID || "").trim();

  console.log("DELETE CASE ID:", id);

  if (!id) {
    alert("Case ID is missing.");
    return;
  }

  const ok = window.confirm(
    `Are you sure you want to delete ${id}?`
  );

  if (!ok) return;

  try {
    const url = `${API}/vivacases/${encodeURIComponent(id)}`;

    console.log("DELETE URL:", url);

    const res = await fetch(url, {
      method: "DELETE",
    });

    const data = await res.json();

    console.log("DELETE RESPONSE:", data);

    if (!res.ok) {
      alert(data.message || "Unable to delete case.");
      return;
    }

    alert(`Viva Case ${id} deleted successfully.`);

    // refresh table
    await loadCases();

    // clear form
    setSelectedCase(null);
    setSelectedStudent(null);

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
    console.error("DELETE CASE ERROR:", err);

    alert("Server connection failed.");
  }
}

  /* ======================================================
     SAVE DRAFT
  ====================================================== */

  async function saveDraft() {

    try {


      const payload = {

        StudentID:
          form.studentId,


        /* ===============================================
           CHAIRPERSON
        =============================================== */

        ChairpersonID:
          form.chairpersonId ||
          "",


        /* ===============================================
           SECRETARY
        =============================================== */

        SecretaryID:
          form.secretaryId ||
          "",


        /* ===============================================
           INTERNAL EXAMINERS
        =============================================== */

        InternalExaminer1ID:
          form.internalExaminers[0] ||
          "",

        InternalExaminer2ID:
          form.internalExaminers[1] ||
          "",


        /* ===============================================
           EXTERNAL EXAMINERS
        =============================================== */

        ExternalExaminer1ID:
          form.externalExaminers[0] ||
          "",

        ExternalExaminer2ID:
          form.externalExaminers[1] ||
          "",


        /* ===============================================
           DOCUMENT
        =============================================== */

        GoogleDriveLink:
          form.driveLink,


        /* ===============================================
           DATES
        =============================================== */

        DateReceivedFromIPS:
          form.receivedDate,

        ReportDueDate:
          form.dueDate,


        /* ===============================================
           EMAIL
        =============================================== */

        EmailSubject:
          form.emailSubject,

        ReminderEnabled:
          form.reminder
            ? "Yes"
            : "No",


        /* ===============================================
           STATUS
        =============================================== */

        CurrentStatus:
          "Draft",

      };


      let res;


      /* ==================================================
         UPDATE EXISTING CASE
      ================================================== */

      if (
        selectedCase?.CaseID
      ) {

        res =
          await fetch(
            `${API}/vivacases/${selectedCase.CaseID}`,
            {

              method:
                "PUT",

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


      /* ==================================================
         CREATE NEW CASE
      ================================================== */

      else {

        res =
          await fetch(
            `${API}/vivacases`,
            {

              method:
                "POST",

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


      if (!res.ok) {

        alert(
          data.message ||
            "Unable to save draft."
        );

        return;

      }


      /* ==================================================
         EXISTING CASE
      ================================================== */

      if (
        data.existing
      ) {

        setSelectedCase(
          data.data
        );


        alert(
          `Existing Viva Case found.\n\nCase ID: ${data.caseID}\n\nThe existing case has been opened instead of creating a duplicate.`
        );

      }


      /* ==================================================
         NEW CASE
      ================================================== */

      else if (
        data.caseID
      ) {

        alert(
          `Draft saved successfully.\n\nCase ID: ${data.caseID}`
        );

      }


      /* ==================================================
         REFRESH
      ================================================== */

      await loadCases();


      const refreshed =
        await fetch(
          `${API}/vivacases`
        );


      const json =
        await refreshed.json();


      const latest =
        json.data?.find(
          (c) =>
            c.CaseID ===
            data.caseID
        ) ||
        json.data?.find(
          (c) =>
            c.CaseID ===
            data.data?.CaseID
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


  /* ======================================================
     SEND APPOINTMENT
  ====================================================== */

  async function sendAppointment() {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/send-appointment`,
          {
            method:
              "POST",
          }
        );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.message
        );

        return;

      }


      alert(
        data.message
      );


      await loadCases();


    } catch (err) {

      console.error(
        err
      );

      alert(
        "Unable to send appointment email."
      );

    }

  }


  /* ======================================================
     SEND THESIS
  ====================================================== */

  async function sendThesis() {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/send-thesis`,
          {
            method:
              "POST",
          }
        );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.message
        );

        return;

      }


      alert(
        data.message
      );


      await loadCases();


    } catch (err) {

      console.error(
        err
      );

      alert(
        "Unable to send thesis email."
      );

    }

  }


  /* ======================================================
     SEND REMINDER
  ====================================================== */

  async function sendReminder() {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/send-reminder`,
          {
            method:
              "POST",
          }
        );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.message
        );

        return;

      }


      alert(
        data.message
      );


      await loadCases();


    } catch (err) {

      console.error(
        err
      );

      alert(
        "Unable to send reminder email."
      );

    }

  }


  /* ======================================================
     SEND SCHEDULE
     
     NOTE:
     Schedule is now handled on the Schedule page.
     We therefore do NOT save schedule fields here.
  ====================================================== */

  async function sendSchedule() {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the Viva Case List below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/send-schedule`,
          {
            method:
              "POST",
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
        err
      );

      alert(
        "Unable to send schedule email."
      );

    }

  }


  /* ======================================================
     SEND THANK YOU
  ====================================================== */

  async function sendThankYou() {

    if (!selectedCase) {

      alert(
        "Please save the draft first. A Viva Case Number will be generated automatically. After that, select the case from the table below before previewing or sending emails."
      );

      return;

    }


    try {

      const res =
        await fetch(
          `${API}/emails/${selectedCase.CaseID}/send-thankyou`,
          {
            method:
              "POST",
          }
        );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.message
        );

        return;

      }


      alert(
        data.message
      );


      await loadCases();


    } catch (err) {

      console.error(
        err
      );

      alert(
        "Unable to send thank-you email."
      );

    }

  }


  /**
 * ======================================================
 * CREATE GOOGLE DRIVE FOLDER
 * ======================================================
 */
async function createDriveFolder() {

  if (!selectedCase?.CaseID) {

    alert(
      "Please save the Viva Case first before creating the Google Drive folder."
    );

    return;
  }

  try {

    const res = await fetch(
      `${API}/vivacases/${selectedCase.CaseID}/create-drive-folder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Unable to create Google Drive folder."
      );

      return;
    }

    // ============================================
    // UPDATE FORM
    // ============================================

    setForm((prev) => ({
      ...prev,
      driveLink:
        data.googleDriveLink || "",
    }));

    // ============================================
    // UPDATE SELECTED CASE
    // ============================================

    setSelectedCase((prev) => ({
      ...prev,
      GoogleDriveLink:
        data.googleDriveLink || "",
    }));

    // ============================================
    // REFRESH CASE LIST
    // ============================================

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
  /* ======================================================
     RENDER
  ====================================================== */

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


            {/* --------------------------------------------
                TITLE
            -------------------------------------------- */}

            <h2 className="mb-4 text-xl font-bold">
              Email Preview
            </h2>


            {/* --------------------------------------------
                SUBJECT
            -------------------------------------------- */}

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


            {/* --------------------------------------------
                BUTTONS
            -------------------------------------------- */}

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

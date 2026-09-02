import {
  Search,
  Calendar,
  Link,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function VivaCaseForm({
  selectedCase,
  students,
  examiners,
  staff,
  selectedStudent,
  form,
  handleStudent,
  updateField,
  saveDraft,
  createDriveFolder,
  sendAppointment,
  sendThesis,
  sendReminder,
  sendSchedule,
  sendThankYou,
  previewEmailHandler,
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            {selectedCase
              ? `Manage Viva Case (${selectedCase.CaseID})`
              : "Create New Viva Case"}
          </h2>

          {selectedCase && (
            <p className="mt-1 text-sm text-gray-500">
              Edit case details, send emails, track reports and
              manage the Viva panel.
            </p>
          )}

        </div>

      </div>


      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


        {/* ===================================================
            STUDENT
        =================================================== */}

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
              value={form.studentId}
              onChange={(e) =>
                handleStudent(e.target.value)
              }
              className="w-full rounded-xl border p-3 pl-10"
            >

              <option value="">
                Select Student
              </option>

              {(students || []).map((student) => (

                <option
                  key={student.StudentID}
                  value={student.StudentID}
                >
                  {student.StudentName}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* ===================================================
            PROGRAMME
        =================================================== */}

        <div>

          <label className="mb-2 block font-medium">
            Programme
          </label>

          <input
            readOnly
            value={
              selectedStudent?.Programme || ""
            }
            className="w-full rounded-xl border bg-gray-50 p-3"
          />

        </div>


        {/* ===================================================
            SUPERVISOR
        =================================================== */}

        <div>

          <label className="mb-2 block font-medium">
            Supervisor
          </label>

          <input
            readOnly
            value={
              selectedStudent?.Supervisor || ""
            }
            className="w-full rounded-xl border bg-gray-50 p-3"
          />

          <p className="mt-1 text-xs text-gray-500">
            Automatically obtained from the Students sheet.
          </p>

        </div>


        {/* ===================================================
            CO-SUPERVISOR
        =================================================== */}

        <div>

          <label className="mb-2 block font-medium">
            Co-Supervisor
          </label>

          <input
            readOnly
            value={
              selectedStudent?.CoSupervisor || ""
            }
            className="w-full rounded-xl border bg-gray-50 p-3"
          />

          <p className="mt-1 text-xs text-gray-500">
            Automatically obtained from the Students sheet.
          </p>

        </div>


        {/* ===================================================
            THESIS TITLE
        =================================================== */}

        <div className="md:col-span-2">

          <label className="mb-2 block font-medium">
            Thesis Title
          </label>

          <textarea
            readOnly
            rows={3}
            value={
              selectedStudent?.ThesisTitle || ""
            }
            className="w-full rounded-xl border bg-gray-50 p-3"
          />

        </div>


        {/* ===================================================
            CHAIRPERSON
        =================================================== */}

        <div>

          <label className="mb-2 block font-medium">
            Chairperson
          </label>

          <select
            name="chairpersonId"
            value={
              form.chairpersonId || ""
            }
            onChange={updateField}
            className="w-full rounded-xl border p-3"
          >

            <option value="">
              Select Chairperson
            </option>

            {(staff || [])
              .filter(
                (person) =>
                  String(person.Active || "")
                    .trim()
                    .toLowerCase() === "yes"
              )
              .map((person) => (

                <option
                  key={person.StaffID}
                  value={person.StaffID}
                >
                  {person.StaffName}
                </option>

              ))}

          </select>

        </div>


        {/* ===================================================
            SECRETARY
        =================================================== */}

        <div>

          <label className="mb-2 block font-medium">
            Secretary
          </label>

          <select
            name="secretaryId"
            value={
              form.secretaryId || ""
            }
            onChange={updateField}
            className="w-full rounded-xl border p-3"
          >

            <option value="">
              Select Secretary
            </option>

            {(staff || [])
              .filter(
                (person) =>
                  String(person.Active || "")
                    .trim()
                    .toLowerCase() === "yes"
              )
              .map((person) => (

                <option
                  key={person.StaffID}
                  value={person.StaffID}
                >
                  {person.StaffName}
                </option>

              ))}

          </select>

        </div>


        {/* ===================================================
            INTERNAL EXAMINERS
        =================================================== */}

        <div>

          <div className="mb-2 flex items-center justify-between">

            <label className="font-medium">
              Internal Examiners
            </label>

            <button
              type="button"
              onClick={() =>
                updateField({
                  target: {
                    name: "addInternal",
                  },
                })
              }
              className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            >

              <Plus size={16} />

              Add

            </button>

          </div>


          {(
            form.internalExaminers?.length
              ? form.internalExaminers
              : [""]
          ).map((examinerId, index) => (

            <div
              key={index}
              className="mb-3 flex gap-2"
            >

              <select
                value={examinerId}
                onChange={(e) =>
                  updateField({
                    target: {
                      name: "internalExaminer",
                      value: e.target.value,
                      index,
                    },
                  })
                }
                className="flex-1 rounded-xl border p-3"
              >

                <option value="">
                  Select Internal Examiner
                </option>

                {(examiners || []).map(
                  (examiner) => (

                    <option
                      key={
                        examiner.ExaminerID
                      }
                      value={
                        examiner.ExaminerID
                      }
                    >
                      {
                        examiner.ExaminerName
                      }
                    </option>

                  )
                )}

              </select>


              {index > 0 && (

                <button
                  type="button"
                  onClick={() =>
                    updateField({
                      target: {
                        name: "removeInternal",
                        index,
                      },
                    })
                  }
                  className="rounded-lg bg-red-500 p-3 text-white hover:bg-red-600"
                >

                  <Trash2 size={18} />

                </button>

              )}

            </div>

          ))}

        </div>


        {/* ===================================================
            EXTERNAL EXAMINERS
        =================================================== */}

        <div>

          <div className="mb-2 flex items-center justify-between">

            <label className="font-medium">
              External Examiners
            </label>

            <button
              type="button"
              onClick={() =>
                updateField({
                  target: {
                    name: "addExternal",
                  },
                })
              }
              className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            >

              <Plus size={16} />

              Add

            </button>

          </div>


          {(
            form.externalExaminers?.length
              ? form.externalExaminers
              : [""]
          ).map((examinerId, index) => (

            <div
              key={index}
              className="mb-3 flex gap-2"
            >

              <select
                value={examinerId}
                onChange={(e) =>
                  updateField({
                    target: {
                      name: "externalExaminer",
                      value: e.target.value,
                      index,
                    },
                  })
                }
                className="flex-1 rounded-xl border p-3"
              >

                <option value="">
                  Select External Examiner
                </option>

                {(examiners || []).map(
                  (examiner) => (

                    <option
                      key={
                        examiner.ExaminerID
                      }
                      value={
                        examiner.ExaminerID
                      }
                    >
                      {
                        examiner.ExaminerName
                      }
                    </option>

                  )
                )}

              </select>


              {index > 0 && (

                <button
                  type="button"
                  onClick={() =>
                    updateField({
                      target: {
                        name: "removeExternal",
                        index,
                      },
                    })
                  }
                  className="rounded-lg bg-red-500 p-3 text-white hover:bg-red-600"
                >

                  <Trash2 size={18} />

                </button>

              )}

            </div>

          ))}

        </div>


        {/* ===================================================
            GOOGLE DRIVE DOCUMENTS
        =================================================== */}

        <div className="md:col-span-2">

          <label className="mb-2 block font-medium">
            Thesis & Supporting Documents
          </label>

          <p className="mt-1 text-xs text-gray-500">
            Create a dedicated Google Drive folder for this
            Viva Case. The folder link will be saved automatically.
          </p>


          {/* =================================================
              DRIVE LINK + CREATE FOLDER
          ================================================= */}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            {/* DRIVE LINK */}

            <div className="relative flex-1">

              <Link
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                value={
                  form.driveLink || ""
                }
                readOnly
                placeholder="Google Drive folder will appear here"
                className="w-full rounded-xl border bg-gray-50 p-3 pl-10"
              />

            </div>


            {/* CREATE FOLDER */}

            <button
              type="button"
              onClick={createDriveFolder}
              disabled={!selectedCase?.CaseID}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >

              📁 Create Folder

            </button>

          </div>


          {/* =================================================
              SAVE FIRST MESSAGE
          ================================================= */}

          {!selectedCase?.CaseID && (

            <p className="mt-2 text-xs text-orange-600">
              Please save the Viva Case first before creating
              the Google Drive folder.
            </p>

          )}


          {/* =================================================
              FOLDER CONTENT
          ================================================= */}

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">

            <p className="mb-2 font-medium">
              The folder should contain:
            </p>

            <ul className="list-disc space-y-1 pl-5">

              <li>
                Final Thesis (PDF)
              </li>

              <li>
                Turnitin Similarity Report
              </li>

              <li>
                Ethics Approval (if applicable)
              </li>

              <li>
                Supplementary Documents
              </li>

              <li>
                Examiner's Report
              </li>

              <li>
                Annotated Thesis
              </li>

            </ul>

          </div>


          {/* =================================================
              OPEN / COPY LINK
          ================================================= */}

          {form.driveLink && (

            <div className="mt-4 flex flex-wrap gap-2">

              <a
                href={form.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >

                <ExternalLink size={16} />

                Open Folder

              </a>


              <button
                type="button"
                onClick={async () => {

                  try {

                    await navigator.clipboard.writeText(
                      form.driveLink
                    );

                    alert(
                      "Google Drive link copied."
                    );

                  } catch (err) {

                    console.error(
                      "COPY LINK ERROR:",
                      err
                    );

                    alert(
                      "Unable to copy the link."
                    );

                  }

                }}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
              >

                <Copy size={16} />

                Copy Link

              </button>

            </div>

          )}

        </div>


        {/* ===================================================
            DATE RECEIVED
        =================================================== */}

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
              value={
                form.receivedDate || ""
              }
              onChange={updateField}
              className="w-full rounded-xl border p-3 pl-10"
            />

          </div>

        </div>


        {/* ===================================================
            REPORT DUE DATE
        =================================================== */}

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
              value={
                form.dueDate || ""
              }
              onChange={updateField}
              className="w-full rounded-xl border p-3 pl-10"
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          EMAIL
      ===================================================== */}

      <div className="mt-8">

        <label className="mb-2 block font-medium">
          Email Subject
        </label>

        <input
          type="text"
          name="emailSubject"
          value={
            form.emailSubject || ""
          }
          onChange={updateField}
          className="mb-5 w-full rounded-xl border p-3"
        />

      </div>


      {/* =====================================================
          REMINDER
      ===================================================== */}

      <div className="mt-6 flex items-center gap-3">

        <input
          type="checkbox"
          name="reminder"
          checked={
            form.reminder ?? true
          }
          onChange={updateField}
        />

        <span>
          Enable automatic reminder emails
        </span>

      </div>


      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div className="mt-8 flex flex-wrap gap-3">


        {/* =================================================
            SAVE
        ================================================= */}

        <button
          type="button"
          onClick={saveDraft}
          className="flex items-center gap-2 rounded-xl bg-gray-700 px-6 py-3 text-white hover:bg-gray-800"
        >

          <Save size={18} />

          {selectedCase
            ? "Update Case"
            : "Save Draft"}

        </button>


        {/* =================================================
            APPOINTMENT
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            previewEmailHandler(
              "appointment"
            )
          }
          className="rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
        >

          👁 Preview Appointment

        </button>


        {/* =================================================
            THESIS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            previewEmailHandler(
              "thesis"
            )
          }
          className="rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
        >

          👁 Preview Thesis

        </button>


        {/* =================================================
            REMINDER
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            previewEmailHandler(
              "reminder"
            )
          }
          className="rounded-xl bg-orange-500 px-5 py-3 text-white hover:bg-orange-600"
        >

          👁 Preview Reminder

        </button>


        {/* =================================================
            SCHEDULE
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            previewEmailHandler(
              "schedule"
            )
          }
          className="rounded-xl bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >

          👁 Preview Schedule

        </button>


        {/* =================================================
            THANK YOU
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            previewEmailHandler(
              "thankyou"
            )
          }
          className="rounded-xl bg-slate-600 px-5 py-3 text-white hover:bg-slate-700"
        >

          👁 Preview Thank You

        </button>

      </div>

    </div>
  );
}

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
  selectedStudent,
  form,
  handleStudent,
  updateField,
  saveDraft,
  sendAppointment,
  sendThesis,
  sendReminder,
  sendSchedule,
  sendThankYou,
  previewEmailHandler,
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">

      <div className="mb-6 flex items-center justify-between">

  <div>

    <h2 className="text-2xl font-bold">
      {selectedCase
        ? `Manage Viva Case (${selectedCase.CaseID})`
        : "Create New Viva Case"}
    </h2>

    {selectedCase && (
      <p className="mt-1 text-sm text-gray-500">
        Edit case details, send emails, track reports and schedule the viva.
      </p>
    )}

  </div>

</div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

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
              value={form.studentId}
              onChange={(e) => handleStudent(e.target.value)}
              className="w-full rounded-xl border p-3 pl-10"
            >
              <option value="">
                Select Student
              </option>

              {students.map((student) => (
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

          <textarea
            readOnly
            rows={3}
            value={selectedStudent?.ThesisTitle || ""}
            className="w-full rounded-xl border bg-gray-50 p-3"
          />

        </div>

        {/* Internal Examiners */}

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

  {form.internalExaminers.map((examinerId, index) => (

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

        {examiners.map((examiner) => (
          <option
            key={examiner.ExaminerID}
            value={examiner.ExaminerID}
          >
            {examiner.ExaminerName}
          </option>
        ))}

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

        {/* External Examiners */}

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

  {form.externalExaminers.map((examinerId, index) => (

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

        {examiners.map((examiner) => (
          <option
            key={examiner.ExaminerID}
            value={examiner.ExaminerID}
          >
            {examiner.ExaminerName}
          </option>
        ))}

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

        {/* Documents */}

<div>
  <label className="mb-2 block font-medium">
    Thesis Documents
  </label>

  <p className="mt-1 text-xs text-gray-500">
  Paste the Google Drive folder link shared with the examiners.
</p>

  <div className="relative">
    <Link
      size={18}
      className="absolute left-3 top-3 text-gray-400"
    />

    <input
  type="url"
  name="driveLink"
  value={form.driveLink}
  onChange={updateField}
  placeholder="https://drive.google.com/drive/folders/..."
  required
  className="w-full rounded-xl border p-3 pl-10"
/>
  </div>

  <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
  <p className="font-medium mb-2">
    The folder should contain:
  </p>

  <ul className="list-disc pl-5 space-y-1">
    <li>Final Thesis (PDF)</li>
    <li>Turnitin Similarity Report</li>
    <li>Ethics Approval (if applicable)</li>
    <li>Supplementary Documents</li>
  </ul>
</div>

  {form.driveLink && (
    <div className="mt-3 flex gap-2">
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
  onClick={() => navigator.clipboard.writeText(form.driveLink)}
  className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
>
  <Copy size={16} />
  Copy Link
</button>
    </div>
  )}
</div>

        {/* Date Received */}

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
              className="w-full rounded-xl border p-3 pl-10"
            />

          </div>

        </div>

        {/* Due Date */}

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
              className="w-full rounded-xl border p-3 pl-10"
            />

          </div>

        </div>

                {/* Email */}

      </div>

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


      </div>

      {/* Reminder */}

      <div className="mt-6 flex items-center gap-3">

        <input
          type="checkbox"
          name="reminder"
          checked={form.reminder}
          onChange={updateField}
        />

        <span>
          Enable automatic reminder emails
        </span>

      </div>

      {/* Buttons */}

      {/* Buttons */}

<div className="mt-8 flex flex-wrap gap-3">

  <button
    type="button"
    onClick={saveDraft}
    className="flex items-center gap-2 rounded-xl bg-gray-700 px-6 py-3 text-white hover:bg-gray-800"
  >
    <Save size={18} />
    {selectedCase ? "Update Case" : "Save Draft"}
  </button>

  {/* Appointment */}
  <button
    type="button"
    onClick={() => previewEmailHandler("appointment")}
    className="rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
  >
    👁 Preview Appointment
  </button>

  {/* Thesis */}
  <button
    type="button"
    onClick={() => previewEmailHandler("thesis")}
    className="rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
  >
    👁 Preview Thesis
  </button>


  {/* Reminder */}
  <button
    type="button"
    onClick={() => previewEmailHandler("reminder")}
    className="rounded-xl bg-orange-500 px-5 py-3 text-white hover:bg-orange-600"
  >
    👁 Preview Reminder
  </button>


  {/* Schedule */}
  <button
    type="button"
    onClick={() => previewEmailHandler("schedule")}
    className="rounded-xl bg-green-600 px-5 py-3 text-white hover:bg-green-700"
  >
    👁 Preview Schedule
  </button>


  {/* Thank You */}
  <button
    type="button"
    onClick={() => previewEmailHandler("thankyou")}
    className="rounded-xl bg-slate-600 px-5 py-3 text-white hover:bg-slate-700"
  >
    👁 Preview Thank You
  </button>

</div>
    </div>
  );
}

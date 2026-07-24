import {
  Search,
  Calendar,
  Upload,
  Link,
  Save,
  Send,
  Plus,
  Trash2,
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
  sendToExaminer,
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
              className="w-full rounded-xl border p-3 pl-10"
            />

          </div>

        </div>

        {/* Thesis PDF */}

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
              className="w-full rounded-xl border p-2 pl-10"
            />

          </div>

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
          name="reminder"
          checked={form.reminder}
          onChange={updateField}
        />

        <span>
          Enable automatic reminder emails
        </span>

      </div>

      {/* Buttons */}

      <div className="mt-8 flex flex-col gap-4 md:flex-row">

        <button
          type="button"
          onClick={saveDraft}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-6 py-3 text-white transition hover:bg-gray-800 md:w-auto"
        >
          <Save size={18} />
{selectedCase ? "Update Case" : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={sendToExaminer}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700 md:w-auto"
        >
          <Send size={18} />
{selectedCase ? "Resend Email" : "Send to Examiners"}
        </button>

      </div>

    </div>
  );
}

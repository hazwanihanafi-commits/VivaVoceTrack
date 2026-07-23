import { useEffect, useState } from "react";
import { X } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const emptyStudent = {
  MatricNo: "",
  StudentName: "",
  IC_Passport: "",
  Citizenship: "",
  Programme: "PhD",
  Mode: "Research",
  School: "PKTAAB",
  ResearchArea: "",
  Faculty: "USM",
  Supervisor: "",
  CoSupervisor: "",
  Email: "",
  Phone: "",
  Intake: "",
  ThesisTitle: "",
  GoogleDriveFolder: "",
  Status: "Active",
};

export default function StudentModal({
  open,
  onClose,
  student,
  mode,
  onSaved,
}) {
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) setForm(student);
    else setForm(emptyStudent);
  }, [student]);

  if (!open) return null;

  const readOnly = mode === "view";

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function save() {
    try {
      setSaving(true);

      const url = student
        ? `${API}/students/${student.StudentID}`
        : `${API}/students`;

      const method = student ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message);
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  function Input(label, name, type = "text") {
    return (
      <div>
        <label className="block text-sm mb-1">{label}</label>

        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={change}
          disabled={readOnly}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl">

        <div className="flex justify-between items-center border-b p-5">

          <h2 className="text-xl font-bold">
            {mode === "add"
              ? "Add Student"
              : mode === "edit"
              ? "Edit Student"
              : "Student Details"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 p-6">

          {Input("Matric No","MatricNo")}
          {Input("Student Name","StudentName")}
          {Input("IC / Passport","IC_Passport")}
          {Input("Citizenship","Citizenship")}
          {Input("Programme","Programme")}
          {Input("Mode","Mode")}
          {Input("School","School")}
          {Input("Faculty","Faculty")}
          {Input("Research Area","ResearchArea")}
          {Input("Supervisor","Supervisor")}
          {Input("Co-Supervisor","CoSupervisor")}
          {Input("Email","Email","email")}
          {Input("Phone","Phone")}
          {Input("Intake","Intake")}
          {Input("Status","Status")}

          <div className="col-span-2">

            <label className="block text-sm mb-1">
              Thesis Title
            </label>

            <textarea
              rows={3}
              name="ThesisTitle"
              value={form.ThesisTitle || ""}
              onChange={change}
              disabled={readOnly}
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>

        </div>

        <div className="border-t p-5 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border"
          >
            Close
          </button>

          {!readOnly && (
            <button
              onClick={save}
              disabled={saving}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg"
            >
              {saving ? "Saving..." : "Save Student"}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

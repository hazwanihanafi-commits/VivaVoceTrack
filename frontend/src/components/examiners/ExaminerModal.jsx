import { useEffect, useState } from "react";
import { X } from "lucide-react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com/api";

const emptyExaminer = {
  ExaminerName: "",
  Title: "",
  University: "",
  Faculty: "",
  Department: "",
  Email: "",
  Phone: "",
  Expertise: "",
  ExaminerType: "External",
  Status: "Active",
  Remarks: "",
};

export default function ExaminerModal({
  open,
  onClose,
  examiner,
  mode,
  onSaved,
}) {
  const [form, setForm] = useState(emptyExaminer);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examiner) {
      setForm(examiner);
    } else {
      setForm(emptyExaminer);
    }
  }, [examiner]);

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

      const url = examiner
        ? `${API}/examiners/${examiner.ExaminerID}`
        : `${API}/examiners`;

      const method = examiner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Unable to save examiner.");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save examiner.");
    } finally {
      setSaving(false);
    }
  }

  function Input(label, name, type = "text") {
    return (
      <div>
        <label className="block mb-1 text-sm">{label}</label>

        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={change}
          disabled={readOnly}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b p-5">

          <h2 className="text-xl font-bold">
            {mode === "add"
              ? "Add Examiner"
              : mode === "edit"
              ? "Edit Examiner"
              : "Examiner Details"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 p-6">

          {Input("Examiner Name", "ExaminerName")}
          {Input("Title", "Title")}
          {Input("University", "University")}
          {Input("Faculty", "Faculty")}
          {Input("Department", "Department")}
          {Input("Email", "Email", "email")}
          {Input("Phone", "Phone")}
          {Input("Expertise", "Expertise")}

          <div>
            <label className="block mb-1 text-sm">
              Examiner Type
            </label>

            <select
              name="ExaminerType"
              value={form.ExaminerType || ""}
              onChange={change}
              disabled={readOnly}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm">
              Status
            </label>

            <select
              name="Status"
              value={form.Status || ""}
              onChange={change}
              disabled={readOnly}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="col-span-2">

            <label className="block mb-1 text-sm">
              Remarks
            </label>

            <textarea
              rows={4}
              name="Remarks"
              value={form.Remarks || ""}
              onChange={change}
              disabled={readOnly}
              className="w-full rounded-lg border px-3 py-2"
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 border-t p-5">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Close
          </button>

          {!readOnly && (
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Examiner"}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

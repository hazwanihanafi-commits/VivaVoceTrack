import emailLayout from "./emailLayout.js";

export default function reminderEmail(data = {}) {

  return emailLayout(
    "Reminder: Examiner Report",

    `
<p>
Dear ${data.ExaminerTitle || ""} ${data.ExaminerName || "Examiner"},
</p>

<p>
This is a friendly reminder that the examiner report for the following candidate is due on
<strong>${data.ReportDueDate || "-"}</strong>.
</p>

<p>
<strong>Student:</strong>
${data.StudentName || "-"}
</p>

<p>
<strong>Matric No.:</strong>
${data.MatricNo || "-"}
</p>

<p>
<strong>Programme:</strong>
${data.Programme || "-"}
</p>

<p>
<strong>Thesis:</strong>
${data.ThesisTitle || "-"}
</p>

<p>
Please submit your examiner report before the stated deadline.
</p>

<p>
Thank you for your cooperation.
</p>

<p>
<strong>VivaTrack Secretariat</strong><br>
Universiti Sains Malaysia
</p>
`
  );
}

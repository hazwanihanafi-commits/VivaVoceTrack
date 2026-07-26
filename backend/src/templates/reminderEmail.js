import emailLayout from "./emailLayout.js";

export default function reminderEmail() {
  return emailLayout(
    "Reminder: Examiner Report",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
This is a friendly reminder that the examiner report for the following candidate is due on
<strong>{{ReportDueDate}}</strong>.
</p>

<p><strong>Student:</strong> {{StudentName}}</p>
<p><strong>Thesis:</strong> {{ThesisTitle}}</p>

<p>Thank you for your cooperation.</p>

<p>VivaTrack Secretariat</p>
`
  );
}

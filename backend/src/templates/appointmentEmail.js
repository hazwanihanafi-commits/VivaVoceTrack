import emailLayout from "./emailLayout.js";

export default function appointmentEmail() {
  return emailLayout(
    "Appointment as Examiner",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
Thank you for accepting the appointment as
<strong>{{ExaminerType}}</strong> for the following candidate.
</p>

<p><strong>Student:</strong> {{StudentName}}</p>
<p><strong>Programme:</strong> {{Programme}}</p>
<p><strong>Thesis:</strong> {{ThesisTitle}}</p>

<p>
We sincerely appreciate your contribution to postgraduate education at Universiti Sains Malaysia.
</p>

<p>VivaTrack Secretariat</p>
`
  );
}

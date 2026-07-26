import emailLayout from "./emailLayout.js";

export default function scheduleEmail() {
  return emailLayout(
    "Viva Voce Schedule",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
The Viva Voce examination has been scheduled as follows:
</p>

<ul>
<li><strong>Candidate:</strong> {{StudentName}}</li>
<li><strong>Date:</strong> {{ConfirmedVivaDate}}</li>
<li><strong>Time:</strong> {{VivaTime}}</li>
<li><strong>Venue:</strong> {{Venue}}</li>
</ul>

<p>Thank you.</p>

<p>VivaTrack Secretariat</p>
`
  );
}

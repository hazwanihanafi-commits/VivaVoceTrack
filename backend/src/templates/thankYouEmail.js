import emailLayout from "./emailLayout.js";

export default function thankYouEmail() {
  return emailLayout(
    "Thank You",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
On behalf of Universiti Sains Malaysia, we sincerely thank you for serving as
<strong>{{ExaminerType}}</strong>.
</p>

<p>
Your valuable time and expertise are greatly appreciated.
</p>

<p>Thank you.</p>

<p>VivaTrack Secretariat</p>
`
  );
}

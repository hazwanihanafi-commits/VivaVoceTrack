import emailLayout from "./emailLayout.js";

export default function scheduleEmail() {
  return emailLayout(
    "Viva Voce Schedule Confirmation",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
The Viva Voce examination for the following candidate has been proposed:
</p>

<ul>
  <li><strong>Candidate:</strong> {{StudentName}}</li>
  <li><strong>Date:</strong> {{TentativeVivaDate}}</li>
  <li><strong>Time:</strong> {{VivaTime}}</li>
  <li><strong>Venue:</strong> {{Venue}}</li>
  <li><strong>Mode:</strong> {{VivaMode}}</li>
</ul>

<p>
Kindly confirm your availability for the proposed Viva Voce schedule.
</p>

<p>
<strong>Response Deadline:</strong>
{{ResponseDeadline}}
</p>

<p>
Please select one of the following options:
</p>

<p>
<a
  href="{{PanelResponseLink}}"
  style="
    display:inline-block;
    padding:12px 20px;
    background:#1a73e8;
    color:#ffffff;
    text-decoration:none;
    border-radius:6px;
    font-weight:bold;
  "
>
  Respond to Viva Schedule
</a>
</p>

<p>
You may:
</p>

<ul>
  <li>Accept the proposed date and time.</li>
  <li>Indicate that you are unable to attend.</li>
  <li>Suggest an alternative date and time.</li>
  <li>Provide additional remarks if necessary.</li>
</ul>

<p>
Please submit your response before the stated deadline.
</p>

<p>
Thank you for your cooperation.
</p>

<p>
VivaTrack Secretariat
</p>
`
  );
}

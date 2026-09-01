import emailLayout from "./emailLayout.js";

export default function scheduleEmail() {
  return emailLayout(
    "Viva Voce Schedule Confirmation",
    `
<p>Dear {{ExaminerTitle}} {{ExaminerName}},</p>

<p>
The proposed Viva Voce examination schedule for the candidate below is as follows:
</p>

<ul>
  <li><strong>Candidate:</strong> {{StudentName}}</li>
  <li><strong>Date:</strong> {{TentativeVivaDate}}</li>
  <li><strong>Time:</strong> {{VivaTime}}</li>
  <li><strong>Venue:</strong> {{Venue}}</li>
  <li><strong>Mode:</strong> {{VivaMode}}</li>
  <li>
  <strong>Response Deadline:</strong> {{ResponseDeadline}}
</li>
</ul>

{{MeetingLinkSection}}

<p>
<strong>Your confirmation is required.</strong>
Please click the button below to confirm whether you are available for the proposed Viva schedule.
</p>

<p>
<a
  href="{{PanelResponseLink}}"
  style="
    display:inline-block;
    padding:12px 20px;
    background:#4f46e5;
    color:white;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
  "
>
  Confirm / Respond to Viva Schedule
</a>
</p>

<p>
If you are unable to attend the proposed date and time, you may indicate that you are unavailable and suggest an alternative date and time through the response page.
</p>

<p>Thank you.</p>

<p>
VivaTrack Secretariat
</p>
`
  );
}

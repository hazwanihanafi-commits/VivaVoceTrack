import emailLayout from "./emailLayout.js";

export default function panelResponseReminderEmail(data = {}) {

  return emailLayout(
    "Reminder: Viva Voce Schedule Confirmation",

    `
<p>
Dear ${data.Title || ""} ${data.Name || "Panel Member"},
</p>

<p>
This is a friendly reminder that your response to the Viva Voce schedule
for the following candidate is still pending.
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
<strong>Viva Date:</strong>
${data.VivaDate || "-"}
</p>

<p>
<strong>Viva Time:</strong>
${data.VivaTime || "-"}
</p>

<p>
<strong>Response Deadline:</strong>
${data.ResponseDeadline || "-"}
</p>

<p>
Kindly log in to the VivaTrack system and submit your response
before the stated deadline.
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

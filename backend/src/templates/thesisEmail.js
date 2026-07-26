import emailLayout from "./emailLayout.js";

export default function thesisEmail() {

  const content = `

<p>
Assalamualaikum W.B.T. &amp; Salam Sejahtera,
</p>

<p>
Y.Brs. <strong>{{ExaminerTitle}} {{ExaminerName}}</strong>,
</p>

<p style="text-align:justify;">
Thank you for accepting our invitation to serve as
<strong>{{ExaminerType}}</strong> for the examination of the following postgraduate candidate.
The candidate has now submitted the thesis for examination. The thesis and supporting
documents are available for your review.
</p>

<h3 style="color:#5B2C90;margin-top:30px;">
Candidate Information
</h3>

<table
width="100%"
cellpadding="8"
cellspacing="0"
style="border-collapse:collapse;border:1px solid #d9d9d9;">

<tr style="background:#f5f5f5;">
<td width="35%"><strong>Student Name</strong></td>
<td>{{StudentName}}</td>
</tr>

<tr>
<td><strong>Matric No.</strong></td>
<td>{{MatricNo}}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>Programme</strong></td>
<td>{{Programme}}</td>
</tr>

<tr>
<td><strong>Mode of Study</strong></td>
<td>{{Mode}}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>School / Centre</strong></td>
<td>{{School}}</td>
</tr>

<tr>
<td><strong>Research Area</strong></td>
<td>{{ResearchArea}}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>Supervisor</strong></td>
<td>{{Supervisor}}</td>
</tr>

<tr>
<td><strong>Thesis Title</strong></td>
<td>{{ThesisTitle}}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>Report Due Date</strong></td>
<td>{{ReportDueDate}}</td>
</tr>

</table>

<div style="
margin-top:30px;
padding:18px;
background:#F7F4FC;
border-left:5px solid #5B2C90;
">

<strong>📂 Thesis & Supporting Documents</strong>

<p style="margin-top:10px;">
Please click the button below to access the thesis and supporting documents.
</p>

<p style="text-align:center;margin:25px 0;">

<a
href="{{DriveLink}}"
target="_blank"
rel="noopener noreferrer"
style="
display:inline-block;
background:#5B2C90;
color:#ffffff;
padding:14px 30px;
text-decoration:none;
border-radius:6px;
font-weight:bold;
">

📄 Download Thesis & Supporting Documents

</a>

</p>

</div>

<div style="
margin-top:25px;
padding:15px;
background:#FFF8E8;
border-left:5px solid #F39C12;
">

<strong>Password to Open PDF</strong>

<p>
The password to open the thesis PDF is:
</p>

<p style="
font-size:18px;
font-weight:bold;
color:#5B2C90;
text-align:center;
">

{{ICPassport}}

</p>

<p style="font-size:13px;color:#666;">
Please treat this password as confidential and do not share it with others.
</p>

</div>

<h3 style="color:#5B2C90;margin-top:30px;">
Important Information
</h3>

<ol style="line-height:1.8;">

<li>
Please submit your examiner report on or before
<strong>{{ReportDueDate}}</strong>.
</li>

<li>
All thesis documents are strictly confidential and should not be shared with any third party.
</li>

<li>
Should you experience any difficulty accessing the thesis, kindly contact the VivaTrack Secretariat.
</li>

<li>
If you have already submitted your report, please disregard any reminder emails.
</li>

</ol>

<p style="margin-top:35px;">
We sincerely appreciate your valuable contribution towards maintaining the quality of postgraduate education at Universiti Sains Malaysia.
</p>

<p>
Should you require any assistance regarding the examination process, please contact the VivaTrack Secretariat.
</p>

<p>
Yours sincerely,
</p>

<p>

<strong>VivaTrack Secretariat</strong><br>

Academic & International Division<br>

Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>

Universiti Sains Malaysia

</p>

`;

  return emailLayout(
    "Submission of Thesis for Examination",
    content
  );

}

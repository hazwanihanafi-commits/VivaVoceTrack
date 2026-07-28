import emailLayout from "./emailLayout.js";

export default function thesisEmail() {
  const content = `

<p>
Assalamualaikum W.B.T. &amp; Salam Sejahtera,
</p>

<p>
Y.Brs. <strong>{{ExaminerTitle}} {{ExaminerName}}</strong>,
</p>

<p style="text-align:justify;line-height:1.8;">
Thank you for accepting our invitation to serve as
<strong>{{ExaminerType}}</strong> for the examination of the following postgraduate candidate.
The candidate has now submitted the thesis for examination. The thesis and supporting
documents are now available for your review.
</p>

<h3 style="color:#5B2C90;margin:30px 0 15px;">
Candidate Information
</h3>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
border-collapse:collapse;
border:1px solid #d9d9d9;
font-size:14px;
">

<tr style="background:#f7f7f7;">
<td style="padding:8px 10px;border:1px solid #d9d9d9;width:35%;font-weight:bold;">
Student Name
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{StudentName}}
</td>
</tr>

<tr>
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Matric No.
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{MatricNo}}
</td>
</tr>

<tr style="background:#f7f7f7;">
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Programme
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{Programme}}
</td>
</tr>

<tr>
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Mode of Study
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{Mode}}
</td>
</tr>

<tr style="background:#f7f7f7;">
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
School / Centre
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{School}}
</td>
</tr>

<tr>
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Research Area
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{ResearchArea}}
</td>
</tr>

<tr style="background:#f7f7f7;">
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Supervisor
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{Supervisor}}
</td>
</tr>

<tr>
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Thesis Title
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{ThesisTitle}}
</td>
</tr>

<tr style="background:#f7f7f7;">
<td style="padding:8px 10px;border:1px solid #d9d9d9;font-weight:bold;">
Report Due Date
</td>
<td style="padding:8px 10px;border:1px solid #d9d9d9;">
{{ReportDueDate}}
</td>
</tr>

</table>

<div style="
margin-top:30px;
padding:20px;
background:#F7F4FC;
border-left:6px solid #5B2C90;
">

<h3 style="margin-top:0;color:#5B2C90;">
📂 Thesis & Supporting Documents
</h3>

<p>
Please click the button below to access the thesis and supporting documents.
</p>

<p style="text-align:center;margin:30px 0;">

<a
href="{{DriveLink}}"
target="_blank"
rel="noopener noreferrer"
style="
display:inline-block;
background:#5B2C90;
color:#ffffff;
padding:12px 24px;
border-radius:8px;
font-weight:bold;
text-decoration:none;
font-size:15px;
">

📄 View Thesis & Supporting Documents

</a>

</p>

</div>

<div style="
margin-top:25px;
padding:20px;
background:#FFF8E8;
border-left:6px solid #F39C12;
">

<h3 style="margin-top:0;color:#8A5A00;">
Password to Open PDF
</h3>

<p>
The password to open the thesis PDF is:
</p>

<p style="
font-size:20px;
font-weight:bold;
color:#5B2C90;
text-align:center;
letter-spacing:1px;
margin:20px 0;
">

{{MatricNo}}

</p>

<p style="font-size:13px;color:#666;">
Please treat this password as confidential and do not share it with others.
</p>

</div>

<h3 style="color:#5B2C90;margin-top:35px;">
Important Information
</h3>

<ol style="line-height:1.9;">

<li>
Please download the
<strong>Thesis Examiner's Report</strong>
using the following link:
<br><br>

<a href="{{ExaminerReportLink}}">
{{ExaminerReportLink}}
</a>

</li>

<li>

Kindly acknowledge receipt of the thesis by completing the online acknowledgement form:

<br><br>

<a href="{{AcknowledgementLink}}">
{{AcknowledgementLink}}
</a>

</li>

<li>

Please submit your completed examiner report
on or before
<strong>{{ReportDueDate}}</strong>.

<br><br>

Submission Link:

<br>

<a href="{{ReportSubmissionLink}}">
{{ReportSubmissionLink}}
</a>

</li>

<li>

Please upload the annotated thesis (PDF with comments)
using the following link:

<br><br>

<a href="{{AnnotatedThesisUploadLink}}">
{{AnnotatedThesisUploadLink}}
</a>

</li>

<li>

You are kindly requested to attend the Viva Voce examination when scheduled.
The session may be conducted either in person or via Microsoft Teams.

</li>

<li>

All thesis documents are strictly confidential and should not be shared with any third party.

</li>

</ol>

<p style="margin-top:35px;line-height:1.8;">
We sincerely appreciate your valuable contribution towards maintaining the quality of postgraduate education at Universiti Sains Malaysia.
</p>

<p>
Should you require any assistance regarding the examination process, please contact the Mrs Nur Anis Syamimi (anissyamimi@usm.my), Assistant Registrar, Academic & International Division, PKTAAB.
</p>

<p>
Yours sincerely,
</p>

<p>

<strong>Academic & International Division</strong><br>

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

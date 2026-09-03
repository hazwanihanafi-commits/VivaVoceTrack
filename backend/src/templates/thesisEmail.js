import emailLayout from "./emailLayout.js";

export default function thesisEmail() {
  const content = `

<p>
Assalamualaikum W.B.T. &amp; Salam Sejahtera,
</p>

<p>
Y.Brs. <strong>{{ExaminerTitle}} {{ExaminerName}}</strong>,
</p>

<p style="line-height:1.8;text-align:justify;">
Thank you for accepting our invitation to serve as
<strong>{{ExaminerType}}</strong> for the examination of the following postgraduate candidate.
</p>

<h3 style="color:#5B2C90;">
Candidate Information
</h3>

<table
width="100%"
cellpadding="8"
cellspacing="0"
style="border-collapse:collapse;border:1px solid #ddd;font-size:14px;"
>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
Student Name
</td>
<td style="border:1px solid #ddd;">
{{StudentName}}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
Matric No.
</td>
<td style="border:1px solid #ddd;">
{{MatricNo}}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
Programme
</td>
<td style="border:1px solid #ddd;">
{{Programme}}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
School / Centre
</td>
<td style="border:1px solid #ddd;">
{{School}}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
Thesis Title
</td>
<td style="border:1px solid #ddd;">
{{ThesisTitle}}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd;font-weight:bold;">
Report Due Date
</td>
<td style="border:1px solid #ddd;">
{{ReportDueDate}}
</td>
</tr>

</table>


<!-- =====================================================
     THESIS & SUPPORTING DOCUMENTS
====================================================== -->

<div style="
margin-top:25px;
padding:20px;
background:#F7F4FC;
border-left:5px solid #5B2C90;
">

<h3 style="color:#5B2C90;margin-top:0;">
📂 Thesis &amp; Supporting Documents
</h3>

<p style="line-height:1.8;">
The thesis and supporting documents are available in the folder below.
</p>

<p style="text-align:center;margin:25px 0;">

<a
href="{{DriveLink}}"
target="_blank"
style="
display:inline-block;
background:#5B2C90;
color:white;
padding:12px 24px;
border-radius:7px;
font-weight:bold;
text-decoration:none;
">

📄 View Thesis &amp; Supporting Documents

</a>

</p>

<p style="font-size:13px;color:#666;">
The password to open the thesis PDF is your matric number:
<strong>{{MatricNo}}</strong>
</p>

</div>


<!-- =====================================================
     IMPORTANT INFORMATION
====================================================== -->

<h3 style="color:#5B2C90;margin-top:30px;">
Important Information
</h3>

<ol style="line-height:1.8;">

<li>

Please complete the
<strong>Acknowledgement of Receipt</strong>
using the link below.

<br><br>

<a
href="{{AcknowledgementLink}}"
target="_blank"
style="
color:#5B2C90;
font-weight:bold;
">

Complete Acknowledgement of Receipt

</a>

</li>


<li style="margin-top:15px;">

Please complete and submit the
<strong>Thesis Examiner's Report</strong>
by
<strong>{{ReportDueDate}}</strong>.

</li>


<li style="margin-top:15px;">

The examiner report template is available here:

<br><br>

<a
href="{{ExaminerReportLink}}"
target="_blank"
style="
color:#5B2C90;
font-weight:bold;
">

📄 Download Examiner's Report Template

</a>

</li>


<!-- =====================================================
     REPORT SUBMISSION
====================================================== -->

<li style="margin-top:20px;">

Please complete and submit your
<strong>Thesis Examiner's Report</strong>
using the secure submission link below.

<br><br>

<div style="
padding:20px;
background:#F7F4FC;
border:1px solid #E0D8ED;
border-radius:8px;
">

<p style="margin-top:0;line-height:1.7;">

Your report will be securely associated with this Viva case
and your examiner ID.

</p>

<p style="text-align:center;margin:20px 0;">

<a
href="{{ReportSubmissionLink}}"
target="_blank"
style="
display:inline-block;
background:#5B2C90;
color:white;
padding:12px 24px;
border-radius:7px;
font-weight:bold;
text-decoration:none;
">

📤 Submit Examiner's Report

</a>

</p>

<p style="
font-size:12px;
color:#777;
margin-bottom:0;
text-align:center;
">

This submission link is unique to you and this Viva case.

</p>

</div>

</li>


<!-- =====================================================
     ANNOTATED THESIS
====================================================== -->

<li style="margin-top:20px;">

Please upload your
<strong>Annotated Thesis</strong>
using the secure submission link below.

<br><br>

<p style="text-align:center;margin:20px 0;">

<a
href="{{AnnotatedThesisUploadLink}}"
target="_blank"
style="
display:inline-block;
background:#5B2C90;
color:white;
padding:12px 24px;
border-radius:7px;
font-weight:bold;
text-decoration:none;
">

📎 Upload Annotated Thesis

</a>

</p>

<p style="
font-size:12px;
color:#777;
text-align:center;
">

This submission link is unique to you and this Viva case.

</p>

</li>


<li style="margin-top:15px;">

All thesis documents are strictly confidential and should not be
shared with any third party.

</li>

</ol>


<p style="margin-top:30px;line-height:1.8;">

We sincerely appreciate your valuable contribution towards maintaining
the quality of postgraduate education at Universiti Sains Malaysia.

</p>


<p style="line-height:1.8;">

Should you require any assistance, please contact
Mrs Nur Anis Syamimi
(<a href="mailto:anissyamimi@usm.my">
anissyamimi@usm.my
</a>),
Assistant Registrar, Academic &amp; International Division, PKTAAB.

</p>


<p>
Yours sincerely,
</p>

<p>

<strong>Academic &amp; International Division</strong><br>
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>
Universiti Sains Malaysia

</p>


<p style="
margin-top:30px;
padding-top:15px;
border-top:1px solid #eee;
font-size:12px;
color:#777;
text-align:center;
">

This is an automatically generated email from
<strong>VivaTrack</strong>.

</p>

`;

  return emailLayout(
    "Submission of Thesis for Examination",
    content
  );
}

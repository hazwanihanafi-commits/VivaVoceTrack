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


<!-- =====================================================
     THESIS & SUPPORTING DOCUMENTS
===================================================== -->

<div style="
margin-top:30px;
padding:20px;
background:#F7F4FC;
border-left:6px solid #5B2C90;
">

<h3 style="margin-top:0;color:#5B2C90;">
📂 Thesis &amp; Supporting Documents
</h3>

<p style="line-height:1.8;">
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

📄 View Thesis &amp; Supporting Documents

</a>

</p>

</div>


<!-- =====================================================
     PASSWORD
===================================================== -->

<div style="
margin-top:25px;
padding:20px;
background:#FFF8E8;
border-left:6px solid #F39C12;
">

<h3 style="margin-top:0;color:#8A5A00;">
🔐 Password to Open PDF
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


<!-- =====================================================
     IMPORTANT INFORMATION
===================================================== -->

<h3 style="color:#5B2C90;margin-top:35px;">
Important Information
</h3>

<ol style="line-height:1.9;">

<!-- 1. EXAMINER REPORT -->

<li>

<strong>Thesis Examiner's Report</strong>

<br><br>

Please download the
<strong>Thesis Examiner's Report</strong>
using the following link:

<br><br>

<a
href="{{ExaminerReportLink}}"
target="_blank"
rel="noopener noreferrer"
style="
color:#5B2C90;
font-weight:bold;
">

Download Thesis Examiner's Report

</a>

</li>


<!-- 2. ACKNOWLEDGEMENT -->

<li style="margin-top:15px;">

<strong>Acknowledgement of Receipt</strong>

<br><br>

Kindly acknowledge receipt of the thesis by completing the online acknowledgement form:

<br><br>

<a
href="{{AcknowledgementLink}}"
target="_blank"
rel="noopener noreferrer"
style="
color:#5B2C90;
font-weight:bold;
">

Complete Acknowledgement Form

</a>

</li>


<!-- 3. REPORT SUBMISSION -->

<li style="margin-top:15px;">

<strong>Submission of Examiner's Report</strong>

<br><br>

Please submit your completed examiner report
on or before
<strong>{{ReportDueDate}}</strong>.

<br><br>

<div style="
margin:20px 0;
padding:20px;
background:#F3F8FF;
border:1px solid #C7D9F2;
border-radius:8px;
">

<p style="
margin-top:0;
font-weight:bold;
color:#1E4E79;
">

📤 Submit Your Examiner's Report

</p>

<p style="line-height:1.7;">
Please click the button below to upload your completed
Thesis Examiner's Report.
</p>

<p style="text-align:center;margin:25px 0;">

<a
href="{{ReportSubmissionLink}}"
target="_blank"
rel="noopener noreferrer"
style="
display:inline-block;
background:#1E4E79;
color:#ffffff;
padding:13px 26px;
border-radius:8px;
font-weight:bold;
text-decoration:none;
font-size:15px;
">

📤 Upload Examiner's Report

</a>

</p>

<p style="
font-size:12px;
color:#666;
margin-bottom:0;
">

Please ensure that the report is submitted before
<strong>{{ReportDueDate}}</strong>.

</p>

</div>

</li>


<!-- 4. ANNOTATED THESIS -->

<li style="margin-top:15px;">

<strong>Annotated Thesis</strong>

<br><br>

Please upload the annotated thesis
<strong>(PDF with comments)</strong>
using the following link:

<br><br>

<div style="
margin:20px 0;
padding:20px;
background:#F7F4FC;
border:1px solid #D8C9EA;
border-radius:8px;
">

<p style="
margin-top:0;
font-weight:bold;
color:#5B2C90;
">

📝 Upload Annotated Thesis

</p>

<p style="line-height:1.7;">
Please upload the thesis PDF containing your comments and annotations.
</p>

<p style="text-align:center;margin:25px 0;">

<a
href="{{AnnotatedThesisUploadLink}}"
target="_blank"
rel="noopener noreferrer"
style="
display:inline-block;
background:#5B2C90;
color:#ffffff;
padding:13px 26px;
border-radius:8px;
font-weight:bold;
text-decoration:none;
font-size:15px;
">

📝 Upload Annotated Thesis

</a>

</p>

</div>

</li>


<!-- 5. VIVA -->

<li style="margin-top:15px;">

You are kindly requested to attend the
<strong>Viva Voce examination</strong>
when scheduled.

The session may be conducted either in person
or via Microsoft Teams.

</li>


<!-- 6. CONFIDENTIALITY -->

<li style="margin-top:15px;">

All thesis documents are strictly confidential
and should not be shared with any third party.

</li>

</ol>


<!-- =====================================================
     CLOSING
===================================================== -->

<p style="margin-top:35px;line-height:1.8;">

We sincerely appreciate your valuable contribution
towards maintaining the quality of postgraduate education
at Universiti Sains Malaysia.

</p>


<p style="line-height:1.8;">

Should you require any assistance regarding the examination
process, please contact Mrs Nur Anis Syamimi
(<a href="mailto:anissyamimi@usm.my">
anissyamimi@usm.my
</a>),
Assistant Registrar, Academic &amp; International Division,
PKTAAB.

</p>


<p>
Yours sincerely,
</p>


<p>

<strong>Academic &amp; International Division</strong><br>

Academic &amp; International Division<br>

Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>

Universiti Sains Malaysia

</p>


<p style="
margin-top:35px;
padding-top:15px;
border-top:1px solid #eeeeee;
font-size:12px;
color:#777;
text-align:center;
line-height:1.6;
">

This is an automatically generated email from
<strong>VivaTrack</strong>.

<br>

Academic &amp; International Division

</p>

`;

  return emailLayout(
    "Submission of Thesis for Examination",
    content
  );
}

export default function emailLayout(title, content) {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>

<body style="
margin:0;
padding:30px 15px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
color:#333;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:760px;
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 4px 15px rgba(0,0,0,.08);
">

<!-- Header -->
<tr>
<td
style="
background:#5B2C90;
padding:35px;
text-align:center;
color:#ffffff;
">

<h1 style="
margin:0;
font-size:34px;
font-weight:bold;
">
Universiti Sains Malaysia
</h1>

<p style="
margin:12px 0 0;
font-size:18px;
">
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)
</p>

<p style="
margin:4px 0 0;
font-size:15px;
opacity:.95;
">
Academic & International Division
</p>

</td>
</tr>

<!-- Title -->
<tr>
<td
style="
padding:35px 40px 20px;
text-align:center;
">

<h2 style="
margin:0;
font-size:34px;
color:#5B2C90;
">
${title}
</h2>

</td>
</tr>

<!-- Content -->
<tr>
<td
style="
padding:0 40px 35px;
font-size:17px;
line-height:1.9;
">

${content}

</td>
</tr>

<!-- Footer -->
<tr>
<td
style="
background:#f7f7f7;
border-top:1px solid #ddd;
padding:30px;
text-align:center;
">

<p style="
margin:0;
font-size:14px;
color:#666;
">

This is an automatically generated email from
<strong>VivaTrack</strong>.

</p>

<p style="
margin:12px 0;
font-size:15px;
line-height:1.8;
color:#2E7D32;
">

Academic & International Division<br>
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>
Universiti Sains Malaysia

</p>

<p style="
margin-top:18px;
font-size:13px;
color:#888;
">

© ${year} VivaTrack • Universiti Sains Malaysia

</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

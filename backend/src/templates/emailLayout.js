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
padding:0;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:30px 0;">

<tr>

<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:720px;
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 2px 10px rgba(0,0,0,.08);
">

<tr>

<td
style="
background:#5B2C90;
padding:30px;
text-align:center;
color:#ffffff;
">

<h2 style="margin:0;">
Universiti Sains Malaysia
</h2>

<p style="margin-top:10px;font-size:15px;line-height:1.6;">
Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>
Academic & International Division
</p>

</td>

</tr>

<tr>

<td style="padding:30px 35px 10px 35px;">

<h2 style="
margin:0;
color:#5B2C90;
text-align:center;
">
${title}
</h2>

</td>

</tr>

<tr>

<td
style="
padding:10px 35px 35px 35px;
font-size:15px;
line-height:1.8;
color:#333333;
">

${content}

</td>

</tr>

<tr>

<td
style="
background:#eeeeee;
padding:20px;
text-align:center;
font-size:12px;
color:#666666;
">

© ${year} VivaTrack<br>

Academic & International Division<br>

Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB)<br>

Universiti Sains Malaysia

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

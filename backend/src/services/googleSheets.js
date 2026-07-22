import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

/************************************************
 * Read Headers
 ************************************************/
export async function getHeaders(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });

  return res.data.values?.[0] || [];
}

/************************************************
 * Read All Rows
 ************************************************/
export async function getRows(sheetName) {
  const headers = await getHeaders(sheetName);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2:ZZ`,
  });

  const rows = res.data.values || [];

  return rows.map((row) => {
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });

    return obj;
  });
}

/************************************************
 * Find Row
 ************************************************/
export async function findRow(sheetName, column, value) {
  const rows = await getRows(sheetName);

  return rows.find((r) => r[column] == value);
}

/************************************************
 * Find Rows
 ************************************************/
export async function findRows(sheetName, column, value) {
  const rows = await getRows(sheetName);

  return rows.filter((r) => r[column] == value);
}

/************************************************
 * Find Row Number
 ************************************************/
export async function findRowNumber(sheetName, column, value) {
  const rows = await getRows(sheetName);

  const index = rows.findIndex((r) => r[column] == value);

  return index >= 0 ? index + 2 : -1;
}

/************************************************
 * Total Rows
 ************************************************/
export async function totalRows(sheetName) {
  const rows = await getRows(sheetName);

  return rows.length;
}

/************************************************
 * Add Row
 ************************************************/
export async function addRow(sheetName, data) {
  const headers = await getHeaders(sheetName);

  const values = headers.map((h) => data[h] ?? "");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  return true;
}

/************************************************
 * Update Row
 ************************************************/
export async function updateRow(sheetName, rowNumber, data) {
  const headers = await getHeaders(sheetName);

  const values = headers.map((h) => data[h] ?? "");

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  return true;
}

/************************************************
 * Delete Row
 ************************************************/
export async function deleteRow(sheetName, rowNumber) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === sheetName
  );

  if (!sheet) throw new Error("Sheet not found.");

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  return true;
}

/************************************************
 * Generate ID
 ************************************************/
export async function generateID(prefix, sheetName, idColumn) {
  const rows = await getRows(sheetName);

  let max = 0;

  rows.forEach((r) => {
    const id = r[idColumn];

    if (id && id.startsWith(prefix)) {
      const num = parseInt(id.replace(prefix, ""));

      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  });

  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

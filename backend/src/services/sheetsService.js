import { sheets } from "../config/google.js";
import { SPREADSHEET_ID } from "../config/sheets.js";

/**
 * Read all rows
 */
export async function getRows(sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
  });

  const values = response.data.values || [];

  if (values.length === 0) return [];

  const headers = values[0];

  return values.slice(1).map((row) => {
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });

    return obj;
  });
}

/**
 * Read header row
 */
export async function getHeaders(sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });

  return response.data.values?.[0] || [];
}

/**
 * Append new row
 */
export async function addRow(sheetName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });

  return true;
}

/**
 * Find first row
 */
export async function findRow(sheetName, columnName, value) {
  const rows = await getRows(sheetName);

  return (
    rows.find(
      (row) =>
        String(row[columnName]).trim() === String(value).trim()
    ) || null
  );
}

/**
 * Find multiple rows
 */
export async function findRows(sheetName, columnName, value) {
  const rows = await getRows(sheetName);

  return rows.filter((row) =>
    String(row[columnName] || "")
      .toLowerCase()
      .includes(String(value).toLowerCase())
  );
}

/**
 * Find spreadsheet row number
 */
export async function findRowNumber(sheetName, columnName, value) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
  });

  const values = response.data.values || [];

  if (values.length === 0) return -1;

  const headers = values[0];
  const columnIndex = headers.indexOf(columnName);

  if (columnIndex === -1) return -1;

  for (let i = 1; i < values.length; i++) {
    if ((values[i][columnIndex] || "") === String(value)) {
      return i + 1;
    }
  }

  return -1;
}

/**
 * Update row
 */
export async function updateRow(sheetName, rowNumber, data) {
  const headers = await getHeaders(sheetName);

  const values = headers.map((header) => data[header] ?? "");

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

/**
 * Get Google Sheet numeric ID
 */
export async function getSheetId(sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === sheetName
  );

  if (!sheet) {
    throw new Error(`Sheet '${sheetName}' not found.`);
  }

  return sheet.properties.sheetId;
}

/**
 * Delete row
 */
export async function deleteRow(sheetName, rowNumber) {
  const sheetId = await getSheetId(sheetName);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
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

/**
 * Total rows
 */
export async function totalRows(sheetName) {
  const rows = await getRows(sheetName);
  return rows.length;
}

/**
 * Generate next ID
 * Example:
 * ST0001
 * EX0001
 * VC0001
 */
export async function generateID(prefix, sheetName, idColumn) {
  const rows = await getRows(sheetName);

  let max = 0;

  rows.forEach((row) => {
    const id = row[idColumn] || "";

    if (id.startsWith(prefix)) {
      const num = parseInt(id.replace(prefix, ""), 10);

      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  });

  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

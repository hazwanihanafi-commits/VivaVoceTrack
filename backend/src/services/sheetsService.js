import { sheets } from "../config/google.js";
import { SPREADSHEET_ID } from "../config/sheets.js";

/**
 * Read a worksheet and return JSON objects.
 */
export async function getRows(sheetName) {
  try {
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

  } catch (error) {
    console.error(`Error reading ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Append one row.
 */
export async function addRow(sheetName, values) {
  try {

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });

    return true;

  } catch (error) {

    console.error(error);

    throw error;

  }
}

/**
 * Find one record by column value.
 */
export async function findRow(sheetName, columnName, value) {

  const rows = await getRows(sheetName);

  return rows.find(r => r[columnName] === value) || null;

}

/**
 * Get row number from ID.
 */
export async function findRowNumber(sheetName, idColumn, idValue) {

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
  });

  const values = response.data.values || [];

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] === idValue) {

      return i + 1;

    }

  }

  return -1;

}

/**
 * Update a complete row.
 */
export async function updateRow(sheetName, rowNumber, values) {

  await sheets.spreadsheets.values.update({

    spreadsheetId: SPREADSHEET_ID,

    range: `${sheetName}!A${rowNumber}`,

    valueInputOption: "USER_ENTERED",

    requestBody: {

      values: [values]

    }

  });

  return true;

}

/**
 * Return total rows.
 */
export async function totalRows(sheetName){

    const rows = await getRows(sheetName);

    return rows.length;

}

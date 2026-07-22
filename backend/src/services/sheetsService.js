import { sheets } from "../config/google.js";
import { SPREADSHEET_ID } from "../config/sheets.js";

/**
 * Read all rows from a worksheet
 * Returns an array of JSON objects
 */
export async function getRows(sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const values = response.data.values || [];

    console.log("===== RAW SHEET =====");
console.log(JSON.stringify(values, null, 2));
console.log("=====================");

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
    console.error(`❌ Error reading ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Read only the header row
 */
export async function getHeaders(sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });

    return response.data.values?.[0] || [];
  } catch (error) {
    console.error(`❌ Error getting headers from ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Append one row
 */
export async function addRow(sheetName, values) {
  try {
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
  } catch (error) {
    console.error(`❌ Error adding row:`, error.message);
    throw error;
  }
}

/**
 * Find first row matching a column value
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
 * Get spreadsheet row number
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
    if ((values[i][columnIndex] || "") === value) {
      return i + 1;
    }
  }

  return -1;
}

/**
 * Update an existing row
 */
export async function updateRow(sheetName, rowNumber, values) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });

    return true;
  } catch (error) {
    console.error(`❌ Error updating row:`, error.message);
    throw error;
  }
}

/**
 * Delete a row
 * sheetId is the numeric Google Sheet ID (gid), not the sheet name.
 */
export async function deleteRow(sheetId, rowIndex) {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error(`❌ Error deleting row:`, error.message);
    throw error;
  }
}

/**
 * Count total records
 */
export async function totalRows(sheetName) {
  const rows = await getRows(sheetName);
  return rows.length;
}

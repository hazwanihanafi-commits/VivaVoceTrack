import { sheets } from "../config/google.js";
import { SPREADSHEET_ID } from "../config/sheets.js";

/**
 * ======================================================
 * READ ALL ROWS
 * ======================================================
 */
export async function getRows(sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
  });

  const values = response.data.values || [];

  if (values.length === 0) {
    return [];
  }

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
 * ======================================================
 * READ HEADER ROW
 * ======================================================
 */
export async function getHeaders(sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });

  return response.data.values?.[0] || [];
}


/**
 * ======================================================
 * APPEND NEW ROW
 * ======================================================
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
 * ======================================================
 * FIND FIRST ROW
 * ======================================================
 */
export async function findRow(
  sheetName,
  columnName,
  value
) {
  const rows = await getRows(sheetName);

  const target = String(value ?? "")
    .trim()
    .toLowerCase();

  return (
    rows.find((row) => {
      const current = String(
        row[columnName] ?? ""
      )
        .trim()
        .toLowerCase();

      return current === target;
    }) || null
  );
}


/**
 * ======================================================
 * FIND MULTIPLE ROWS
 * ======================================================
 */
export async function findRows(
  sheetName,
  columnName,
  value
) {
  const rows = await getRows(sheetName);

  const target = String(value ?? "")
    .trim()
    .toLowerCase();

  return rows.filter((row) =>
    String(row[columnName] ?? "")
      .trim()
      .toLowerCase()
      .includes(target)
  );
}


/**
 * ======================================================
 * FIND GOOGLE SHEET ROW NUMBER
 *
 * Header = row 1
 * First data row = row 2
 * ======================================================
 */
export async function findRowNumber(
  sheetName,
  columnName,
  value
) {
  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

  const values =
    response.data.values || [];

  if (values.length === 0) {
    return -1;
  }

  const headers = values[0];

  const columnIndex =
    headers.indexOf(columnName);

  if (columnIndex === -1) {
    return -1;
  }

  const target = String(value ?? "")
    .trim()
    .toLowerCase();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    const current =
      String(
        values[i][columnIndex] ?? ""
      )
        .trim()
        .toLowerCase();

    if (current === target) {
      return i + 1;
    }
  }

  return -1;
}


/**
 * ======================================================
 * UPDATE ROW
 *
 * IMPORTANT:
 * This version PRESERVES existing values.
 *
 * Only fields supplied in `data` are changed.
 * ======================================================
 */
export async function updateRow(
  sheetName,
  rowNumber,
  data
) {
  if (!rowNumber || rowNumber < 2) {
    throw new Error(
      "Invalid spreadsheet row number."
    );
  }

  /**
   * Get existing row
   */
  const existingResponse =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${rowNumber}:${rowNumber}`,
    });

  const existingValues =
    existingResponse.data.values?.[0] || [];

  /**
   * Get headers
   */
  const headers =
    await getHeaders(sheetName);

  if (headers.length === 0) {
    throw new Error(
      `No headers found in sheet '${sheetName}'.`
    );
  }

  /**
   * Build updated row
   */
  const values = headers.map(
    (header, index) => {
      /**
       * If data contains this field,
       * use new value.
       */
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          header
        )
      ) {
        return data[header] ?? "";
      }

      /**
       * Otherwise preserve existing value.
       */
      return existingValues[index] ?? "";
    }
  );

  /**
   * Save row
   */
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
 * ======================================================
 * GET GOOGLE SHEET NUMERIC ID
 * ======================================================
 */
export async function getSheetId(
  sheetName
) {
  const spreadsheet =
    await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

  const sheet =
    spreadsheet.data.sheets.find(
      (s) =>
        s.properties.title ===
        sheetName
    );

  if (!sheet) {
    throw new Error(
      `Sheet '${sheetName}' not found.`
    );
  }

  return sheet.properties.sheetId;
}


/**
 * ======================================================
 * DELETE ROW
 * ======================================================
 */
export async function deleteRow(
  sheetName,
  rowNumber
) {
  const sheetId =
    await getSheetId(sheetName);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,

    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,

              dimension: "ROWS",

              startIndex:
                rowNumber - 1,

              endIndex:
                rowNumber,
            },
          },
        },
      ],
    },
  });

  return true;
}


/**
 * ======================================================
 * TOTAL ROWS
 * ======================================================
 */
export async function totalRows(
  sheetName
) {
  const rows =
    await getRows(sheetName);

  return rows.length;
}


/**
 * ======================================================
 * GENERATE NEXT ID
 *
 * Example:
 * ST001
 * EX001
 * VC001
 * VP001
 * ======================================================
 */
export async function generateID(
  prefix,
  sheetName,
  idColumn
) {
  const rows =
    await getRows(sheetName);

  let max = 0;

  rows.forEach((row) => {
    const id =
      String(row[idColumn] || "")
        .trim();

    if (
      id.toUpperCase()
        .startsWith(
          prefix.toUpperCase()
        )
    ) {
      const number =
        parseInt(
          id.substring(
            prefix.length
          ),
          10
        );

      if (
        !isNaN(number) &&
        number > max
      ) {
        max = number;
      }
    }
  });

  return `${prefix}${String(
    max + 1
  ).padStart(3, "0")}`;
}

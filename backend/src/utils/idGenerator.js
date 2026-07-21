import { getRows } from "../services/sheetsService.js";

/**
 * Generate next ID
 * Example:
 * ST001
 * VV001
 * EX001
 * RP001
 */

export async function generateID(sheetName, prefix, idColumn) {
  const rows = await getRows(sheetName);

  // No data yet
  if (rows.length === 0) {
    return `${prefix}001`;
  }

  let maxNumber = 0;

  rows.forEach((row) => {
    const id = row[idColumn];

    if (!id) return;

    const number = parseInt(id.replace(prefix, ""), 10);

    if (!isNaN(number) && number > maxNumber) {
      maxNumber = number;
    }
  });

  const nextNumber = maxNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

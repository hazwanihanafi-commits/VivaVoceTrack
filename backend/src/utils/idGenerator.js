import { getRows } from "../services/sheetsService.js";

export async function generateID(prefix, sheetName, idColumn) {
  const rows = await getRows(sheetName);

  if (rows.length === 0) {
    return `${prefix}001`;
  }

  let maxNumber = 0;

  rows.forEach((row) => {
    const id = row[idColumn] || "";

    if (!id.startsWith(prefix)) return;

    const number = parseInt(id.replace(prefix, ""), 10);

    if (!isNaN(number) && number > maxNumber) {
      maxNumber = number;
    }
  });

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

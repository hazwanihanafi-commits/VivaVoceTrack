import { getRows } from "../services/sheetsService.js";

export async function getDashboard(req, res) {

  const students = await getRows("Students");

  const totalStudents = students.length;

  const phd = students.filter(s => s.Programme === "PhD").length;

  const msc = students.filter(s => s.Programme === "MSc").length;

  const completed = students.filter(
    s => s.Status === "Completed"
  ).length;

  const pending = students.filter(
    s => s.Status === "Pending"
  ).length;

  res.json({
    success: true,
    data: {
      totalStudents,
      phd,
      msc,
      completed,
      pending
    }
  });

}

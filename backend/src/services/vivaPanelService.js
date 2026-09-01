import {
  getRows,
  addRow,
  generateID,
} from "./sheetsService.js";

const STUDENTS_SHEET = "Students";
const STAFF_SHEET = "Staff";
const PANEL_SHEET = "Panel";

/**
 * ============================================================
 * NORMALISE NAME
 * Used to compare names safely.
 * ============================================================
 */
function normaliseName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * ============================================================
 * CREATE VIVA PANEL
 *
 * Automatically builds the Viva panel from:
 *
 * Students
 * Staff
 * VivaCases
 * Examiners
 *
 * No need to store supervisor IDs in VivaCases.
 * ============================================================
 */
export async function createVivaPanel(caseData) {

  if (!caseData?.CaseID) {
    throw new Error("CaseID is required to create Viva Panel.");
  }

  if (!caseData?.StudentID) {
    throw new Error("StudentID is required to create Viva Panel.");
  }

  const members = [];

  /**
   * ----------------------------------------------------------
   * ADD MEMBER
   * ----------------------------------------------------------
   */
  function addMember(
    PersonID,
    PersonType,
    Role,
    Required = "Yes"
  ) {

    if (!PersonID) return;

    const cleanID = String(PersonID).trim();

    if (!cleanID) return;

    /**
     * Prevent duplicate person + role
     */
    const duplicate = members.find(
      (member) =>
        member.PersonID === cleanID &&
        member.Role === Role
    );

    if (duplicate) return;

    members.push({
      VivaID: caseData.CaseID,
      PersonID: cleanID,
      PersonType,
      Role,
      Required,
    });
  }

  /**
   * ==========================================================
   * 1. STUDENT
   * ==========================================================
   */

  addMember(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );

  /**
   * ==========================================================
   * 2. CHAIRPERSON
   *
   * Taken directly from VivaCases.ChairpersonID
   *
   * Example:
   * ChairpersonID = STF001
   * ==========================================================
   */

  addMember(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );

  /**
   * ==========================================================
   * 3. SECRETARY
   *
   * Taken directly from VivaCases.SecretaryID
   * ==========================================================
   */

  addMember(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );

  /**
   * ==========================================================
   * 4. FIND STUDENT
   * ==========================================================
   */

  const students = await getRows(STUDENTS_SHEET);

  const student = students.find(
    (row) =>
      String(row.StudentID || "").trim() ===
      String(caseData.StudentID || "").trim()
  );

  if (!student) {
    throw new Error(
      `Student '${caseData.StudentID}' not found in Students sheet.`
    );
  }

  /**
   * ==========================================================
   * 5. LOAD STAFF
   * ==========================================================
   */

  const staff = await getRows(STAFF_SHEET);

  /**
   * Create name → StaffID lookup
   */
  const staffMap = new Map();

  staff.forEach((person) => {

    const name = normaliseName(person.StaffName);

    if (!name) return;

    staffMap.set(
      name,
      String(person.StaffID || "").trim()
    );

  });

  /**
   * ==========================================================
   * 6. MAIN SUPERVISOR
   *
   * Students.Supervisor contains the NAME.
   *
   * We convert:
   *
   * Supervisor Name
   *        ↓
   * Staff.StaffName
   *        ↓
   * StaffID
   * ==========================================================
   */

  const supervisorName =
    String(student.Supervisor || "").trim();

  if (supervisorName) {

    const supervisorID =
      staffMap.get(
        normaliseName(supervisorName)
      );

    if (supervisorID) {

      addMember(
        supervisorID,
        "Staff",
        "Main Supervisor",
        "Yes"
      );

    } else {

      console.warn(
        `Supervisor not found in Staff sheet: ${supervisorName}`
      );

    }
  }

  /**
   * ==========================================================
   * 7. CO-SUPERVISOR
   *
   * Supports multiple names:
   *
   * "Person A, Person B"
   *
   * Each person becomes a separate Panel row.
   * ==========================================================
   */

  const coSupervisorValue =
    String(student.CoSupervisor || "").trim();

  if (coSupervisorValue) {

    const coSupervisorNames =
      coSupervisorValue
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

    for (const name of coSupervisorNames) {

      const coSupervisorID =
        staffMap.get(
          normaliseName(name)
        );

      if (coSupervisorID) {

        addMember(
          coSupervisorID,
          "Staff",
          "Co-Supervisor",
          "Yes"
        );

      } else {

        console.warn(
          `Co-Supervisor not found in Staff sheet: ${name}`
        );

      }
    }
  }

  /**
   * ==========================================================
   * 8. INTERNAL EXAMINER 1
   * ==========================================================
   */

  addMember(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );

  /**
   * ==========================================================
   * 9. INTERNAL EXAMINER 2
   * ==========================================================
   */

  addMember(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );

  /**
   * ==========================================================
   * 10. EXTERNAL EXAMINER 1
   *
   * Optional
   * ==========================================================
   */

  addMember(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );

  /**
   * ==========================================================
   * 11. EXTERNAL EXAMINER 2
   *
   * Optional
   * ==========================================================
   */

  addMember(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );

  /**
   * ==========================================================
   * 12. LOAD EXISTING PANEL
   *
   * Prevent duplicate records.
   * ==========================================================
   */

  const existing =
    await getRows(PANEL_SHEET);

  /**
   * ==========================================================
   * 13. CREATE PANEL ROWS
   * ==========================================================
   */

  const created = [];

  for (const member of members) {

    const alreadyExists =
      existing.find(
        (row) =>
          String(row.VivaID || "").trim() ===
            String(member.VivaID).trim() &&

          String(row.PersonID || "").trim() ===
            String(member.PersonID).trim() &&

          String(row.Role || "").trim() ===
            String(member.Role).trim()
      );

    if (alreadyExists) {

      console.log(
        `Panel member already exists: ${member.PersonID} - ${member.Role}`
      );

      continue;
    }

    const PanelID =
      await generateID(
        "VP",
        PANEL_SHEET,
        "PanelID"
      );

    const row = [

      PanelID,

      member.VivaID,

      member.PersonID,

      member.PersonType,

      member.Role,

      member.Required,

      "No",       // InvitationSent

      "",         // InvitationDate

      "Pending",  // Accepted

      "",         // ResponseDate

      ""          // Remarks

    ];

    await addRow(
      PANEL_SHEET,
      row
    );

    created.push({
      PanelID,
      ...member,
      InvitationSent: "No",
      Accepted: "Pending",
    });

  }

  console.log(
    `Viva Panel created for ${caseData.CaseID}: ${created.length} new members`
  );

  return created;
}

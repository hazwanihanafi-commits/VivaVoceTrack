import {
  getRows,
  addRow,
  generateID,
} from "./sheetsService.js";

/**
 * ======================================================
 * Create Viva Panel
 * ======================================================
 *
 * Creates panel members for a Viva:
 *
 * REQUIRED:
 * - Student
 * - Chairperson
 * - Secretary
 * - Main Supervisor
 * - Co-Supervisor
 * - Internal Examiner 1
 * - Internal Examiner 2
 *
 * OPTIONAL:
 * - External Examiner 1
 * - External Examiner 2
 *
 * The function is safe to call multiple times.
 * Existing panel members will not be duplicated.
 */
export async function createVivaPanel(caseData) {

  const members = [];

  /**
   * Add member to temporary panel list
   */
  function add(
    PersonID,
    PersonType,
    Role,
    Required = "Yes"
  ) {

    if (!PersonID) return;

    members.push({
      VivaID: caseData.CaseID,
      PersonID,
      PersonType,
      Role,
      Required,
    });

  }

  // ====================================================
  // STUDENT
  // ====================================================

  add(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );


  // ====================================================
  // CHAIRPERSON
  // ====================================================

  add(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );


  // ====================================================
  // SECRETARY
  // ====================================================

  add(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );


  // ====================================================
  // MAIN SUPERVISOR
  // ====================================================

  add(
    caseData.MainSupervisorID,
    "Staff",
    "Main Supervisor",
    "Yes"
  );


  // ====================================================
  // CO-SUPERVISOR
  // ====================================================

  add(
    caseData.CoSupervisorID,
    "Staff",
    "Co-Supervisor",
    "Yes"
  );


  // ====================================================
  // INTERNAL EXAMINER 1
  // ====================================================

  add(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );


  // ====================================================
  // INTERNAL EXAMINER 2
  // ====================================================

  add(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );


  // ====================================================
  // EXTERNAL EXAMINER 1
  // OPTIONAL
  // ====================================================

  add(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );


  // ====================================================
  // EXTERNAL EXAMINER 2
  // OPTIONAL
  // ====================================================

  add(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );


  // ====================================================
  // GET EXISTING PANEL
  // ====================================================

  const existing = await getRows("Panel");


  // ====================================================
  // CREATE MISSING MEMBERS
  // ====================================================

  for (const member of members) {

    const alreadyExists = existing.find(
      (x) =>
        String(x.VivaID || "").trim() ===
          String(member.VivaID || "").trim() &&

        String(x.PersonID || "").trim() ===
          String(member.PersonID || "").trim() &&

        String(x.Role || "").trim() ===
          String(member.Role || "").trim()
    );


    // Do not create duplicate panel member
    if (alreadyExists) {
      continue;
    }


    // Generate VP001, VP002, VP003...
    const PanelID = await generateID(
      "VP",
      "Panel",
      "PanelID"
    );


    // ==================================================
    // PANEL SHEET
    //
    // PanelID
    // VivaID
    // PersonID
    // PersonType
    // Role
    // Required
    // InvitationSent
    // InvitationDate
    // Accepted
    // ResponseDate
    // Remarks
    // ==================================================

    await addRow("Panel", [

      PanelID,

      member.VivaID,

      member.PersonID,

      member.PersonType,

      member.Role,

      member.Required,

      "No",

      "",

      "Pending",

      "",

      ""

    ]);

  }


  return true;
}

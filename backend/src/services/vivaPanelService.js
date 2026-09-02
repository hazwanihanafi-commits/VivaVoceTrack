import {
  getRows,
  addRow,
  generateID,
  findRow,
  deleteRow,
} from "./sheetsService.js";


/**
 * ======================================================
 * FIND STAFF ID BY STAFF NAME
 * ======================================================
 */
async function getStaffIDByName(name) {

  if (!name) return "";

  const staffRows = await getRows("Staff");

  const searchName = String(name)
    .trim()
    .toLowerCase();

  const staff = staffRows.find(
    (s) =>
      String(s.StaffName || "")
        .trim()
        .toLowerCase() === searchName &&
      String(s.Active || "")
        .trim()
        .toLowerCase() === "yes"
  );

  return staff ? staff.StaffID : "";
}


/**
 * ======================================================
 * CREATE VIVA PANEL
 * ======================================================
 *
 * Creates panel records for:
 *
 * 1. Student
 * 2. Chairperson
 * 3. Secretary
 * 4. Main Supervisor
 * 5. Co-Supervisor(s)
 * 6. Internal Examiner 1
 * 7. Internal Examiner 2
 * 8. External Examiner 1
 * 9. External Examiner 2
 *
 * IMPORTANT:
 *
 * Student is intentionally included in Panel sheet.
 * Therefore Student will also receive:
 *
 * - Viva date
 * - Viva time
 * - Viva mode
 * - venue / meeting link
 * - PanelResponseLink
 *
 * and can respond:
 *
 * Yes / No / Suggest
 *
 * ======================================================
 */
export async function createVivaPanel(caseData) {

  const members = [];


  /**
   * ====================================================
   * ADD MEMBER
   * ====================================================
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

      PersonID: String(PersonID).trim(),

      PersonType,

      Role,

      Required,
    });
  }


  /**
   * ====================================================
   * LOAD STUDENT
   * ====================================================
   */
  let student = null;

  if (caseData.StudentID) {

    student = await findRow(
      "Students",
      "StudentID",
      caseData.StudentID
    );

  }


  /**
   * ====================================================
   * STUDENT
   *
   * IMPORTANT:
   * Student MUST be in Panel.
   * ====================================================
   */
  add(
    caseData.StudentID,
    "Student",
    "Student",
    "Yes"
  );


  /**
   * ====================================================
   * CHAIRPERSON
   * ====================================================
   */
  add(
    caseData.ChairpersonID,
    "Staff",
    "Chairperson",
    "Yes"
  );


  /**
   * ====================================================
   * SECRETARY
   * ====================================================
   */
  add(
    caseData.SecretaryID,
    "Staff",
    "Secretary",
    "Yes"
  );


  /**
   * ====================================================
   * MAIN SUPERVISOR
   * ====================================================
   */
  if (student) {

    const supervisorName =
      String(
        student.Supervisor || ""
      ).trim();

    if (supervisorName) {

      const mainSupervisorID =
        await getStaffIDByName(
          supervisorName
        );

      if (mainSupervisorID) {

        add(
          mainSupervisorID,
          "Staff",
          "Main Supervisor",
          "Yes"
        );

      } else {

        console.warn(
          `Main supervisor not found in Staff sheet: ${supervisorName}`
        );

      }
    }
  }


  /**
   * ====================================================
   * CO-SUPERVISORS
   * ====================================================
   *
   * Supports:
   *
   * Supervisor A
   *
   * OR
   *
   * Supervisor A, Supervisor B
   * ====================================================
   */
  if (
    student &&
    student.CoSupervisor
  ) {

    const names =
      String(student.CoSupervisor)
        .split(",")
        .map(
          (name) => name.trim()
        )
        .filter(Boolean);


    let index = 1;


    for (const name of names) {

      const staffID =
        await getStaffIDByName(name);


      if (!staffID) {

        console.warn(
          `Co-supervisor not found in Staff sheet: ${name}`
        );

        continue;
      }


      add(
        staffID,
        "Staff",
        `Co-Supervisor ${index}`,
        "Yes"
      );


      index++;
    }
  }


  /**
   * ====================================================
   * INTERNAL EXAMINER 1
   * ====================================================
   */
  add(
    caseData.InternalExaminer1ID,
    "Examiner",
    "Internal Examiner 1",
    "Yes"
  );


  /**
   * ====================================================
   * INTERNAL EXAMINER 2
   * ====================================================
   */
  add(
    caseData.InternalExaminer2ID,
    "Examiner",
    "Internal Examiner 2",
    "Yes"
  );


  /**
   * ====================================================
   * EXTERNAL EXAMINER 1
   * ====================================================
   */
  add(
    caseData.ExternalExaminer1ID,
    "Examiner",
    "External Examiner 1",
    "No"
  );


  /**
   * ====================================================
   * EXTERNAL EXAMINER 2
   * ====================================================
   */
  add(
    caseData.ExternalExaminer2ID,
    "Examiner",
    "External Examiner 2",
    "No"
  );


  /**
   * ====================================================
   * GET EXISTING PANEL
   * ====================================================
   */
  const existing =
    await getRows("Panel");


  /**
   * ====================================================
   * CREATE PANEL RECORDS
   * ====================================================
   */
  for (const member of members) {

    const alreadyExists =
      existing.find(
        (x) =>
          String(x.VivaID || "").trim() ===
            String(member.VivaID || "").trim() &&
          String(x.PersonID || "").trim() ===
            String(member.PersonID || "").trim()
      );


    /**
     * Do not duplicate panel member
     */
    if (alreadyExists) continue;


    const PanelID =
      await generateID(
        "VP",
        "Panel",
        "PanelID"
      );


    /**
     * ==================================================
     * PANEL COLUMN ORDER
     *
     * 1  PanelID
     * 2  VivaID
     * 3  PersonID
     * 4  PersonType
     * 5  Role
     * 6  Required
     * 7  InvitationSent
     * 8  InvitationDate
     * 9  InvitationStatus
     * 10 Accepted
     * 11 ResponseDate
     * 12 ResponseDeadline
     * 13 SuggestedDate
     * 14 SuggestedTime
     * 15 Remarks
     * 16 PanelResponseLink
     *
     * ==================================================
     */

    await addRow(
      "Panel",
      [
        // 1
        PanelID,

        // 2
        member.VivaID,

        // 3
        member.PersonID,

        // 4
        member.PersonType,

        // 5
        member.Role,

        // 6
        member.Required,

        // 7
        "No",

        // 8
        "",

        // 9
        "Pending",

        // 10
        "Pending",

        // 11
        "",

        // 12
        caseData.ResponseDeadline || "",

        // 13
        "",

        // 14
        "",

        // 15
        "",

        // 16
        "",
      ]
    );
  }
}


/**
 * ======================================================
 * DELETE VIVA PANEL
 * ======================================================
 */
export async function deleteVivaPanel(caseID) {

  const vivaID =
    String(caseID || "").trim();

  if (!vivaID) return 0;


  const rows =
    await getRows("Panel");


  const rowNumbers = [];


  rows.forEach(
    (row, index) => {

      if (
        String(row.VivaID || "").trim() ===
        vivaID
      ) {

        // Google Sheet header = row 1
        // Data starts = row 2
        rowNumbers.push(index + 2);

      }
    }
  );


  /**
   * Delete from bottom to top
   */
  rowNumbers.sort(
    (a, b) => b - a
  );


  for (
    const rowNumber of rowNumbers
  ) {

    await deleteRow(
      "Panel",
      rowNumber
    );

  }


  console.log(
    `Deleted ${rowNumbers.length} Panel records for ${vivaID}`
  );


  return rowNumbers.length;
}

import {
  findRow,
  findRowNumber,
  updateRow,
} from "../services/sheetsService.js";

import {
  uploadFileToDrive,
} from "../services/googleDriveService.js";


const VIVA_SHEET = "VivaCases";
const STUDENT_SHEET = "Students";
const EXAMINER_SHEET = "Examiners";


/**
 * ======================================================
 * GET EXAMINER ANNOTATED THESIS ASSIGNMENT
 * ======================================================
 */

const getAnnotatedThesisAssignment = (
  viva,
  examinerID
) => {

  const assignments = [

    {
      id: viva.InternalExaminer1ID,
      type: "Internal Examiner 1",

      receivedField:
        "Internal1AnnotatedThesisReceived",

      dateField:
        "Internal1AnnotatedThesisDate",

      fileNameField:
        "Internal1AnnotatedThesisFileName",

      fileURLField:
        "Internal1AnnotatedThesisFileURL",

      driveIDField:
        "Internal1AnnotatedThesisDriveFileID",
    },

    {
      id: viva.InternalExaminer2ID,
      type: "Internal Examiner 2",

      receivedField:
        "Internal2AnnotatedThesisReceived",

      dateField:
        "Internal2AnnotatedThesisDate",

      fileNameField:
        "Internal2AnnotatedThesisFileName",

      fileURLField:
        "Internal2AnnotatedThesisFileURL",

      driveIDField:
        "Internal2AnnotatedThesisDriveFileID",
    },

    {
      id: viva.ExternalExaminer1ID,
      type: "External Examiner 1",

      receivedField:
        "External1AnnotatedThesisReceived",

      dateField:
        "External1AnnotatedThesisDate",

      fileNameField:
        "External1AnnotatedThesisFileName",

      fileURLField:
        "External1AnnotatedThesisFileURL",

      driveIDField:
        "External1AnnotatedThesisDriveFileID",
    },

    {
      id: viva.ExternalExaminer2ID,
      type: "External Examiner 2",

      receivedField:
        "External2AnnotatedThesisReceived",

      dateField:
        "External2AnnotatedThesisDate",

      fileNameField:
        "External2AnnotatedThesisFileName",

      fileURLField:
        "External2AnnotatedThesisFileURL",

      driveIDField:
        "External2AnnotatedThesisDriveFileID",
    },

  ];


  return assignments.find(
    (item) =>
      String(item.id || "").trim() ===
      String(examinerID || "").trim()
  );

};


/**
 * ======================================================
 * CHECK RECEIVED
 * ======================================================
 */

const isReceived = (value) => {

  return [
    "yes",
    "true",
    "received",
    "submitted",
  ].includes(
    String(value || "")
      .trim()
      .toLowerCase()
  );

};


/**
 * ======================================================
 * GET ANNOTATED THESIS INFO
 *
 * GET
 * /api/annotated-thesis/submit-info
 * ======================================================
 */

export const getAnnotatedThesisInfo = async (
  req,
  res,
  next
) => {

  try {

    const {
      caseID,
      examinerID,
    } = req.query;


    if (!caseID) {

      return res.status(400).json({
        success: false,
        message: "Case ID is required.",
      });

    }


    if (!examinerID) {

      return res.status(400).json({
        success: false,
        message: "Examiner ID is required.",
      });

    }


    /**
     * GET VIVA
     */

    const viva =
      await findRow(
        VIVA_SHEET,
        "CaseID",
        caseID
      );


    if (!viva) {

      return res.status(404).json({
        success: false,
        message:
          `Viva case ${caseID} not found.`,
      });

    }


    /**
     * GET STUDENT
     */

    const student =
      await findRow(
        STUDENT_SHEET,
        "StudentID",
        viva.StudentID
      );


    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });

    }


    /**
     * GET EXAMINER
     */

    const examiner =
      await findRow(
        EXAMINER_SHEET,
        "ExaminerID",
        examinerID
      );


    if (!examiner) {

      return res.status(404).json({
        success: false,
        message: "Examiner not found.",
      });

    }


    /**
     * GET ASSIGNMENT
     */

    const assignment =
      getAnnotatedThesisAssignment(
        viva,
        examinerID
      );


    if (!assignment) {

      return res.status(403).json({
        success: false,
        message:
          "This examiner is not assigned to this Viva case.",
      });

    }


    /**
     * GET THIS EXAMINER'S STATUS
     */

    const received =
      isReceived(
        viva[
          assignment.receivedField
        ]
      );


    return res.json({

      success: true,

      case: {

        CaseID:
          viva.CaseID || "",

        StudentID:
          viva.StudentID || "",

        ReportDueDate:
          viva.ReportDueDate || "",

        GoogleDriveLink:
          viva.GoogleDriveLink || "",

      },

      student: {

        StudentID:
          student.StudentID || "",

        StudentName:
          student.StudentName || "",

        MatricNo:
          student.MatricNo || "",

        Programme:
          student.Programme || "",

        School:
          student.School || "",

        ThesisTitle:
          student.ThesisTitle || "",

      },

      examiner: {

        ExaminerID:
          examiner.ExaminerID || "",

        ExaminerName:
          examiner.ExaminerName || "",

        Title:
          examiner.Title || "",

        Email:
          examiner.Email || "",

        ExaminerType:
          assignment.type,

      },

      annotatedThesis: {

        status:
          received
            ? "Yes"
            : "Not Submitted",

        date:
          viva[
            assignment.dateField
          ] || "",

        fileName:
          viva[
            assignment.fileNameField
          ] || "",

        fileURL:
          viva[
            assignment.fileURLField
          ] || "",

        driveFileID:
          viva[
            assignment.driveIDField
          ] || "",

      },

    });

  } catch (err) {

    console.error(
      "GET ANNOTATED THESIS INFO ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * SUBMIT ANNOTATED THESIS
 *
 * POST
 * /api/annotated-thesis/submit
 * ======================================================
 */

export const submitAnnotatedThesis = async (
  req,
  res,
  next
) => {

  try {

    const {
      caseID,
      examinerID,
    } = req.body;


    /**
     * VALIDATION
     */

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "Please select an annotated thesis file.",
      });

    }


    if (!caseID) {

      return res.status(400).json({
        success: false,
        message:
          "Case ID is required.",
      });

    }


    if (!examinerID) {

      return res.status(400).json({
        success: false,
        message:
          "Examiner ID is required.",
      });

    }


    /**
     * GET VIVA
     */

    const viva =
      await findRow(
        VIVA_SHEET,
        "CaseID",
        caseID
      );


    if (!viva) {

      return res.status(404).json({
        success: false,
        message:
          `Viva case ${caseID} not found.`,
      });

    }


    /**
     * GET ASSIGNMENT
     */

    const assignment =
      getAnnotatedThesisAssignment(
        viva,
        examinerID
      );


    if (!assignment) {

      return res.status(403).json({
        success: false,
        message:
          "This examiner is not assigned to this Viva case.",
      });

    }


    /**
     * GET EXAMINER
     */

    const examiner =
      await findRow(
        EXAMINER_SHEET,
        "ExaminerID",
        examinerID
      );


    if (!examiner) {

      return res.status(404).json({
        success: false,
        message:
          "Examiner not found.",
      });

    }


    /**
     * PREVENT DUPLICATE
     *
     * IMPORTANT:
     * This checks ONLY this examiner.
     */

    if (
      isReceived(
        viva[
          assignment.receivedField
        ]
      )
    ) {

      return res.status(409).json({
        success: false,
        message:
          "You have already submitted your annotated thesis for this Viva case.",
      });

    }


    /**
     * FILE NAME
     */

    const originalName =
      req.file.originalname ||
      "Annotated_Thesis.pdf";


    const extension =
      originalName.includes(".")
        ? originalName.substring(
            originalName.lastIndexOf(".")
          )
        : ".pdf";


    const safeCaseID =
      String(caseID)
        .replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );


    const safeExaminerID =
      String(examinerID)
        .replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );


    const fileName =
      `${safeCaseID}_${safeExaminerID}_Annotated_Thesis${extension}`;


    /**
     * CASE DRIVE FOLDER
     */

    const caseFolderUrl =
      viva.GoogleDriveLink || "";


    if (!caseFolderUrl) {

      return res.status(400).json({
        success: false,
        message:
          "Google Drive case folder is not available.",
      });

    }


    /**
     * UPLOAD
     *
     * 04 - Annotated Thesis
     */

    const driveResult =
      await uploadFileToDrive({

        buffer:
          req.file.buffer,

        originalName:
          fileName,

        mimeType:
          req.file.mimetype,

        parentFolderUrl:
          caseFolderUrl,

        childFolderName:
          "04 - Annotated Thesis",

      });


    /**
     * FIND ROW
     */

    const rowNumber =
      await findRowNumber(
        VIVA_SHEET,
        "CaseID",
        caseID
      );


    if (
      rowNumber === -1 ||
      !rowNumber
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Viva case row not found.",
      });

    }


    /**
     * DATE
     */

    const submissionDate =
      new Date().toISOString();


    /**
     * UPDATE ONLY THIS EXAMINER
     */

    const updateData = {

      [assignment.receivedField]:
        "Yes",

      [assignment.dateField]:
        submissionDate,

      [assignment.fileNameField]:
        fileName,

      [assignment.fileURLField]:
        driveResult.webViewLink || "",

      [assignment.driveIDField]:
        driveResult.id || "",

      LastUpdated:
        submissionDate,

    };


    /**
     * UPDATE SHEET
     */

    await updateRow(
      VIVA_SHEET,
      rowNumber,
      updateData
    );


    /**
     * RESPONSE
     */

    return res.json({

      success: true,

      message:
        "Annotated thesis submitted successfully.",

      data: {

        CaseID:
          caseID,

        ExaminerID:
          examinerID,

        ExaminerName:
          examiner.ExaminerName || "",

        ExaminerType:
          assignment.type,

        AnnotatedThesisReceived:
          "Yes",

        AnnotatedThesisUploadedDate:
          submissionDate,

        AnnotatedThesisFileName:
          fileName,

        AnnotatedThesisFileURL:
          driveResult.webViewLink || "",

        GoogleDriveFileID:
          driveResult.id || "",

        TargetFolderID:
          driveResult.folderId || "",

      },

    });

  } catch (err) {

    console.error(
      "SUBMIT ANNOTATED THESIS ERROR:",
      err
    );

    next(err);

  }

};

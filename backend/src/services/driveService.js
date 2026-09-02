import { google } from "googleapis";
import { Readable } from "stream";

const FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * ======================================================
 * GOOGLE DRIVE AUTHENTICATION
 * ======================================================
 */

const getGoogleAuth = () => {
  let credentials = null;

  // ----------------------------------------------------
  // OPTION 1:
  // GOOGLE_SERVICE_ACCOUNT contains full JSON
  // ----------------------------------------------------

  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT
      );
    } catch (err) {
      console.error(
        "Unable to parse GOOGLE_SERVICE_ACCOUNT:",
        err.message
      );
    }
  }

  // ----------------------------------------------------
  // OPTION 2:
  // Separate environment variables
  // ----------------------------------------------------

  if (!credentials) {
    credentials = {
      client_email:
        process.env.GOOGLE_CLIENT_EMAIL,

      private_key:
        process.env.GOOGLE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),

      project_id:
        process.env.GOOGLE_PROJECT_ID,
    };
  }

  // ----------------------------------------------------
  // VALIDATE CREDENTIALS
  // ----------------------------------------------------

  if (
    !credentials?.client_email ||
    !credentials?.private_key
  ) {
    throw new Error(
      "Google Drive credentials are not configured."
    );
  }

  return new google.auth.GoogleAuth({
    credentials,

    scopes: [
      "https://www.googleapis.com/auth/drive",
    ],
  });
};

/**
 * ======================================================
 * DRIVE CLIENT
 * ======================================================
 */

const getDrive = async () => {
  const auth = getGoogleAuth();

  return google.drive({
    version: "v3",
    auth,
  });
};

/**
 * ======================================================
 * CREATE FOLDER
 * ======================================================
 */

export const createDriveFolder = async ({
  name,
  parentId = FOLDER_ID,
}) => {
  if (!name) {
    throw new Error(
      "Folder name is required."
    );
  }

  if (!parentId) {
    throw new Error(
      "Google Drive parent folder ID is not configured."
    );
  }

  const drive = await getDrive();

  // ----------------------------------------------------
  // Check whether folder already exists
  // ----------------------------------------------------

  const existing =
    await drive.files.list({
      q: `
        name = '${escapeDriveQuery(name)}'
        and '${parentId}' in parents
        and mimeType = 'application/vnd.google-apps.folder'
        and trashed = false
      `,

      fields:
        "files(id,name,webViewLink)",

      supportsAllDrives: true,

      includeItemsFromAllDrives: true,
    });

  if (
    existing.data.files &&
    existing.data.files.length > 0
  ) {
    const folder =
      existing.data.files[0];

    console.log(
      "DRIVE FOLDER ALREADY EXISTS:",
      {
        id: folder.id,
        name: folder.name,
      }
    );

    return {
      id:
        folder.id,

      name:
        folder.name,

      webViewLink:
        folder.webViewLink ||
        `https://drive.google.com/drive/folders/${folder.id}`,

      existing: true,
    };
  }

  // ----------------------------------------------------
  // Create new folder
  // ----------------------------------------------------

  const response =
    await drive.files.create({
      requestBody: {
        name,

        mimeType:
          "application/vnd.google-apps.folder",

        parents: [parentId],
      },

      fields:
        "id,name,webViewLink",

      supportsAllDrives: true,
    });

  const folder =
    response.data;

  if (!folder.id) {
    throw new Error(
      "Google Drive did not return folder ID."
    );
  }

  console.log(
    "NEW DRIVE FOLDER CREATED:",
    {
      id: folder.id,
      name: folder.name,
    }
  );

  return {
    id:
      folder.id,

    name:
      folder.name,

    webViewLink:
      folder.webViewLink ||
      `https://drive.google.com/drive/folders/${folder.id}`,

    existing: false,
  };
};

/**
 * ======================================================
 * SHARE GOOGLE DRIVE FOLDER
 * ======================================================
 *
 * Shares the folder with the Google account specified
 * in:
 *
 * GOOGLE_DRIVE_SHARE_EMAIL
 *
 * Default role:
 *
 * writer
 *
 * ======================================================
 */

export const shareDriveFolder = async ({
  folderId,
  emailAddress,
  role = "writer",
}) => {
  if (!folderId) {
    throw new Error(
      "Folder ID is required."
    );
  }

  if (!emailAddress) {
    throw new Error(
      "Google Drive sharing email is not configured."
    );
  }

  const drive =
    await getDrive();

  console.log(
    "CHECKING DRIVE PERMISSIONS:",
    {
      folderId,
      emailAddress,
      role,
    }
  );

  // ----------------------------------------------------
  // Get existing permissions
  // ----------------------------------------------------

  const permissions =
    await drive.permissions.list({
      fileId: folderId,

      fields:
        "permissions(id,type,emailAddress,role)",

      supportsAllDrives: true,
    });

  const existingPermission =
    (
      permissions.data.permissions ||
      []
    ).find(
      (permission) =>
        permission.type === "user" &&
        String(
          permission.emailAddress || ""
        )
          .trim()
          .toLowerCase() ===
          String(emailAddress)
            .trim()
            .toLowerCase()
    );

  // ----------------------------------------------------
  // Already shared
  // ----------------------------------------------------

  if (existingPermission) {
    console.log(
      "DRIVE FOLDER ALREADY SHARED:",
      {
        folderId,
        emailAddress,
        permissionId:
          existingPermission.id,
        role:
          existingPermission.role,
      }
    );

    // If existing role is not writer, upgrade it
    if (
      role === "writer" &&
      existingPermission.role !==
        "writer" &&
      existingPermission.role !==
        "owner"
    ) {
      const updatedPermission =
        await drive.permissions.update({
          fileId: folderId,

          permissionId:
            existingPermission.id,

          requestBody: {
            role: "writer",
          },

          fields:
            "id,type,emailAddress,role",

          supportsAllDrives: true,
        });

      console.log(
        "DRIVE PERMISSION UPDATED:",
        updatedPermission.data
      );

      return {
        success: true,
        existing: true,

        permissionId:
          updatedPermission.data.id,

        emailAddress,

        role:
          updatedPermission.data.role,
      };
    }

    return {
      success: true,
      existing: true,

      permissionId:
        existingPermission.id,

      emailAddress,

      role:
        existingPermission.role ||
        role,
    };
  }

  // ----------------------------------------------------
  // Create permission
  // ----------------------------------------------------

  const response =
    await drive.permissions.create({
      fileId: folderId,

      requestBody: {
        type: "user",

        role,

        emailAddress,
      },

      // Do not send email notification
      sendNotificationEmail: false,

      fields: "id",

      supportsAllDrives: true,
    });

  console.log(
    "DRIVE FOLDER SHARED SUCCESSFULLY:",
    {
      folderId,
      emailAddress,
      permissionId:
        response.data.id,
      role,
    }
  );

  return {
    success: true,

    existing: false,

    permissionId:
      response.data.id,

    emailAddress,

    role,
  };
};

/**
 * ======================================================
 * CREATE VIVA CASE FOLDER STRUCTURE
 * ======================================================
 *
 * VivaTrack
 * └── VC001 - Student Name
 *     ├── 01 - Thesis
 *     ├── 02 - Supporting Documents
 *     ├── 03 - Examiner Reports
 *     └── 04 - Annotated Thesis
 *
 * ======================================================
 */

export const createVivaCaseFolders =
  async ({
    caseID,
    studentName,
  }) => {

    if (!caseID) {
      throw new Error(
        "CaseID is required."
      );
    }

    const safeStudentName =
      String(
        studentName ||
          "Unknown Student"
      ).trim();

    // --------------------------------------------------
    // Email that should receive access
    // --------------------------------------------------

    const shareEmail =
      process.env.GOOGLE_DRIVE_SHARE_EMAIL;

    if (!shareEmail) {
      throw new Error(
        "GOOGLE_DRIVE_SHARE_EMAIL is not configured."
      );
    }

    console.log(
      "=========================================="
    );

    console.log(
      "CREATE VIVA CASE DRIVE FOLDERS"
    );

    console.log(
      "CASE ID:",
      caseID
    );

    console.log(
      "STUDENT:",
      safeStudentName
    );

    console.log(
      "SHARE EMAIL:",
      shareEmail
    );

    console.log(
      "=========================================="
    );

    // --------------------------------------------------
    // Main case folder
    // --------------------------------------------------

    const caseFolderName =
      `${caseID} - ${safeStudentName}`;

    const caseFolder =
      await createDriveFolder({
        name:
          caseFolderName,

        parentId:
          FOLDER_ID,
      });

    console.log(
      "CASE FOLDER:",
      caseFolder
    );

    // --------------------------------------------------
    // Subfolder 01 - Thesis
    // --------------------------------------------------

    const thesisFolder =
      await createDriveFolder({
        name:
          "01 - Thesis",

        parentId:
          caseFolder.id,
      });

    // --------------------------------------------------
    // Subfolder 02 - Supporting Documents
    // --------------------------------------------------

    const supportingFolder =
      await createDriveFolder({
        name:
          "02 - Supporting Documents",

        parentId:
          caseFolder.id,
      });

    // --------------------------------------------------
    // Subfolder 03 - Examiner Reports
    // --------------------------------------------------

    const reportsFolder =
      await createDriveFolder({
        name:
          "03 - Examiner Reports",

        parentId:
          caseFolder.id,
      });

    // --------------------------------------------------
    // Subfolder 04 - Annotated Thesis
    // --------------------------------------------------

    const annotatedFolder =
      await createDriveFolder({
        name:
          "04 - Annotated Thesis",

        parentId:
          caseFolder.id,
      });

    // --------------------------------------------------
    // Share MAIN CASE FOLDER
    // --------------------------------------------------
    //
    // Sharing the parent folder gives access to the
    // files/folders inside it.
    //
    // --------------------------------------------------

    let shareResult;

    try {

      shareResult =
        await shareDriveFolder({
          folderId:
            caseFolder.id,

          emailAddress:
            shareEmail,

          role:
            "writer",
        });

    } catch (shareError) {

      console.error(
        "DRIVE SHARING ERROR:",
        shareError
      );

      throw new Error(
        `Drive folder created but sharing failed: ${shareError.message}`
      );
    }

    // --------------------------------------------------
    // Return complete structure
    // --------------------------------------------------

    return {

      caseFolder: {

        id:
          caseFolder.id,

        name:
          caseFolder.name,

        webViewLink:
          caseFolder.webViewLink ||
          `https://drive.google.com/drive/folders/${caseFolder.id}`,

      },

      thesisFolder: {

        id:
          thesisFolder.id,

        name:
          thesisFolder.name,

        webViewLink:
          thesisFolder.webViewLink ||
          `https://drive.google.com/drive/folders/${thesisFolder.id}`,

      },

      supportingFolder: {

        id:
          supportingFolder.id,

        name:
          supportingFolder.name,

        webViewLink:
          supportingFolder.webViewLink ||
          `https://drive.google.com/drive/folders/${supportingFolder.id}`,

      },

      reportsFolder: {

        id:
          reportsFolder.id,

        name:
          reportsFolder.name,

        webViewLink:
          reportsFolder.webViewLink ||
          `https://drive.google.com/drive/folders/${reportsFolder.id}`,

      },

      annotatedFolder: {

        id:
          annotatedFolder.id,

        name:
          annotatedFolder.name,

        webViewLink:
          annotatedFolder.webViewLink ||
          `https://drive.google.com/drive/folders/${annotatedFolder.id}`,

      },

      sharedWith:
        shareEmail,

      shareResult,

    };
  };

/**
 * ======================================================
 * GET FOLDER URL
 * ======================================================
 */

export const getDriveFolderUrl =
  (folderId) => {

    if (!folderId) {
      return "";
    }

    return `https://drive.google.com/drive/folders/${folderId}`;
  };

/**
 * ======================================================
 * UPLOAD FILE
 * ======================================================
 */

export const uploadFileToDrive =
  async ({
    buffer,
    originalName,
    mimeType,
    folderId = FOLDER_ID,
  }) => {

    if (!buffer) {
      throw new Error(
        "No file buffer received."
      );
    }

    if (!folderId) {
      throw new Error(
        "Google Drive folder ID is not configured."
      );
    }

    const drive =
      await getDrive();

    const fileMetadata = {
      name:
        originalName,

      parents: [
        folderId,
      ],
    };

    const media = {

      mimeType:
        mimeType ||
        "application/octet-stream",

      body:
        Readable.from(buffer),
    };

    const response =
      await drive.files.create({

        requestBody:
          fileMetadata,

        media,

        fields:
          "id,name,mimeType,size,webViewLink,webContentLink",

        supportsAllDrives:
          true,
      });

    const file =
      response.data;

    if (!file.id) {
      throw new Error(
        "Google Drive did not return a file ID."
      );
    }

    return {

      id:
        file.id,

      name:
        file.name,

      mimeType:
        file.mimeType,

      size:
        file.size || "",

      webViewLink:
        file.webViewLink ||
        `https://drive.google.com/file/d/${file.id}/view`,

      webContentLink:
        file.webContentLink ||
        "",
    };
  };

/**
 * ======================================================
 * UPLOAD THESIS
 * ======================================================
 */

export const uploadThesisToDrive =
  async ({
    buffer,
    originalName,
    mimeType,
    thesisFolderId,
  }) => {

    return uploadFileToDrive({
      buffer,

      originalName,

      mimeType,

      folderId:
        thesisFolderId,
    });
  };

/**
 * ======================================================
 * UPLOAD EXAMINER REPORT
 * ======================================================
 */

export const uploadExaminerReportToDrive =
  async ({
    buffer,
    originalName,
    mimeType,
    reportsFolderId,
  }) => {

    return uploadFileToDrive({
      buffer,

      originalName,

      mimeType,

      folderId:
        reportsFolderId,
    });
  };

/**
 * ======================================================
 * UPLOAD ANNOTATED THESIS
 * ======================================================
 */

export const uploadAnnotatedThesisToDrive =
  async ({
    buffer,
    originalName,
    mimeType,
    annotatedFolderId,
  }) => {

    return uploadFileToDrive({
      buffer,

      originalName,

      mimeType,

      folderId:
        annotatedFolderId,
    });
  };

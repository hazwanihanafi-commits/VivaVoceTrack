import { google } from "googleapis";
import { Readable } from "stream";

/**
 * ======================================================
 * GOOGLE DRIVE AUTHENTICATION
 * ======================================================
 */
const getGoogleAuth = () => {
  let credentials = null;

  // GOOGLE_SERVICE_ACCOUNT = full JSON
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

  // Separate environment variables
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
 * EXTRACT GOOGLE DRIVE FOLDER ID
 * ======================================================
 */
function extractFolderId(folderUrlOrId) {
  if (!folderUrlOrId) {
    return "";
  }

  const value = String(folderUrlOrId).trim();

  // Already an ID
  if (
    !value.startsWith("http://") &&
    !value.startsWith("https://")
  ) {
    return value;
  }

  // /folders/FOLDER_ID
  const folderMatch = value.match(
    /\/folders\/([a-zA-Z0-9_-]+)/
  );

  if (folderMatch?.[1]) {
    return folderMatch[1];
  }

  // ?id=FOLDER_ID
  const idMatch = value.match(
    /[?&]id=([a-zA-Z0-9_-]+)/
  );

  if (idMatch?.[1]) {
    return idMatch[1];
  }

  return "";
}

/**
 * ======================================================
 * FIND CHILD FOLDER
 *
 * Example:
 *
 * Case Folder
 * ├── 01 - Thesis
 * ├── 02 - Supporting Documents
 * ├── 03 - Examiner Reports   <-- target
 * └── 04 - Annotated Thesis
 * ======================================================
 */
const findChildFolder = async (
  drive,
  parentFolderId,
  childFolderName
) => {
  const escapedName =
    String(childFolderName)
      .replace(/'/g, "\\'");

  const response =
    await drive.files.list({
      q: [
        `'${parentFolderId}' in parents`,
        `name = '${escapedName}'`,
        "mimeType = 'application/vnd.google-apps.folder'",
        "trashed = false",
      ].join(" and "),

      fields:
        "files(id,name,parents,webViewLink)",

      spaces: "drive",

      includeItemsFromAllDrives: true,

      supportsAllDrives: true,
    });

  return response.data.files?.[0] || null;
};

/**
 * ======================================================
 * UPLOAD FILE TO GOOGLE DRIVE
 *
 * Supports:
 *
 * uploadFileToDrive({
 *   buffer,
 *   originalName,
 *   mimeType,
 *   folderId
 * })
 *
 * OR:
 *
 * uploadFileToDrive({
 *   fileBuffer,
 *   fileName,
 *   mimeType,
 *   parentFolderUrl,
 *   childFolderName
 * })
 *
 * This lets old code continue working while the
 * examiner report upload uses the case folder.
 * ======================================================
 */
export const uploadFileToDrive = async ({
  buffer,
  originalName,

  // New/alternative parameter names
  fileBuffer,
  fileName,

  mimeType,

  // Direct folder ID
  folderId,

  // Case root folder URL
  parentFolderUrl,

  // Example: "03 - Examiner Reports"
  childFolderName,
}) => {
  const actualBuffer =
    buffer || fileBuffer;

  const actualName =
    originalName || fileName;

  if (!actualBuffer) {
    throw new Error(
      "No file buffer received."
    );
  }

  if (!actualName) {
    throw new Error(
      "No file name received."
    );
  }

  const drive = await getDrive();

  /**
   * ====================================================
   * DETERMINE TARGET FOLDER
   * ====================================================
   */

  let targetFolderId =
    folderId || "";

  /**
   * If parentFolderUrl is supplied,
   * extract the Case root folder ID.
   */
  if (
    !targetFolderId &&
    parentFolderUrl
  ) {
    const parentFolderId =
      extractFolderId(
        parentFolderUrl
      );

    if (!parentFolderId) {
      throw new Error(
        "Unable to extract Google Drive folder ID."
      );
    }

    /**
     * If child folder is requested,
     * find it inside the case folder.
     */
    if (childFolderName) {
      const childFolder =
        await findChildFolder(
          drive,
          parentFolderId,
          childFolderName
        );

      if (!childFolder?.id) {
        throw new Error(
          `Google Drive folder "${childFolderName}" was not found inside the case folder.`
        );
      }

      targetFolderId =
        childFolder.id;
    } else {
      targetFolderId =
        parentFolderId;
    }
  }

  if (!targetFolderId) {
    throw new Error(
      "Google Drive target folder is not configured."
    );
  }

  /**
   * ====================================================
   * FILE METADATA
   * ====================================================
   */

  const fileMetadata = {
    name: actualName,
    parents: [targetFolderId],
  };

  /**
   * ====================================================
   * FILE MEDIA
   * ====================================================
   */

  const media = {
    mimeType:
      mimeType ||
      "application/octet-stream",

    body:
      Readable.from(actualBuffer),
  };

  /**
   * ====================================================
   * UPLOAD
   * ====================================================
   */

  const response =
    await drive.files.create({
      requestBody:
        fileMetadata,

      media,

      fields:
        "id,name,mimeType,size,webViewLink,webContentLink,parents",

      supportsAllDrives: true,
    });

  const file =
    response.data;

  if (!file.id) {
    throw new Error(
      "Google Drive did not return a file ID."
    );
  }

  /**
   * ====================================================
   * RETURN
   * ====================================================
   */

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
      file.webContentLink || "",

    folderId:
      targetFolderId,
  };
};

import { google } from "googleapis";
import { Readable } from "stream";

/**
 * ======================================================
 * GOOGLE DRIVE - OAUTH AUTHENTICATION
 * ======================================================
 */

const getDrive = async () => {
  const clientId =
    process.env.GOOGLE_CLIENT_ID;

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET;

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI;

  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured."
    );
  }

  if (!clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is not configured."
    );
  }

  if (!redirectUri) {
    throw new Error(
      "GOOGLE_REDIRECT_URI is not configured."
    );
  }

  if (!refreshToken) {
    throw new Error(
      "GOOGLE_REFRESH_TOKEN is not configured."
    );
  }

  const oauth2Client =
    new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
};


/**
 * ======================================================
 * EXTRACT GOOGLE DRIVE FOLDER ID
 * ======================================================
 */

function extractFolderId(folderUrl) {

  if (!folderUrl) {
    throw new Error(
      "Google Drive folder URL is required."
    );
  }

  const match =
    String(folderUrl).match(
      /\/folders\/([a-zA-Z0-9_-]+)/
    );

  if (match?.[1]) {
    return match[1];
  }

  const openIdMatch =
    String(folderUrl).match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );

  if (openIdMatch?.[1]) {
    return openIdMatch[1];
  }

  if (
    /^[a-zA-Z0-9_-]+$/.test(
      String(folderUrl).trim()
    )
  ) {
    return String(folderUrl).trim();
  }

  throw new Error(
    "Invalid Google Drive folder URL."
  );
}


/**
 * ======================================================
 * FIND CHILD FOLDER
 * ======================================================
 */

async function findChildFolder(
  drive,
  parentFolderId,
  childFolderName
) {

  const response =
    await drive.files.list({
      q: [
        `'${parentFolderId}' in parents`,
        `name = '${childFolderName}'`,
        "mimeType = 'application/vnd.google-apps.folder'",
        "trashed = false",
      ].join(" and "),

      fields:
        "files(id,name,parents)",

      spaces: "drive",

      supportsAllDrives: true,

      includeItemsFromAllDrives: true,
    });

  return (
    response.data.files?.[0] ||
    null
  );
}


/**
 * ======================================================
 * UPLOAD FILE TO EXAMINER REPORT FOLDER
 * ======================================================
 */

export const uploadFileToDrive = async ({
  buffer,
  originalName,
  mimeType,
  parentFolderUrl,
  childFolderName,
}) => {

  if (!buffer) {
    throw new Error(
      "No file buffer received."
    );
  }

  if (!parentFolderUrl) {
    throw new Error(
      "Google Drive case folder is required."
    );
  }

  if (!childFolderName) {
    throw new Error(
      "Google Drive child folder name is required."
    );
  }

  /**
   * OAuth Drive
   */
  const drive =
    await getDrive();

  /**
   * Case folder
   */
  const parentFolderId =
    extractFolderId(
      parentFolderUrl
    );

  /**
   * Find:
   *
   * 03 - Examiner Reports
   */
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

  /**
   * File metadata
   */
  const fileMetadata = {
    name: originalName,

    parents: [
      childFolder.id,
    ],
  };

  /**
   * File content
   */
  const media = {
    mimeType:
      mimeType ||
      "application/octet-stream",

    body:
      Readable.from(buffer),
  };

  /**
   * Upload
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
      childFolder.id,

    folderName:
      childFolder.name,
  };
};

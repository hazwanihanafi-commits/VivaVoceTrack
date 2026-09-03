import {
  getOAuthClient,
  getGoogleAuthUrl,
} from "../services/googleOAuthService.js";

/**
 * ======================================================
 * GOOGLE OAUTH LOGIN
 *
 * GET /api/auth/google
 * ======================================================
 */
export const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const authUrl =
      getGoogleAuthUrl();

    return res.redirect(authUrl);

  } catch (err) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      err
    );

    next(err);
  }
};

/**
 * ======================================================
 * GOOGLE OAUTH CALLBACK
 *
 * GET /api/auth/google/callback
 * ======================================================
 */
export const googleCallback = async (
  req,
  res,
  next
) => {
  try {
    const { code } =
      req.query;

    /**
     * No authorization code
     */
    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Google authorization code is missing.",
      });
    }

    /**
     * Create OAuth client
     */
    const oauth2Client =
      getOAuthClient();

    /**
     * Exchange authorization code
     * for access + refresh token
     */
    const { tokens } =
      await oauth2Client.getToken(
        code
      );

    /**
     * ==================================================
     * TEST OUTPUT
     * ==================================================
     */

    console.log(
      "======================================"
    );

    console.log(
      "GOOGLE OAUTH SUCCESS"
    );

    console.log(
      "Access Token:",
      tokens.access_token
        ? "RECEIVED"
        : "NOT RECEIVED"
    );

    console.log(
      "Refresh Token:",
      tokens.refresh_token
        ? "RECEIVED"
        : "NOT RECEIVED"
    );

    console.log(
      "Expiry:",
      tokens.expiry_date || "N/A"
    );

    console.log(
      "======================================"
    );

    /**
     * ==================================================
     * TEMPORARY RESPONSE FOR TESTING
     * ==================================================
     *
     * We will NOT keep this response
     * in the final production version.
     */

    return res.json({
      success: true,

      message:
        "Google OAuth successful.",

      tokens: {
        access_token:
          tokens.access_token || null,

        refresh_token:
          tokens.refresh_token || null,

        expiry_date:
          tokens.expiry_date || null,
      },
    });

  } catch (err) {
    console.error(
      "GOOGLE OAUTH CALLBACK ERROR:",
      err
    );

    next(err);
  }
};

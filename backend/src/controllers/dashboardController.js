import { getRows } from "../services/sheetsService.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * Dashboard Summary
 * GET /api/dashboard
 * ======================================================
 */
export const getDashboardSummary = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    const today = new Date();

    let totalCases = 0;
    let scheduled = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let postponed = 0;
    let pendingReports = 0;
    let overdueReports = 0;
    let upcomingVivas = 0;

    rows.forEach((row) => {

      totalCases++;

      switch (row.CurrentStatus) {

        case "Scheduled":
          scheduled++;
          break;

        case "Confirmed":
          confirmed++;
          break;

        case "Completed":
          completed++;
          break;

        case "Cancelled":
          cancelled++;
          break;

        case "Postponed":
          postponed++;
          break;

      }

      if (
        row.ReportReceived !== "Yes"
      ) {
        pendingReports++;
      }

      if (
        row.ReportDueDate &&
        row.ReportReceived !== "Yes"
      ) {

        const due = new Date(row.ReportDueDate);

        if (due < today) {
          overdueReports++;
        }

      }

      if (row.ConfirmedVivaDate) {

        const vivaDate = new Date(row.ConfirmedVivaDate);

        if (vivaDate >= today) {
          upcomingVivas++;
        }

      }

    });

    res.json({

      success: true,

      summary: {

        totalCases,

        scheduled,

        confirmed,

        completed,

        cancelled,

        postponed,

        pendingReports,

        overdueReports,

        upcomingVivas,

      },

    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Upcoming Viva
 * GET /api/dashboard/upcoming
 * ======================================================
 */
export const getUpcomingVivas = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    const today = new Date();

    const upcoming = rows
      .filter((row) => {

        if (!row.ConfirmedVivaDate)
          return false;

        return new Date(
          row.ConfirmedVivaDate
        ) >= today;

      })
      .sort((a, b) =>
        new Date(a.ConfirmedVivaDate) -
        new Date(b.ConfirmedVivaDate)
      );

    res.json({

      success: true,

      total: upcoming.length,

      data: upcoming,

    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Recent Viva
 * GET /api/dashboard/recent
 * ======================================================
 */
export const getRecentVivas = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    const recent = rows
      .filter(r => r.ConfirmedVivaDate)
      .sort(
        (a, b) =>
          new Date(b.ConfirmedVivaDate) -
          new Date(a.ConfirmedVivaDate)
      )
      .slice(0, 10);

    res.json({

      success: true,

      total: recent.length,

      data: recent,

    });

  } catch (err) {

    next(err);

  }

};

/**
 * ======================================================
 * Report Statistics
 * GET /api/dashboard/reports
 * ======================================================
 */
export const getReportStatistics = async (req, res, next) => {

  try {

    const rows = await getRows(SHEET);

    let submitted = 0;
    let pending = 0;

    rows.forEach(row => {

      if (row.ReportReceived === "Yes")
        submitted++;
      else
        pending++;

    });

    res.json({

      success: true,

      submitted,

      pending,

    });

  } catch (err) {

    next(err);

  }

};

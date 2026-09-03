import { getRows } from "../services/sheetsService.js";

const SHEET = "VivaCases";

/**
 * ======================================================
 * HELPER
 * ======================================================
 *
 * Get all examiner report assignments for one Viva case.
 *
 * Only examiners that are actually assigned are counted.
 *
 * Example:
 *
 * InternalExaminer1ID = EX001
 * Internal1ReportReceived = Yes
 *
 * InternalExaminer2ID = EX002
 * Internal2ReportReceived = No
 *
 * ExternalExaminer1ID = EX003
 * External1ReportReceived = No
 *
 * ExternalExaminer2ID = EX004
 * External2ReportReceived = No
 *
 * Result:
 *
 * total = 4
 * submitted = 1
 * pending = 3
 *
 * ======================================================
 */
const getExaminerReports = (row) => {

  return [

    {
      examinerID:
        row.InternalExaminer1ID || "",

      type:
        "Internal Examiner 1",

      received:
        row.Internal1ReportReceived || "",

      date:
        row.Internal1ReportDate || "",
    },

    {
      examinerID:
        row.InternalExaminer2ID || "",

      type:
        "Internal Examiner 2",

      received:
        row.Internal2ReportReceived || "",

      date:
        row.Internal2ReportDate || "",
    },

    {
      examinerID:
        row.ExternalExaminer1ID || "",

      type:
        "External Examiner 1",

      received:
        row.External1ReportReceived || "",

      date:
        row.External1ReportDate || "",
    },

    {
      examinerID:
        row.ExternalExaminer2ID || "",

      type:
        "External Examiner 2",

      received:
        row.External2ReportReceived || "",

      date:
        row.External2ReportDate || "",
    },

  ].filter(
    (item) =>
      String(item.examinerID).trim() !== ""
  );

};


/**
 * ======================================================
 * CHECK REPORT RECEIVED
 * ======================================================
 */

const isReportReceived = (value) => {

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
 * DASHBOARD SUMMARY
 *
 * GET /api/dashboard
 * ======================================================
 */

export const getDashboardSummary = async (
  req,
  res,
  next
) => {

  try {

    const rows =
      await getRows(SHEET);

    const today =
      new Date();

    let totalCases = 0;

    let scheduled = 0;

    let confirmed = 0;

    let completed = 0;

    let cancelled = 0;

    let postponed = 0;

    let pendingReports = 0;

    let overdueReports = 0;

    let upcomingVivas = 0;


    /**
     * ==================================================
     * LOOP ALL VIVA CASES
     * ==================================================
     */

    rows.forEach((row) => {

      totalCases++;


      /**
       * ================================================
       * CASE STATUS
       * ================================================
       */

      switch (
        String(
          row.CurrentStatus || ""
        ).trim()
      ) {

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


      /**
       * ================================================
       * EXAMINER REPORTS
       * ================================================
       */

      const examinerReports =
        getExaminerReports(row);


      /**
       * Count reports that are still pending
       */

      const pendingForCase =
        examinerReports.filter(
          (report) =>
            !isReportReceived(
              report.received
            )
        ).length;


      pendingReports +=
        pendingForCase;


      /**
       * ================================================
       * OVERDUE REPORTS
       * ================================================
       *
       * If the report due date has passed,
       * count all outstanding examiner reports.
       *
       * ================================================
       */

      if (
        row.ReportDueDate &&
        pendingForCase > 0
      ) {

        const dueDate =
          new Date(
            row.ReportDueDate
          );

        if (
          !Number.isNaN(
            dueDate.getTime()
          ) &&
          dueDate < today
        ) {

          overdueReports +=
            pendingForCase;

        }

      }


      /**
       * ================================================
       * UPCOMING VIVA
       * ================================================
       */

      if (
        row.ConfirmedVivaDate
      ) {

        const vivaDate =
          new Date(
            row.ConfirmedVivaDate
          );

        if (
          !Number.isNaN(
            vivaDate.getTime()
          ) &&
          vivaDate >= today
        ) {

          upcomingVivas++;

        }

      }

    });


    /**
     * ==================================================
     * TOTAL REPORTS
     * ==================================================
     *
     * This is useful for dashboard frontend.
     *
     * ==================================================
     */

    let totalReports = 0;

    let submittedReports = 0;


    rows.forEach((row) => {

      const examinerReports =
        getExaminerReports(row);


      examinerReports.forEach(
        (report) => {

          totalReports++;


          if (
            isReportReceived(
              report.received
            )
          ) {

            submittedReports++;

          }

        }
      );

    });


    /**
     * ==================================================
     * RESPONSE
     * ==================================================
     */

    return res.json({

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

        /**
         * Additional report totals
         */

        totalReports,

        submittedReports,

        reportsPending:
          totalReports -
          submittedReports,

      },

    });

  } catch (err) {

    console.error(
      "GET DASHBOARD SUMMARY ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * UPCOMING VIVAS
 *
 * GET /api/dashboard/upcoming
 * ======================================================
 */

export const getUpcomingVivas = async (
  req,
  res,
  next
) => {

  try {

    const rows =
      await getRows(SHEET);

    const today =
      new Date();


    const upcoming =
      rows

        .filter((row) => {

          if (
            !row.ConfirmedVivaDate
          ) {

            return false;

          }

          const vivaDate =
            new Date(
              row.ConfirmedVivaDate
            );

          return (
            !Number.isNaN(
              vivaDate.getTime()
            ) &&
            vivaDate >= today
          );

        })

        .sort(
          (a, b) =>
            new Date(
              a.ConfirmedVivaDate
            ) -
            new Date(
              b.ConfirmedVivaDate
            )
        );


    return res.json({

      success: true,

      total:
        upcoming.length,

      data:
        upcoming,

    });

  } catch (err) {

    console.error(
      "GET UPCOMING VIVAS ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * RECENT VIVAS
 *
 * GET /api/dashboard/recent
 * ======================================================
 */

export const getRecentVivas = async (
  req,
  res,
  next
) => {

  try {

    const rows =
      await getRows(SHEET);


    const recent =
      rows

        .filter(
          (row) =>
            row.ConfirmedVivaDate
        )

        .sort(
          (a, b) =>
            new Date(
              b.ConfirmedVivaDate
            ) -
            new Date(
              a.ConfirmedVivaDate
            )
        )

        .slice(0, 10);


    return res.json({

      success: true,

      total:
        recent.length,

      data:
        recent,

    });

  } catch (err) {

    console.error(
      "GET RECENT VIVAS ERROR:",
      err
    );

    next(err);

  }

};


/**
 * ======================================================
 * REPORT STATISTICS
 *
 * GET /api/dashboard/reports
 * ======================================================
 *
 * IMPORTANT:
 *
 * Do NOT use:
 *
 * row.ReportReceived
 *
 * anymore.
 *
 * Reports are now stored individually:
 *
 * Internal1ReportReceived
 * Internal2ReportReceived
 * External1ReportReceived
 * External2ReportReceived
 *
 * ======================================================
 */

export const getReportStatistics = async (
  req,
  res,
  next
) => {

  try {

    const rows =
      await getRows(SHEET);

    let submitted = 0;

    let pending = 0;


    rows.forEach((row) => {

      const examinerReports =
        getExaminerReports(row);


      examinerReports.forEach(
        (report) => {

          if (
            isReportReceived(
              report.received
            )
          ) {

            submitted++;

          } else {

            pending++;

          }

        }
      );

    });


    return res.json({

      success: true,

      submitted,

      pending,

      total:
        submitted + pending,

    });

  } catch (err) {

    console.error(
      "GET REPORT STATISTICS ERROR:",
      err
    );

    next(err);

  }

};

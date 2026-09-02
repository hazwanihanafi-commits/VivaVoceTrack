import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

export default function PanelResponse() {
  const [searchParams] = useSearchParams();

  const panelID = searchParams.get("panelID");

  const [panel, setPanel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ============================================
  // PANEL RESPONSE
  // ============================================

  const [response, setResponse] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================
  // REPORT UPLOAD
  // ============================================

  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");

  // ============================================
  // LOAD PANEL
  // ============================================

  useEffect(() => {
    if (!panelID) {
      setError("Invalid panel invitation link.");
      setLoading(false);
      return;
    }

    loadPanel();
  }, [panelID]);

  const loadPanel = async () => {
    try {
      setLoading(true);
      setError("");

      const url =
        `${API_BASE_URL}/api/panel/${encodeURIComponent(panelID)}`;

      console.log("Loading panel from:", url);

      const result = await fetch(url);

      const data = await result.json();

      if (!result.ok || !data.success) {
        throw new Error(
          data.message ||
          "Unable to load panel invitation."
        );
      }

      setPanel(data.data);

      setResponse(data.data.Accepted || "");
      setSuggestedDate(data.data.SuggestedDate || "");
      setSuggestedTime(data.data.SuggestedTime || "");
      setRemarks(data.data.Remarks || "");

    } catch (err) {
      console.error(
        "LOAD PANEL ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to load panel invitation."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DEADLINE
  // ============================================

  const getDeadline = () => {
    if (!panel?.ResponseDeadline) {
      return null;
    }

    const deadline =
      new Date(panel.ResponseDeadline);

    if (isNaN(deadline.getTime())) {
      return null;
    }

    return deadline;
  };

  const deadline = getDeadline();

  const isExpired =
    deadline &&
    new Date() > deadline;

  // ============================================
  // DATE FORMAT
  // ============================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-MY",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString(
      "en-MY",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================
  // SUBMIT PANEL RESPONSE
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!response) {
      setError(
        "Please select your response."
      );
      return;
    }

    if (isExpired) {
      setError(
        "The response deadline has passed. Please contact the VivaTrack Secretariat."
      );
      return;
    }

    if (
      response === "Suggest" &&
      (!suggestedDate ||
        !suggestedTime)
    ) {
      setError(
        "Please provide your suggested date and time."
      );
      return;
    }

    try {
      setSubmitting(true);

      const url =
        `${API_BASE_URL}/api/panel/${encodeURIComponent(panelID)}/respond`;

      console.log(
        "Submitting panel response to:",
        url
      );

      const result = await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            response,

            suggestedDate:
              response === "Suggest"
                ? suggestedDate
                : "",

            suggestedTime:
              response === "Suggest"
                ? suggestedTime
                : "",

            remarks,
          }),
        }
      );

      const data =
        await result.json();

      if (
        !result.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Unable to submit your response."
        );
      }

      setPanel(data.data);

      setMessage(
        data.message ||
        "Your response has been recorded successfully."
      );

    } catch (err) {
      console.error(
        "SUBMIT PANEL RESPONSE ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to submit your response."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // REPORT UPLOAD
  // ============================================

  const handleReportUpload = async () => {
    setReportMessage("");
    setReportError("");

    if (!reportFile) {
      setReportError(
        "Please select your report file."
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(
        reportFile.type
      )
    ) {
      setReportError(
        "Only PDF and DOCX files are allowed."
      );
      return;
    }

    // 20 MB
    if (
      reportFile.size >
      20 * 1024 * 1024
    ) {
      setReportError(
        "The maximum file size is 20 MB."
      );
      return;
    }

    if (!panelID) {
      setReportError(
        "Invalid panel ID."
      );
      return;
    }

    try {
      setUploadingReport(true);

      const formData =
        new FormData();

      formData.append(
        "report",
        reportFile
      );

      const url =
        `${API_BASE_URL}/api/reports/panel/${encodeURIComponent(panelID)}/upload`;

      console.log(
        "Uploading report to:",
        url
      );

      const result = await fetch(
        url,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await result.json();

      if (
        !result.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Unable to upload report."
        );
      }

      // Update panel information
      setPanel((previous) => ({
        ...previous,

        ReportReceived:
          "Yes",

        ReportFileName:
          data.data?.ReportFileName ||
          reportFile.name,

        ReportFileURL:
          data.data?.ReportFileURL ||
          "",

        ReportFileID:
          data.data?.ReportFileID ||
          "",

        ReportUploadedDate:
          data.data?.ReportUploadedDate ||
          new Date().toISOString(),
      }));

      setReportMessage(
        data.message ||
        "Your report has been uploaded successfully."
      );

      setReportFile(null);

      // Clear file input
      const input =
        document.getElementById(
          "panel-report-upload"
        );

      if (input) {
        input.value = "";
      }

    } catch (err) {
      console.error(
        "REPORT UPLOAD ERROR:",
        err
      );

      setReportError(
        err.message ||
        "Unable to upload report."
      );

    } finally {
      setUploadingReport(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.loading}>
            Loading Viva Voce invitation...
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // INVALID PANEL
  // ============================================

  if (error && !panel) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <h2 style={styles.title}>
            Viva Voce Invitation
          </h2>

          <div style={styles.error}>
            {error}
          </div>

        </div>
      </div>
    );
  }

  // ============================================
  // MAIN PAGE
  // ============================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* ======================================
            HEADER
        ====================================== */}

        <div style={styles.header}>

          <div style={styles.university}>
            Universiti Sains Malaysia
          </div>

          <div style={styles.department}>
            Pusat Kanser Tun Abdullah Ahmad Badawi
            <br />
            Academic & International Division
          </div>

        </div>

        {/* ======================================
            MAIN CARD
        ====================================== */}

        <div style={styles.card}>

          <h1 style={styles.title}>
            Viva Voce Schedule Confirmation
          </h1>

          <p style={styles.subtitle}>
            Panel Member Response
          </p>

          {/* ====================================
              MESSAGES
          ==================================== */}

          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* ====================================
              PANEL INFORMATION
          ==================================== */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Panel Information
            </h3>

            <div style={styles.infoGrid}>

              <InfoRow
                label="Panel ID"
                value={panel?.PanelID}
              />

              <InfoRow
                label="Role"
                value={panel?.Role}
              />

              <InfoRow
                label="Person Type"
                value={panel?.PersonType}
              />

              <InfoRow
                label="Required"
                value={panel?.Required}
              />

            </div>

          </div>

          {/* ====================================
              VIVA SCHEDULE
          ==================================== */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Viva Voce Schedule
            </h3>

            <div style={styles.infoGrid}>

              <InfoRow
                label="Viva ID"
                value={panel?.VivaID}
              />

              <InfoRow
                label="Proposed Date"
                value={
                  panel?.TentativeVivaDate
                    ? formatDate(
                        panel.TentativeVivaDate
                      )
                    : "-"
                }
              />

              <InfoRow
                label="Time"
                value={
                  panel?.VivaTime ||
                  "-"
                }
              />

              <InfoRow
                label="Venue"
                value={
                  panel?.Venue ||
                  "-"
                }
              />

            </div>

          </div>

          {/* ====================================
              DEADLINE
          ==================================== */}

          <div
            style={{
              ...styles.deadlineBox,

              ...(isExpired
                ? styles.deadlineExpired
                : {}),
            }}
          >

            <strong>
              Response Deadline
            </strong>

            <div
              style={
                styles.deadlineDate
              }
            >
              {deadline
                ? formatDateTime(
                    deadline
                  )
                : "Not specified"}
            </div>

            {isExpired && (
              <div
                style={
                  styles.expiredText
                }
              >
                The response deadline has
                passed.
              </div>
            )}

          </div>

          {/* ====================================
              RESPONSE FORM
          ==================================== */}

          {!isExpired && (
            <form
              onSubmit={handleSubmit}
            >

              <div style={styles.section}>

                <h3
                  style={
                    styles.sectionTitle
                  }
                >
                  Your Response
                </h3>

                {/* YES */}

                <label
                  style={styles.option}
                >

                  <input
                    type="radio"
                    name="response"
                    value="Yes"
                    checked={
                      response === "Yes"
                    }
                    onChange={(e) =>
                      setResponse(
                        e.target.value
                      )
                    }
                  />

                  <span>

                    <strong>
                      I agree
                    </strong>

                    <small>
                      I am available for
                      the proposed Viva
                      Voce schedule.
                    </small>

                  </span>

                </label>

                {/* NO */}

                <label
                  style={styles.option}
                >

                  <input
                    type="radio"
                    name="response"
                    value="No"
                    checked={
                      response === "No"
                    }
                    onChange={(e) =>
                      setResponse(
                        e.target.value
                      )
                    }
                  />

                  <span>

                    <strong>
                      I am unable to attend
                    </strong>

                    <small>
                      I am not available
                      for the proposed
                      schedule.
                    </small>

                  </span>

                </label>

                {/* SUGGEST */}

                <label
                  style={styles.option}
                >

                  <input
                    type="radio"
                    name="response"
                    value="Suggest"
                    checked={
                      response === "Suggest"
                    }
                    onChange={(e) =>
                      setResponse(
                        e.target.value
                      )
                    }
                  />

                  <span>

                    <strong>
                      Suggest another
                      date/time
                    </strong>

                    <small>
                      I would like to
                      suggest an
                      alternative schedule.
                    </small>

                  </span>

                </label>

              </div>

              {/* ==================================
                  SUGGESTED DATE / TIME
              ================================== */}

              {response === "Suggest" && (
                <div
                  style={
                    styles.suggestionBox
                  }
                >

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    Suggested Schedule
                  </h3>

                  <div
                    style={
                      styles.formGroup
                    }
                  >

                    <label>
                      Suggested Date
                    </label>

                    <input
                      type="date"
                      value={
                        suggestedDate
                      }
                      onChange={(e) =>
                        setSuggestedDate(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />

                  </div>

                  <div
                    style={
                      styles.formGroup
                    }
                  >

                    <label>
                      Suggested Time
                    </label>

                    <input
                      type="time"
                      value={
                        suggestedTime
                      }
                      onChange={(e) =>
                        setSuggestedTime(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />

                  </div>

                </div>
              )}

              {/* ==================================
                  REMARKS
              ================================== */}

              <div
                style={
                  styles.formGroup
                }
              >

                <label>
                  Remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(
                      e.target.value
                    )
                  }
                  placeholder="Enter any additional remarks..."
                  rows={4}
                  style={
                    styles.textarea
                  }
                />

              </div>

              {/* ==================================
                  SUBMIT
              ================================== */}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,

                  ...(submitting
                    ? styles.disabledButton
                    : {}),
                }}
              >

                {submitting
                  ? "Submitting..."
                  : "Submit Response"}

              </button>

            </form>
          )}

          {/* ====================================
              EXISTING RESPONSE
          ==================================== */}

          {panel?.ResponseDate && (
            <div
              style={
                styles.responseInfo
              }
            >

              <strong>
                Response submitted:
              </strong>

              <br />

              {formatDateTime(
                panel.ResponseDate
              )}

              <br />

              <strong>
                Response:
              </strong>{" "}

              {panel.Accepted || "-"}

            </div>
          )}

          {/* ====================================
              VIVA VOCE REPORT
          ==================================== */}

          <div style={styles.section}>

            <h3
              style={
                styles.sectionTitle
              }
            >
              Viva Voce Report
            </h3>

            {/* ==================================
                REPORT ALREADY SUBMITTED
            ================================== */}

            {panel?.ReportReceived === "Yes" ? (

              <div
                style={
                  styles.reportSubmittedBox
                }
              >

                <div
                  style={
                    styles.reportSubmittedContent
                  }
                >

                  <div
                    style={
                      styles.reportStatus
                    }
                  >
                    ✓ Report Submitted
                  </div>

                  <div
                    style={
                      styles.reportFileName
                    }
                  >
                    {panel.ReportFileName ||
                      "Report uploaded"}
                  </div>

                  {panel.ReportUploadedDate && (
                    <small
                      style={
                        styles.reportDate
                      }
                    >
                      Uploaded{" "}
                      {formatDateTime(
                        panel.ReportUploadedDate
                      )}
                    </small>
                  )}

                </div>

                {panel.ReportFileURL && (
                  <a
                    href={
                      panel.ReportFileURL
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      styles.viewReportButton
                    }
                  >
                    View Report
                  </a>
                )}

              </div>

            ) : (

              /* ==================================
                  REPORT UPLOAD
              ================================== */

              <div
                style={
                  styles.uploadBox
                }
              >

                <div
                  style={
                    styles.uploadIcon
                  }
                >
                  📄
                </div>

                <h4
                  style={
                    styles.uploadTitle
                  }
                >
                  Upload Viva Voce Report
                </h4>

                <p
                  style={
                    styles.uploadDescription
                  }
                >
                  Please upload your completed
                  Viva Voce report.
                </p>

                <input
                  id="panel-report-upload"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) =>
                    setReportFile(
                      e.target.files?.[0] ||
                      null
                    )
                  }
                  style={
                    styles.fileInput
                  }
                />

                {reportFile && (
                  <div
                    style={
                      styles.selectedFile
                    }
                  >
                    Selected:{" "}

                    <strong>
                      {reportFile.name}
                    </strong>
                  </div>
                )}

                {reportMessage && (
                  <div
                    style={
                      styles.success
                    }
                  >
                    {reportMessage}
                  </div>
                )}

                {reportError && (
                  <div
                    style={
                      styles.error
                    }
                  >
                    {reportError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleReportUpload
                  }
                  disabled={
                    uploadingReport ||
                    !reportFile
                  }
                  style={{
                    ...styles.submitButton,

                    ...(uploadingReport ||
                    !reportFile
                      ? styles.disabledButton
                      : {}),
                  }}
                >

                  {uploadingReport
                    ? "Uploading Report..."
                    : "Upload Report"}

                </button>

                <small
                  style={
                    styles.uploadHint
                  }
                >
                  Accepted formats:
                  PDF or DOCX.
                  <br />
                  Maximum size: 20 MB.
                </small>

              </div>
            )}

          </div>

          {/* ====================================
              FOOTER
          ==================================== */}

          <div
            style={styles.footer}
          >
            VivaTrack Secretariat
            <br />
            Universiti Sains Malaysia
          </div>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// INFO ROW
// ======================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      style={styles.infoRow}
    >

      <div
        style={styles.infoLabel}
      >
        {label}
      </div>

      <div
        style={styles.infoValue}
      >
        {value || "-"}
      </div>

    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "40px 20px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
  },

  university: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#123c69",
  },

  department: {
    marginTop: "8px",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#555",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "35px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    textAlign: "center",
    fontSize: "26px",
    color: "#222",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },

  section: {
    marginTop: "25px",
  },

  sectionTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#333",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
  },

  infoRow: {
    padding: "12px",
    background: "#f7f8fa",
    borderRadius: "6px",
  },

  infoLabel: {
    fontSize: "12px",
    color: "#777",
    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#222",
  },

  deadlineBox: {
    marginTop: "25px",
    padding: "18px",
    borderRadius: "8px",
    background: "#fff8e1",
    border:
      "1px solid #f0d98c",
    textAlign: "center",
  },

  deadlineExpired: {
    background: "#fff0f0",
    border:
      "1px solid #e0a0a0",
  },

  deadlineDate: {
    marginTop: "6px",
    fontSize: "17px",
    fontWeight: "700",
  },

  expiredText: {
    marginTop: "8px",
    color: "#b00020",
    fontWeight: "600",
  },

  option: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "15px",
    marginBottom: "10px",
    border:
      "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },

  suggestionBox: {
    padding: "20px",
    marginTop: "15px",
    background: "#f7f9fc",
    borderRadius: "8px",
  },

  formGroup: {
    marginTop: "20px",
  },

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "7px",
    border:
      "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
  },

  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "7px",
    border:
      "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    resize: "vertical",
  },

  submitButton: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "7px",
    background: "#123c69",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  success: {
    padding: "14px",
    marginTop: "15px",
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#e8f5e9",
    color: "#1b5e20",
    border:
      "1px solid #a5d6a7",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#ffebee",
    color: "#b71c1c",
    border:
      "1px solid #ef9a9a",
  },

  responseInfo: {
    marginTop: "25px",
    padding: "15px",
    background: "#f1f5f9",
    borderRadius: "7px",
    lineHeight: "1.8",
  },

  // ============================================
  // REPORT STYLES
  // ============================================

  uploadBox: {
    padding: "25px",
    border:
      "2px dashed #d5d9e0",
    borderRadius: "10px",
    background: "#fafbfc",
    textAlign: "center",
  },

  uploadIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  uploadTitle: {
    margin: "5px 0",
    fontSize: "18px",
    color: "#333",
  },

  uploadDescription: {
    color: "#666",
    margin:
      "8px 0 20px",
    lineHeight: "1.5",
  },

  fileInput: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    border:
      "1px solid #ddd",
    borderRadius: "7px",
    background: "#fff",
    cursor: "pointer",
  },

  selectedFile: {
    marginTop: "12px",
    padding: "10px",
    background: "#f1f5f9",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#444",
    wordBreak: "break-word",
  },

  uploadHint: {
    display: "block",
    marginTop: "12px",
    color: "#777",
    lineHeight: "1.5",
  },

  reportSubmittedBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "20px",
    border:
      "1px solid #b7dfc0",
    background: "#f1faf3",
    borderRadius: "10px",
  },

  reportSubmittedContent: {
    minWidth: 0,
  },

  reportStatus: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1b7a36",
    marginBottom: "7px",
  },

  reportFileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    wordBreak: "break-word",
  },

  reportDate: {
    display: "block",
    marginTop: "5px",
    color: "#666",
  },

  viewReportButton: {
    flexShrink: 0,
    display: "inline-block",
    padding:
      "10px 16px",
    borderRadius: "7px",
    background: "#123c69",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },

  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#555",
  },

  footer: {
    marginTop: "35px",
    paddingTop: "20px",
    borderTop:
      "1px solid #eee",
    textAlign: "center",
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};

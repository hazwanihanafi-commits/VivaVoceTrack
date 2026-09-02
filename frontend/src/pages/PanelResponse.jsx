import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";

export default function PanelResponse() {
  const [searchParams] = useSearchParams();

  const caseID = searchParams.get("caseID") || "";
  const examinerID = searchParams.get("examinerID") || "";
  const panelIDFromURL = searchParams.get("panelID") || "";

  // ======================================================
  // STATE
  // ======================================================

  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [response, setResponse] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // LOAD PANEL
  // ======================================================

  useEffect(() => {
    loadPanel();
  }, [caseID, examinerID, panelIDFromURL]);

  const loadPanel = async () => {
    try {
      setLoading(true);
      setError("");

      // ==================================================
      // CASE 1
      // Direct Panel ID
      // ==================================================

      if (panelIDFromURL) {
        const url =
          `${API_BASE_URL}/api/panel/${encodeURIComponent(
            panelIDFromURL
          )}`;

        console.log("Loading panel:", url);

        const result = await fetch(url);
        const data = await result.json();

        if (!result.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load panel invitation."
          );
        }

        setPanel(data.data);
        loadExistingResponse(data.data);

        return;
      }

      // ==================================================
      // CASE 2
      // Viva ID + Examiner ID
      // ==================================================

      if (!caseID || !examinerID) {
        throw new Error(
          "Invalid panel invitation link. Case ID and Examiner ID are required."
        );
      }

      const url =
        `${API_BASE_URL}/api/panel/viva/${encodeURIComponent(
          caseID
        )}`;

      console.log("Loading Viva panel:", url);

      const result = await fetch(url);
      const data = await result.json();

      if (!result.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load Viva panel."
        );
      }

      const panelList = Array.isArray(data.data)
        ? data.data
        : [];

      console.log("Panel members:", panelList);

      // ==================================================
      // FIND EXAMINER
      // ==================================================

      const foundPanel = panelList.find((item) => {
        const id =
          item.ExaminerID ||
          item.PanelMemberID ||
          item.PersonID ||
          item.examinerID ||
          "";

        return (
          String(id).trim() ===
          String(examinerID).trim()
        );
      });

      if (!foundPanel) {
        throw new Error(
          `No panel member found for Case ${caseID} and Examiner ${examinerID}.`
        );
      }

      console.log("Found panel:", foundPanel);

      setPanel(foundPanel);
      loadExistingResponse(foundPanel);

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

  // ======================================================
  // LOAD EXISTING RESPONSE
  // ======================================================

  const loadExistingResponse = (data) => {
    setResponse(
      data?.Accepted ||
      data?.Response ||
      ""
    );

    setSuggestedDate(
      data?.SuggestedDate ||
      ""
    );

    setSuggestedTime(
      data?.SuggestedTime ||
      ""
    );

    setRemarks(
      data?.Remarks ||
      ""
    );
  };

  // ======================================================
  // HELPER
  // Supports slightly different Google Sheet headings
  // ======================================================

  const getField = (...fields) => {
    if (!panel) return "";

    for (const field of fields) {
      if (
        panel[field] !== undefined &&
        panel[field] !== null &&
        String(panel[field]).trim() !== ""
      ) {
        return panel[field];
      }
    }

    return "";
  };

  // ======================================================
  // PANEL DATA
  // ======================================================

  const studentName = getField(
    "StudentName",
    "CandidateName",
    "studentName",
    "Candidate",
    "Student"
  );

  const studentID = getField(
    "StudentID",
    "MatricNo",
    "studentID",
    "MatricNumber"
  );

  const programme = getField(
    "Programme",
    "Degree",
    "Program",
    "ProgrammeName"
  );

  const school = getField(
    "School",
    "PusatPengajian",
    "Centre",
    "SchoolCentre"
  );

  const examinerName = getField(
    "ExaminerName",
    "PanelName",
    "PanelMemberName",
    "Examiner",
    "PanelMember",
    "FullName",
    "Name",
    "examinerName"
  );

  const examinerRole = getField(
    "Role",
    "PanelRole",
    "ExaminerRole"
  );

  const personType = getField(
    "PersonType",
    "Type",
    "ExaminerType"
  );

  const vivaID = getField(
    "VivaID",
    "CaseID",
    "caseID"
  ) || caseID;

  const proposedDate = getField(
    "TentativeVivaDate",
    "VivaDate",
    "ProposedDate",
    "TentativeDate",
    "Date"
  );

  const vivaTime = getField(
    "VivaTime",
    "Time",
    "ProposedTime"
  );

  const venue = getField(
    "Venue",
    "VivaVenue",
    "Location"
  );

  const vivaMode = getField(
    "VivaMode",
    "Mode",
    "VivaType"
  );

  const responseDeadline = getField(
    "ResponseDeadline",
    "Deadline",
    "ResponseDueDate"
  );

  // ======================================================
  // DEADLINE
  // ======================================================

  const getDeadline = () => {
    if (!responseDeadline) {
      return null;
    }

    const deadline = new Date(
      responseDeadline
    );

    if (isNaN(deadline.getTime())) {
      return null;
    }

    return deadline;
  };

  const deadline = getDeadline();

  const isExpired =
    deadline &&
    new Date() > deadline;

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "-";

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

  // ======================================================
  // FORMAT DATE TIME
  // ======================================================

  const formatDateTime = (date) => {
    if (!date) return "-";

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

  // ======================================================
  // SUBMIT RESPONSE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // --------------------------------------------------
    // Validate response
    // --------------------------------------------------

    if (!response) {
      setError(
        "Please select your response."
      );
      return;
    }

    // --------------------------------------------------
    // Validate deadline
    // --------------------------------------------------

    if (isExpired) {
      setError(
        "The response deadline has passed. Please contact the VivaTrack Secretariat."
      );
      return;
    }

    // --------------------------------------------------
    // Validate suggested date/time
    // --------------------------------------------------

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

      const actualPanelID =
        panel?.PanelID ||
        panel?.panelID ||
        panelIDFromURL;

      if (!actualPanelID) {
        throw new Error(
          "Panel ID could not be determined."
        );
      }

      const url =
        `${API_BASE_URL}/api/panel/${encodeURIComponent(
          actualPanelID
        )}/respond`;

      console.log(
        "Submitting response:",
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

      if (data.data) {
        setPanel(data.data);
      } else {
        setPanel((previous) => ({
          ...previous,

          Accepted:
            response,

          ResponseDate:
            new Date().toISOString(),

          SuggestedDate:
            response === "Suggest"
              ? suggestedDate
              : "",

          SuggestedTime:
            response === "Suggest"
              ? suggestedTime
              : "",

          Remarks:
            remarks,
        }));
      }

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

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !panel) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>

            <h2 style={styles.title}>
              Viva Voce Invitation
            </h2>

            <div style={styles.error}>
              {error}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* ==================================================
            HEADER
        ================================================== */}

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


        {/* ==================================================
            CARD
        ================================================== */}

        <div style={styles.card}>

          <h1 style={styles.title}>
            Viva Voce Schedule Confirmation
          </h1>

          <p style={styles.subtitle}>
            Panel Member Response
          </p>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}


          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {/* ==================================================
              CANDIDATE INFORMATION
          ================================================== */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Candidate Information
            </h3>

            <div style={styles.infoGrid}>

              <InfoRow
                label="Student Name"
                value={studentName}
              />

              <InfoRow
                label="Matric No."
                value={studentID}
              />

              <InfoRow
                label="Programme"
                value={programme}
              />

              <InfoRow
                label="School / Centre"
                value={school}
              />

            </div>

          </div>


          {/* ==================================================
              EXAMINER INFORMATION
          ================================================== */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Panel Information
            </h3>

            <div style={styles.infoGrid}>

              <InfoRow
                label="Examiner Name"
                value={examinerName}
              />

              <InfoRow
                label="Examiner ID"
                value={
                  getField(
                    "ExaminerID",
                    "PanelMemberID",
                    "PersonID",
                    "examinerID"
                  ) || examinerID
                }
              />

              <InfoRow
                label="Role"
                value={examinerRole}
              />

              <InfoRow
                label="Person Type"
                value={personType}
              />

            </div>

          </div>


          {/* ==================================================
              VIVA INFORMATION
          ================================================== */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Viva Voce Schedule
            </h3>

            <div style={styles.infoGrid}>

              <InfoRow
                label="Viva ID"
                value={vivaID}
              />

              <InfoRow
                label="Proposed Date"
                value={
                  proposedDate
                    ? formatDate(
                        proposedDate
                      )
                    : "-"
                }
              />

              <InfoRow
                label="Time"
                value={vivaTime}
              />

              <InfoRow
                label="Venue"
                value={venue}
              />

              <InfoRow
                label="Mode"
                value={vivaMode}
              />

            </div>

          </div>


          {/* ==================================================
              RESPONSE DEADLINE
          ================================================== */}

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

            <div style={styles.deadlineDate}>

              {deadline
                ? formatDateTime(
                    deadline
                  )
                : "Not specified"}

            </div>

            {isExpired && (
              <div style={styles.expiredText}>
                The response deadline has passed.
              </div>
            )}

          </div>


          {/* ==================================================
              RESPONSE FORM
          ================================================== */}

          {!isExpired && (

            <form onSubmit={handleSubmit}>

              <div style={styles.section}>

                <h3 style={styles.sectionTitle}>
                  Your Response
                </h3>


                {/* ==========================================
                    AGREE
                ========================================== */}

                <label style={styles.option}>

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

                  <span style={styles.optionText}>

                    <strong>
                      I agree
                    </strong>

                    <small>
                      I am available for the proposed
                      Viva Voce schedule.
                    </small>

                  </span>

                </label>


                {/* ==========================================
                    UNABLE TO ATTEND
                ========================================== */}

                <label style={styles.option}>

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

                  <span style={styles.optionText}>

                    <strong>
                      I am unable to attend
                    </strong>

                    <small>
                      I am not available for the proposed
                      schedule.
                    </small>

                  </span>

                </label>


                {/* ==========================================
                    SUGGEST
                ========================================== */}

                <label style={styles.option}>

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

                  <span style={styles.optionText}>

                    <strong>
                      Suggest another date/time
                    </strong>

                    <small>
                      I would like to suggest an alternative
                      schedule.
                    </small>

                  </span>

                </label>

              </div>


              {/* ==================================================
                  SUGGESTED SCHEDULE
              ================================================== */}

              {response === "Suggest" && (

                <div style={styles.suggestionBox}>

                  <h3 style={styles.sectionTitle}>
                    Suggested Schedule
                  </h3>


                  <div style={styles.formGroup}>

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
                      style={styles.input}
                    />

                  </div>


                  <div style={styles.formGroup}>

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
                      style={styles.input}
                    />

                  </div>

                </div>

              )}


              {/* ==================================================
                  REMARKS
              ================================================== */}

              <div style={styles.formGroup}>

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
                  style={styles.textarea}
                />

              </div>


              {/* ==================================================
                  SUBMIT
              ================================================== */}

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


          {/* ==================================================
              PREVIOUS RESPONSE
          ================================================== */}

          {panel?.ResponseDate && (

            <div style={styles.responseInfo}>

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


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div style={styles.footer}>

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
    <div style={styles.infoRow}>

      <div style={styles.infoLabel}>
        {label}
      </div>

      <div style={styles.infoValue}>
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
    wordBreak: "break-word",
  },

  deadlineBox: {
    marginTop: "25px",
    padding: "18px",
    borderRadius: "8px",
    background: "#fff8e1",
    border: "1px solid #f0d98c",
    textAlign: "center",
  },

  deadlineExpired: {
    background: "#fff0f0",
    border: "1px solid #e0a0a0",
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
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },

  optionText: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
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
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
  },

  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "7px",
    border: "1px solid #ccc",
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
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#e8f5e9",
    color: "#1b5e20",
    border: "1px solid #a5d6a7",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#ffebee",
    color: "#b71c1c",
    border: "1px solid #ef9a9a",
  },

  responseInfo: {
    marginTop: "25px",
    padding: "15px",
    background: "#f1f5f9",
    borderRadius: "7px",
    lineHeight: "1.8",
  },

  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#555",
  },

  footer: {
    marginTop: "35px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
    textAlign: "center",
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};

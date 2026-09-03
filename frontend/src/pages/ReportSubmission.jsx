import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";


export default function ReportSubmission() {

  const [
    searchParams,
  ] = useSearchParams();


  const caseID =
    searchParams.get(
      "caseID"
    );

  const examinerID =
    searchParams.get(
      "examinerID"
    );


  const [
    info,
    setInfo,
  ] = useState(null);


  const [
    file,
    setFile,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  /**
   * ====================================================
   * BACKEND URL
   * ====================================================
   */
  const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";


  /**
   * ====================================================
   * LOAD SUBMISSION INFO
   * ====================================================
   */
  useEffect(() => {

    async function loadInfo() {

      try {

        setLoading(true);
        setError("");

        if (
          !caseID ||
          !examinerID
        ) {
          throw new Error(
            "Invalid report submission link."
          );
        }


        const response =
          await fetch(
            `${API}/api/reports/submit-info?caseID=${encodeURIComponent(
              caseID
            )}&examinerID=${encodeURIComponent(
              examinerID
            )}`
          );


        const result =
          await response.json();


        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
            "Unable to load report submission information."
          );
        }


        setInfo({
  CaseID:
    result.case?.CaseID || "",

  Role:
    result.examiner?.ExaminerType || "",

  PersonID:
    result.examiner?.ExaminerID || "",

  ExaminerName:
    result.examiner?.ExaminerName || "",

  ReportDueDate:
    result.case?.ReportDueDate || "",

  ReportReceived:
    result.report?.status || "Not Submitted",

  ReportReceivedDate:
    result.report?.date || "",

  ReportFileName:
    result.report?.fileName || "",

  ReportFileURL:
    result.report?.fileURL || "",
});

      }

      catch (err) {

        console.error(
          err
        );

        setError(
          err.message
        );

      }

      finally {

        setLoading(false);

      }

    }


    loadInfo();

  }, [
    caseID,
    examinerID,
  ]);


  /**
   * ====================================================
   * FILE SELECT
   * ====================================================
   */
  function handleFileChange(
    event
  ) {

    const selected =
      event.target.files?.[0];


    if (!selected) {
      setFile(null);
      return;
    }


    const allowedTypes = [
      "application/pdf",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];


    if (
      !allowedTypes.includes(
        selected.type
      )
    ) {

      setError(
        "Only PDF and DOCX files are allowed."
      );

      setFile(null);

      return;
    }


    if (
      selected.size >
      20 * 1024 * 1024
    ) {

      setError(
        "File size must not exceed 20 MB."
      );

      setFile(null);

      return;
    }


    setError("");

    setMessage("");

    setFile(
      selected
    );

  }


  /**
   * ====================================================
   * SUBMIT REPORT
   * ====================================================
   */
  async function handleSubmit(event) {
  event.preventDefault();

  if (!file) {
    setError(
      "Please select your report file."
    );
    return;
  }

  if (!caseID || !examinerID) {
    setError(
      "Invalid report submission link."
    );
    return;
  }

  try {
    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();

    formData.append(
      "report",
      file
    );

    formData.append(
      "caseID",
      caseID
    );

    formData.append(
      "examinerID",
      examinerID
    );

    const response = await fetch(
      `${API}/api/reports/submit`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
        "Report upload failed."
      );
    }

    setMessage(
      "Your report has been submitted successfully."
    );

    /**
     * Update screen immediately
     */
    setInfo((previous) => ({
      ...previous,

      ReportReceived:
        "Yes",

      ReportReceivedDate:
        result.data
          ?.ReportUploadedDate ||
        new Date().toISOString(),

      ReportFileName:
        result.data
          ?.ReportFileName ||
        file.name,

      ReportFileURL:
        result.data
          ?.ReportFileURL ||
        "",
    }));

    setFile(null);

  } catch (err) {

    console.error(
      "SUBMIT REPORT ERROR:",
      err
    );

    setError(
      err.message
    );

  } finally {

    setUploading(false);

  }
} 
  
  /**
   * ====================================================
   * LOADING
   * ====================================================
   */
  if (loading) {

    return (
      <div
        style={{
          maxWidth:
            "700px",
          margin:
            "60px auto",
          padding:
            "30px",
          textAlign:
            "center",
        }}
      >

        <h2>
          Loading...
        </h2>

        <p>
          Please wait.
        </p>

      </div>
    );

  }


  /**
   * ====================================================
   * ERROR
   * ====================================================
   */
  if (error && !info) {

    return (
      <div
        style={{
          maxWidth:
            "700px",
          margin:
            "60px auto",
          padding:
            "30px",
        }}
      >

        <h2>
          Report Submission
        </h2>

        <div
          style={{
            padding:
              "15px",
            border:
              "1px solid #dc3545",
            borderRadius:
              "8px",
          }}
        >
          {error}
        </div>

      </div>
    );

  }


  /**
   * ====================================================
   * ALREADY SUBMITTED
   * ====================================================
   */
  const alreadySubmitted =
    String(
      info?.ReportReceived ||
      ""
    )
      .trim()
      .toLowerCase() ===
    "yes";


  return (

    <div
      style={{
        maxWidth:
          "700px",

        margin:
          "50px auto",

        padding:
          "30px",

        fontFamily:
          "Arial, sans-serif",
      }}
    >

      <h1>
        VivaTrack
      </h1>

      <h2>
        Examiner Report Submission
      </h2>


      <div
        style={{
          marginTop:
            "20px",

          padding:
            "20px",

          border:
            "1px solid #ddd",

          borderRadius:
            "10px",
        }}
      >

        <p>
          <strong>
            Case ID:
          </strong>{" "}
          {info?.CaseID}
        </p>


        <p>
          <strong>
            Role:
          </strong>{" "}
          {info?.Role}
        </p>


        <p>
          <strong>
            Examiner ID:
          </strong>{" "}
          {info?.PersonID}
        </p>


        <p>
          <strong>
            Report Due Date:
          </strong>{" "}
          {info?.ReportDueDate ||
            "Not specified"}
        </p>

      </div>


      {/* =================================================
          ALREADY SUBMITTED
          ================================================= */}
      {alreadySubmitted ? (

        <div
          style={{
            marginTop:
              "25px",

            padding:
              "20px",

            border:
              "1px solid #28a745",

            borderRadius:
              "10px",
          }}
        >

          <h3>
            Report Already Submitted
          </h3>


          <p>
            Your report has already been
            received by VivaTrack.
          </p>


          {info?.ReportFileName && (
            <p>
              <strong>
                File:
              </strong>{" "}
              {info.ReportFileName}
            </p>
          )}


          {info?.ReportFileURL && (

            <p>

              <a
                href={
                  info.ReportFileURL
                }
                target="_blank"
                rel="noreferrer"
              >
                View Uploaded Report
              </a>

            </p>

          )}

        </div>

      ) : (

        /* =================================================
           SUBMISSION FORM
           ================================================= */

        <form
          onSubmit={
            handleSubmit
          }
          style={{
            marginTop:
              "25px",
          }}
        >

          <label
            style={{
              display:
                "block",

              fontWeight:
                "bold",

              marginBottom:
                "10px",
            }}
          >
            Upload Examiner Report
          </label>


          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={
              handleFileChange
            }
          />


          <p
            style={{
              fontSize:
                "14px",
              color:
                "#666",
            }}
          >
            Accepted formats:
            PDF or DOCX.
            Maximum size:
            20 MB.
          </p>


          {file && (

            <p>
              Selected:
              {" "}
              <strong>
                {file.name}
              </strong>
            </p>

          )}


          {error && (

            <div
              style={{
                marginTop:
                  "15px",

                padding:
                  "12px",

                border:
                  "1px solid #dc3545",

                borderRadius:
                  "8px",
              }}
            >
              {error}
            </div>

          )}


          {message && (

            <div
              style={{
                marginTop:
                  "15px",

                padding:
                  "12px",

                border:
                  "1px solid #28a745",

                borderRadius:
                  "8px",
              }}
            >
              {message}
            </div>

          )}


          <button
            type="submit"
            disabled={
              uploading ||
              !file
            }
            style={{
              marginTop:
                "20px",

              padding:
                "12px 25px",

              cursor:
                uploading
                  ? "wait"
                  : "pointer",
            }}
          >

            {uploading
              ? "Uploading..."
              : "Submit Report"}

          </button>

        </form>

      )}

    </div>

  );

}

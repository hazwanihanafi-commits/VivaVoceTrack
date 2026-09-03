import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";


const API =
  import.meta.env.VITE_API_URL ||
  "https://vivatrack-backend.onrender.com";


export default function AnnotatedThesis() {

  const [
    searchParams,
  ] = useSearchParams();


  const caseID =
    searchParams.get("caseID");

  const examinerID =
    searchParams.get("examinerID");


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
   * LOAD INFORMATION
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
            "Invalid annotated thesis submission link."
          );

        }


        const response =
          await fetch(
            `${API}/api/annotated-thesis/submit-info?caseID=${encodeURIComponent(
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
            "Unable to load submission information."
          );

        }


        setInfo({

          CaseID:
            result.case?.CaseID || "",

          StudentID:
            result.case?.StudentID || "",

          StudentName:
            result.student?.StudentName || "",

          MatricNo:
            result.student?.MatricNo || "",

          Programme:
            result.student?.Programme || "",

          School:
            result.student?.School || "",

          ThesisTitle:
            result.student?.ThesisTitle || "",

          ExaminerID:
            result.examiner?.ExaminerID || "",

          ExaminerName:
            result.examiner?.ExaminerName || "",

          ExaminerType:
            result.examiner?.ExaminerType || "",

          AnnotatedThesisReceived:
            result.annotatedThesis?.status ||
            "Not Submitted",

          AnnotatedThesisDate:
            result.annotatedThesis?.date || "",

          AnnotatedThesisFileName:
            result.annotatedThesis?.fileName || "",

          AnnotatedThesisFileURL:
            result.annotatedThesis?.fileURL || "",

        });

      } catch (err) {

        console.error(
          "LOAD ANNOTATED THESIS ERROR:",
          err
        );

        setError(
          err.message
        );

      } finally {

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
   * FILE SELECTION
   * ====================================================
   */

  function handleFileChange(event) {

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

    setFile(selected);

  }


  /**
   * ====================================================
   * SUBMIT
   * ====================================================
   */

  async function handleSubmit(event) {

    event.preventDefault();


    if (!file) {

      setError(
        "Please select your annotated thesis file."
      );

      return;

    }


    if (
      !caseID ||
      !examinerID
    ) {

      setError(
        "Invalid submission link."
      );

      return;

    }


    try {

      setUploading(true);

      setError("");

      setMessage("");


      const formData =
        new FormData();


      formData.append(
        "thesis",
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


      const response =
        await fetch(
          `${API}/api/annotated-thesis/submit`,
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
          "Annotated thesis upload failed."
        );

      }


      /**
       * ================================================
       * SUCCESS
       * ================================================
       */

      setMessage(
        "Your annotated thesis has been submitted successfully."
      );


      setInfo((previous) => ({

        ...previous,

        AnnotatedThesisReceived:
          "Yes",

        AnnotatedThesisDate:
          result.data
            ?.AnnotatedThesisUploadedDate ||
          new Date().toISOString(),

        AnnotatedThesisFileName:
          result.data
            ?.AnnotatedThesisFileName ||
          file.name,

        AnnotatedThesisFileURL:
          result.data
            ?.AnnotatedThesisFileURL ||
          "",

      }));


      setFile(null);

    } catch (err) {

      console.error(
        "SUBMIT ANNOTATED THESIS ERROR:",
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
          maxWidth: "700px",
          margin: "60px auto",
          padding: "30px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
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
   * ERROR WITHOUT INFO
   * ====================================================
   */

  if (
    error &&
    !info
  ) {

    return (

      <div
        style={{
          maxWidth: "700px",
          margin: "60px auto",
          padding: "30px",
          fontFamily: "Arial, sans-serif",
        }}
      >

        <h2>
          Annotated Thesis Submission
        </h2>


        <div
          style={{
            padding: "15px",
            border: "1px solid #dc3545",
            borderRadius: "8px",
          }}
        >

          {error}

        </div>

      </div>

    );

  }


  /**
   * ====================================================
   * CHECK SUBMITTED
   * ====================================================
   */

  const alreadySubmitted =
    String(
      info?.AnnotatedThesisReceived ||
      ""
    )
      .trim()
      .toLowerCase() ===
    "yes";


  /**
   * ====================================================
   * PAGE
   * ====================================================
   */

  return (

    <div
      style={{
        maxWidth: "800px",
        margin: "50px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >

      <h1>
        VivaTrack
      </h1>


      <h2>
        Annotated Thesis Submission
      </h2>


      {/* =================================================
          STUDENT / CASE INFORMATION
          ================================================= */}

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
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
            Student:
          </strong>{" "}
          {info?.StudentName}
        </p>


        <p>
          <strong>
            Matric No:
          </strong>{" "}
          {info?.MatricNo}
        </p>


        <p>
          <strong>
            Programme:
          </strong>{" "}
          {info?.Programme}
        </p>


        <p>
          <strong>
            School:
          </strong>{" "}
          {info?.School}
        </p>


        <p>
          <strong>
            Examiner:
          </strong>{" "}
          {info?.ExaminerName}
        </p>


        <p>
          <strong>
            Examiner ID:
          </strong>{" "}
          {info?.ExaminerID}
        </p>


        <p>
          <strong>
            Examiner Type:
          </strong>{" "}
          {info?.ExaminerType}
        </p>


        <p>
          <strong>
            Thesis Title:
          </strong>{" "}
          {info?.ThesisTitle}
        </p>

      </div>


      {/* =================================================
          ALREADY SUBMITTED
          ================================================= */}

      {alreadySubmitted ? (

        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            border: "1px solid #28a745",
            borderRadius: "10px",
          }}
        >

          <h3>
            Annotated Thesis Already Submitted
          </h3>


          <p>
            Your annotated thesis has already
            been received by VivaTrack.
          </p>


          {info?.AnnotatedThesisFileName && (

            <p>

              <strong>
                File:
              </strong>{" "}

              {info.AnnotatedThesisFileName}

            </p>

          )}


          {info?.AnnotatedThesisDate && (

            <p>

              <strong>
                Submitted:
              </strong>{" "}

              {new Date(
                info.AnnotatedThesisDate
              ).toLocaleString()}

            </p>

          )}


          {info?.AnnotatedThesisFileURL && (

            <p>

              <a
                href={
                  info.AnnotatedThesisFileURL
                }
                target="_blank"
                rel="noreferrer"
              >
                View Uploaded Annotated Thesis
              </a>

            </p>

          )}

        </div>

      ) : (

        /* =================================================
           UPLOAD FORM
           ================================================= */

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "25px",
          }}
        >

          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >

            Upload Annotated Thesis

          </label>


          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
          />


          <p
            style={{
              fontSize: "14px",
              color: "#666",
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
                marginTop: "15px",
                padding: "12px",
                border: "1px solid #dc3545",
                borderRadius: "8px",
              }}
            >

              {error}

            </div>

          )}


          {message && (

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                border: "1px solid #28a745",
                borderRadius: "8px",
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
              marginTop: "20px",
              padding: "12px 25px",
              cursor:
                uploading
                  ? "wait"
                  : "pointer",
            }}
          >

            {uploading
              ? "Uploading..."
              : "Submit Annotated Thesis"}

          </button>

        </form>

      )}

    </div>

  );

}

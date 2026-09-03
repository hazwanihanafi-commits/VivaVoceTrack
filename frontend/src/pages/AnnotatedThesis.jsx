import { useSearchParams } from "react-router-dom";

export default function AnnotatedThesis() {
  const [searchParams] = useSearchParams();

  const caseID = searchParams.get("caseID");
  const examinerID = searchParams.get("examinerID");

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>VivaTrack</h1>

      <h2>Annotated Thesis Submission</h2>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <p>
          <strong>Case ID:</strong>{" "}
          {caseID}
        </p>

        <p>
          <strong>Examiner ID:</strong>{" "}
          {examinerID}
        </p>
      </div>

      <div style={{ marginTop: "25px" }}>
        <h3>Upload Annotated Thesis</h3>

        <input
          type="file"
          accept=".pdf,.docx"
        />

        <br />

        <button
          style={{
            marginTop: "20px",
            padding: "12px 25px",
          }}
        >
          Submit Annotated Thesis
        </button>
      </div>
    </div>
  );
}

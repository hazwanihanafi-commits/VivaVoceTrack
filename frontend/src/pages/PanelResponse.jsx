import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API = "https://vivatrack-backend.onrender.com/api";

export default function PanelResponse() {
  const [searchParams] = useSearchParams();

  const panelID = searchParams.get("panelID");

  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [response, setResponse] = useState("Accept");

  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!panelID) {
      setError("Invalid panel invitation.");
      setLoading(false);
      return;
    }

    loadPanel();
  }, [panelID]);

  async function loadPanel() {
    try {
      const res = await fetch(
        `${API}/panel/${encodeURIComponent(panelID)}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load panel invitation.");
        return;
      }

      setPanel(data.data);

      if (data.data?.Accepted === "Accepted") {
        setResponse("Accept");
      }

    } catch (err) {
      console.error(err);
      setError("Unable to connect to VivaTrack server.");
    } finally {
      setLoading(false);
    }
  }

  async function submitResponse(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!panelID) {
      setError("Invalid panel invitation.");
      return;
    }

    if (response === "Cannot Attend") {

      if (!suggestedDate) {
        setError("Please suggest an alternative date.");
        return;
      }

      if (!suggestedTime) {
        setError("Please suggest an alternative time.");
        return;
      }
    }

    try {

      setSubmitting(true);

      const res = await fetch(
        `${API}/panel/${encodeURIComponent(panelID)}/respond`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Accepted: response === "Accept"
              ? "Accepted"
              : "Cannot Attend",

            SuggestedDate:
              response === "Cannot Attend"
                ? suggestedDate
                : "",

            SuggestedTime:
              response === "Cannot Attend"
                ? suggestedTime
                : "",

            Remarks: remarks,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
          "Unable to submit your response."
        );
        return;
      }

      setMessage(
        "Thank you. Your Viva panel response has been recorded."
      );

      await loadPanel();

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to VivaTrack server."
      );

    } finally {

      setSubmitting(false);

    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl bg-white p-8 shadow">
          Loading Viva invitation...
        </div>
      </div>
    );
  }

  if (error && !panel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">

          <h1 className="mb-3 text-xl font-bold text-red-600">
            Viva Invitation
          </h1>

          <p className="text-gray-600">
            {error}
          </p>

        </div>
      </div>
    );
  }

  if (!panel) return null;

  const alreadyResponded =
    panel.Accepted === "Accepted" ||
    panel.Accepted === "Cannot Attend";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="mb-6 text-center">

          <h1 className="text-3xl font-bold text-gray-900">
            VivaTrack
          </h1>

          <p className="mt-2 text-gray-500">
            Viva Examination Panel Response
          </p>

        </div>


        {/* Main Card */}

        <div className="rounded-2xl bg-white p-8 shadow">

          {/* Viva Information */}

          <div className="mb-6 rounded-xl bg-purple-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              Viva Case
            </p>

            <h2 className="mt-1 text-xl font-bold text-purple-900">
              {panel.CaseID || panel.VivaID}
            </h2>

          </div>


          {/* Panel Information */}

          <div className="mb-8">

            <h3 className="mb-4 text-lg font-semibold">
              Panel Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Info
                label="Name"
                value={
                  panel.PersonName ||
                  panel.ExaminerName ||
                  panel.StaffName ||
                  ""
                }
              />

              <Info
                label="Role"
                value={panel.Role}
              />

            </div>

          </div>


          {/* Viva Information */}

          <div className="mb-8">

            <h3 className="mb-4 text-lg font-semibold">
              Viva Examination
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Info
                label="Student"
                value={panel.StudentName}
              />

              <Info
                label="Programme"
                value={panel.Programme}
              />

              <Info
                label="Tentative Viva Date"
                value={panel.TentativeVivaDate}
              />

              <Info
                label="Viva Time"
                value={panel.VivaTime}
              />

              <Info
                label="Mode"
                value={panel.VivaMode}
              />

              <Info
                label="Venue"
                value={panel.Venue}
              />

            </div>

            {panel.VivaMode !== "Physical" &&
              panel.MeetingLink && (
                <div className="mt-4">

                  <a
                    href={panel.MeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                  >
                    Join Meeting
                  </a>

                </div>
              )}

          </div>


          {/* Thesis */}

          {panel.ThesisTitle && (
            <div className="mb-8">

              <h3 className="mb-2 text-lg font-semibold">
                Thesis Title
              </h3>

              <div className="rounded-xl border bg-gray-50 p-4 text-gray-700">
                {panel.ThesisTitle}
              </div>

            </div>
          )}


          {/* Response */}

          <form onSubmit={submitResponse}>

            <h3 className="mb-4 text-lg font-semibold">
              Your Response
            </h3>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Accept */}

              <button
                type="button"
                disabled={alreadyResponded}
                onClick={() => setResponse("Accept")}
                className={`rounded-xl border-2 p-5 text-left ${
                  response === "Accept"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >

                <div className="text-lg font-bold text-green-700">
                  ✓ Accept
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  I am available for this Viva.
                </p>

              </button>


              {/* Cannot Attend */}

              <button
                type="button"
                disabled={alreadyResponded}
                onClick={() =>
                  setResponse("Cannot Attend")
                }
                className={`rounded-xl border-2 p-5 text-left ${
                  response === "Cannot Attend"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >

                <div className="text-lg font-bold text-red-700">
                  ✕ Cannot Attend
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  I need another date/time.
                </p>

              </button>

            </div>


            {/* Alternative date */}

            {response === "Cannot Attend" && (
              <div className="mt-6 rounded-xl bg-orange-50 p-5">

                <h4 className="font-semibold text-orange-800">
                  Suggest an Alternative
                </h4>

                <p className="mt-1 text-sm text-orange-700">
                  Please suggest a suitable date and time.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Suggested Date
                    </label>

                    <input
                      type="date"
                      value={suggestedDate}
                      onChange={(e) =>
                        setSuggestedDate(e.target.value)
                      }
                      disabled={alreadyResponded}
                      className="w-full rounded-xl border p-3"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Suggested Time
                    </label>

                    <input
                      type="time"
                      value={suggestedTime}
                      onChange={(e) =>
                        setSuggestedTime(e.target.value)
                      }
                      disabled={alreadyResponded}
                      className="w-full rounded-xl border p-3"
                    />

                  </div>

                </div>

              </div>
            )}


            {/* Remarks */}

            <div className="mt-6">

              <label className="mb-2 block font-medium">
                Remarks
              </label>

              <textarea
                rows={4}
                value={remarks}
                onChange={(e) =>
                  setRemarks(e.target.value)
                }
                disabled={alreadyResponded}
                placeholder="Optional comments..."
                className="w-full rounded-xl border p-3"
              />

            </div>


            {/* Error */}

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* Success */}

            {message && (
              <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}


            {/* Submit */}

            {!alreadyResponded && (
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-purple-600 px-6 py-4 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Response"}
              </button>
            )}


            {/* Existing response */}

            {alreadyResponded && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5 text-center">

                <p className="font-semibold">
                  Response Recorded
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Your response has already been submitted.
                </p>

              </div>
            )}

          </form>

        </div>

      </div>

    </div>
  );
}


/* ======================================================
   INFO COMPONENT
====================================================== */

function Info({ label, value }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-800">
        {value || "—"}
      </p>

    </div>
  );
}

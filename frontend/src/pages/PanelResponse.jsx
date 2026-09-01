import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API =
  "https://vivatrack-backend.onrender.com/api";

export default function PanelResponse() {

  const [searchParams] = useSearchParams();

  const panelID =
    searchParams.get("panelID");

  const [panel, setPanel] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [response, setResponse] =
    useState("");

  const [suggestedDate, setSuggestedDate] =
    useState("");

  const [suggestedTime, setSuggestedTime] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /**
   * ================================================
   * LOAD PANEL INVITATION
   * ================================================
   */

  useEffect(() => {

    if (!panelID) {
      setError(
        "Invalid panel invitation."
      );

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

        setError(
          data.message ||
          "Unable to load invitation."
        );

        return;
      }

      setPanel(data.data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to VivaTrack."
      );

    } finally {

      setLoading(false);

    }
  }


  /**
   * ================================================
   * SUBMIT RESPONSE
   * ================================================
   */

  async function submitResponse() {

    setError("");
    setMessage("");

    if (!response) {

      setError(
        "Please select your response."
      );

      return;
    }

    if (
      response === "Suggest" &&
      (!suggestedDate || !suggestedTime)
    ) {

      setError(
        "Please provide your suggested date and time."
      );

      return;
    }

    try {

      setSubmitting(true);

      const res = await fetch(
        `${API}/panel/${encodeURIComponent(panelID)}/respond`,
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

      const data = await res.json();

      if (!res.ok) {

        setError(
          data.message ||
          "Unable to submit response."
        );

        return;
      }

      setMessage(
        data.message ||
        "Response submitted successfully."
      );

      setPanel(data.data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to VivaTrack."
      );

    } finally {

      setSubmitting(false);

    }
  }


  /**
   * ================================================
   * LOADING
   * ================================================
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="rounded-2xl bg-white p-8 shadow">

          <p className="text-gray-600">
            Loading Viva Voce invitation...
          </p>

        </div>

      </div>
    );
  }


  /**
   * ================================================
   * ERROR
   * ================================================
   */

  if (error && !panel) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow">

          <h1 className="mb-4 text-2xl font-bold text-red-600">
            VivaTrack
          </h1>

          <p className="text-gray-700">
            {error}
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        {/* HEADER */}

        <div className="mb-6 text-center">

          <h1 className="text-2xl font-bold">
            Universiti Sains Malaysia
          </h1>

          <p className="text-gray-600">
            Pusat Kanser Tun Abdullah Ahmad Badawi
            (PKTAAB)
          </p>

          <p className="text-gray-600">
            Academic & International Division
          </p>

        </div>


        {/* CARD */}

        <div className="rounded-2xl bg-white p-8 shadow">

          <h2 className="mb-2 text-2xl font-bold">
            Viva Voce Schedule Invitation
          </h2>

          <p className="mb-6 text-gray-600">
            Dear Panel Member,
          </p>


          {/* ROLE */}

          <div className="mb-6 rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
              Your Role
            </p>

            <p className="text-lg font-semibold">
              {panel?.Role}
            </p>

          </div>


          {/* DETAILS */}

          <div className="mb-6 space-y-3">

            <div className="flex justify-between border-b pb-2">

              <span className="font-medium">
                Viva Case
              </span>

              <span>
                {panel?.VivaID}
              </span>

            </div>

            <div className="flex justify-between border-b pb-2">

              <span className="font-medium">
                Proposed Date
              </span>

              <span>
                {panel?.ProposedDate ||
                  panel?.TentativeVivaDate ||
                  "Please refer to invitation"}
              </span>

            </div>

            <div className="flex justify-between border-b pb-2">

              <span className="font-medium">
                Proposed Time
              </span>

              <span>
                {panel?.ProposedTime ||
                  panel?.SuggestedTime ||
                  "-"}
              </span>

            </div>

          </div>


          {/* CURRENT RESPONSE */}

          {panel?.Accepted &&
            panel.Accepted !== "Pending" && (

            <div className="mb-6 rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                Your Current Response
              </p>

              <p className="font-semibold">
                {panel.Accepted}
              </p>

              {panel.SuggestedDate && (
                <p className="mt-2 text-sm">
                  Suggested Date:{" "}
                  {panel.SuggestedDate}
                </p>
              )}

              {panel.SuggestedTime && (
                <p className="text-sm">
                  Suggested Time:{" "}
                  {panel.SuggestedTime}
                </p>
              )}

            </div>

          )}


          {/* SUCCESS */}

          {message && (

            <div className="mb-6 rounded-xl bg-green-50 p-4 text-green-700">

              {message}

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">

              {error}

            </div>

          )}


          {/* RESPONSE */}

          <div className="space-y-5">

            <h3 className="text-lg font-semibold">
              Please indicate your availability
            </h3>


            {/* ACCEPT */}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

              <input
                type="radio"
                name="response"
                value="Yes"
                checked={response === "Yes"}
                onChange={(e) =>
                  setResponse(e.target.value)
                }
                className="mt-1"
              />

              <div>

                <p className="font-semibold">
                  I Agree
                </p>

                <p className="text-sm text-gray-500">
                  I am available for the proposed Viva Voce schedule.
                </p>

              </div>

            </label>


            {/* UNABLE */}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

              <input
                type="radio"
                name="response"
                value="No"
                checked={response === "No"}
                onChange={(e) =>
                  setResponse(e.target.value)
                }
                className="mt-1"
              />

              <div>

                <p className="font-semibold">
                  I Am Unable to Attend
                </p>

                <p className="text-sm text-gray-500">
                  I cannot attend the proposed Viva Voce schedule.
                </p>

              </div>

            </label>


            {/* SUGGEST */}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

              <input
                type="radio"
                name="response"
                value="Suggest"
                checked={response === "Suggest"}
                onChange={(e) =>
                  setResponse(e.target.value)
                }
                className="mt-1"
              />

              <div>

                <p className="font-semibold">
                  Suggest Another Date / Time
                </p>

                <p className="text-sm text-gray-500">
                  I cannot attend this proposed schedule but would like to suggest an alternative.
                </p>

              </div>

            </label>


            {/* SUGGESTED DATE */}

            {response === "Suggest" && (

              <div className="rounded-xl bg-gray-50 p-5 space-y-4">

                <div>

                  <label className="mb-2 block font-medium">
                    Suggested Date
                  </label>

                  <input
                    type="date"
                    value={suggestedDate}
                    onChange={(e) =>
                      setSuggestedDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border p-3"
                  />

                </div>


                <div>

                  <label className="mb-2 block font-medium">
                    Suggested Time
                  </label>

                  <input
                    type="time"
                    value={suggestedTime}
                    onChange={(e) =>
                      setSuggestedTime(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border p-3"
                  />

                </div>

              </div>

            )}


            {/* REMARKS */}

            <div>

              <label className="mb-2 block font-medium">
                Remarks
              </label>

              <textarea
                rows={4}
                value={remarks}
                onChange={(e) =>
                  setRemarks(e.target.value)
                }
                placeholder="Optional remarks..."
                className="w-full rounded-xl border p-3"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="button"
              disabled={submitting}
              onClick={submitResponse}
              className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >

              {submitting
                ? "Submitting..."
                : "Submit Response"}

            </button>

          </div>


          <div className="mt-8 border-t pt-5 text-center text-sm text-gray-500">

            VivaTrack Secretariat

          </div>

        </div>

      </div>

    </div>
  );
}

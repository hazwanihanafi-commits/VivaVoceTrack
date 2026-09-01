import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Calendar, Clock } from "lucide-react";

const API =
  "https://vivatrack-backend.onrender.com/api";

export default function PanelResponse() {
  const [searchParams] = useSearchParams();

  const panelID = searchParams.get("panelID");

  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [response, setResponse] = useState("");

  const [suggestedDate, setSuggestedDate] =
    useState("");

  const [suggestedTime, setSuggestedTime] =
    useState("");

  const [remarks, setRemarks] =
    useState("");


  // =====================================================
  // LOAD PANEL
  // =====================================================

  useEffect(() => {

    if (!panelID) {
      setLoading(false);
      return;
    }

    loadPanel();

  }, [panelID]);


  async function loadPanel() {

    try {

      setLoading(true);

      const res = await fetch(
        `${API}/panel/${encodeURIComponent(panelID)}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
          "Unable to load Viva invitation."
        );
        return;
      }

      setPanel(data.data);

      // Load previous response if already submitted
      if (data.data.Accepted === "Yes") {

        setResponse("Yes");

      } else if (data.data.Accepted === "No") {

        setResponse("No");

        setSuggestedDate(
          data.data.SuggestedDate || ""
        );

        setSuggestedTime(
          data.data.SuggestedTime || ""
        );

        setRemarks(
          data.data.Remarks || ""
        );

      }

    } catch (err) {

      console.error(
        "LOAD PANEL ERROR:",
        err
      );

      alert(
        "Unable to connect to VivaTrack server."
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // SUBMIT RESPONSE
  // =====================================================

  async function submitResponse() {

    if (!response) {

      alert(
        "Please select whether you can attend the Viva."
      );

      return;
    }


    if (
      response === "No" &&
      !suggestedDate
    ) {

      alert(
        "Please suggest an alternative date."
      );

      return;
    }


    try {

      setSubmitting(true);

      const res = await fetch(
        `${API}/panel/${encodeURIComponent(
          panelID
        )}/respond`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            Accepted:
              response,

            SuggestedDate:
              response === "No"
                ? suggestedDate
                : "",

            SuggestedTime:
              response === "No"
                ? suggestedTime
                : "",

            Remarks:
              remarks,

          }),
        }
      );


      const data = await res.json();


      if (!res.ok) {

        alert(
          data.message ||
          "Unable to submit response."
        );

        return;
      }


      alert(data.message);


      // Reload latest panel information
      await loadPanel();


    } catch (err) {

      console.error(
        "SUBMIT PANEL RESPONSE ERROR:",
        err
      );

      alert(
        "Unable to connect to VivaTrack server."
      );

    } finally {

      setSubmitting(false);

    }
  }


  // =====================================================
  // NO PANEL ID
  // =====================================================

  if (!panelID) {

    return (

      <div className="min-h-screen bg-gray-50 p-6">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">

          <XCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
          />

          <h1 className="text-2xl font-bold">
            Invalid Invitation
          </h1>

          <p className="mt-2 text-gray-600">
            The Viva invitation link is
            missing the panel ID.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 p-6">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">

          <div className="animate-pulse">

            <div className="mx-auto mb-4 h-8 w-48 rounded bg-gray-200" />

            <div className="mx-auto h-4 w-72 rounded bg-gray-200" />

          </div>

          <p className="mt-6 text-gray-500">
            Loading Viva invitation...
          </p>

        </div>

      </div>
    );
  }


  if (!panel) {

    return (

      <div className="min-h-screen bg-gray-50 p-6">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">

          <XCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
          />

          <h1 className="text-2xl font-bold">
            Invitation Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            We could not find this Viva panel
            invitation.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // DISPLAY
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-3xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 rounded-2xl bg-white p-8 shadow">

          <div className="mb-2 text-sm font-medium text-purple-600">
            VivaTrack
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Viva Schedule Confirmation
          </h1>

          <p className="mt-2 text-gray-600">
            Please review the proposed Viva
            schedule and indicate your
            availability.
          </p>

        </div>


        {/* =================================================
            PANEL INFORMATION
        ================================================= */}

        <div className="rounded-2xl bg-white p-8 shadow">


          <div className="mb-6">

            <h2 className="text-xl font-bold">
              Your Appointment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {panel.Role}
            </p>

          </div>


          {/* =================================================
              VIVA DETAILS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


            {/* Date */}

            <div className="rounded-xl border bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">

                <Calendar size={18} />

                Viva Date

              </div>

              <div className="mt-2 text-lg font-semibold">

                {panel.TentativeVivaDate ||
                  panel.ConfirmedVivaDate ||
                  "Not specified"}

              </div>

            </div>


            {/* Time */}

            <div className="rounded-xl border bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">

                <Clock size={18} />

                Viva Time

              </div>

              <div className="mt-2 text-lg font-semibold">

                {panel.VivaTime ||
                  "Not specified"}

              </div>

            </div>


            {/* Venue */}

            <div className="rounded-xl border bg-gray-50 p-4">

              <div className="text-sm font-medium text-gray-500">
                Venue
              </div>

              <div className="mt-2 font-semibold">

                {panel.Venue ||
                  "Not specified"}

              </div>

            </div>


            {/* Mode */}

            <div className="rounded-xl border bg-gray-50 p-4">

              <div className="text-sm font-medium text-gray-500">
                Mode
              </div>

              <div className="mt-2 font-semibold">

                {panel.VivaMode ||
                  "Not specified"}

              </div>

            </div>

          </div>


          {/* =================================================
              RESPONSE
          ================================================= */}

          <div className="mt-8">

            <h2 className="text-xl font-bold">
              Are you available for this Viva?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your response will be recorded
              against this Viva case.
            </p>


            {/* ACCEPT */}

            <button
              type="button"
              onClick={() => {
                setResponse("Yes");
                setSuggestedDate("");
                setSuggestedTime("");
              }}
              className={`mt-6 flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition ${
                response === "Yes"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-green-400"
              }`}
            >

              <CheckCircle
                size={28}
                className="text-green-600"
              />

              <div>

                <div className="font-bold text-green-700">
                  Yes, I can attend
                </div>

                <div className="text-sm text-gray-500">
                  I confirm my availability
                  for the proposed Viva schedule.
                </div>

              </div>

            </button>


            {/* CANNOT ATTEND */}

            <button
              type="button"
              onClick={() => {
                setResponse("No");
              }}
              className={`mt-3 flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition ${
                response === "No"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >

              <XCircle
                size={28}
                className="text-red-500"
              />

              <div>

                <div className="font-bold text-red-700">
                  No, I cannot attend
                </div>

                <div className="text-sm text-gray-500">
                  I would like to suggest
                  another date/time.
                </div>

              </div>

            </button>


            {/* =================================================
                ALTERNATIVE DATE
            ================================================= */}

            {response === "No" && (

              <div className="mt-6 rounded-xl border bg-gray-50 p-6">

                <h3 className="font-bold">
                  Suggest an Alternative
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Please provide a suitable
                  alternative if possible.
                </p>


                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">


                  <div>

                    <label className="mb-2 block text-sm font-medium">

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

                    <label className="mb-2 block text-sm font-medium">

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


                <div className="mt-4">

                  <label className="mb-2 block text-sm font-medium">

                    Reason / Remarks

                  </label>

                  <textarea
                    rows={4}
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(
                        e.target.value
                      )
                    }
                    placeholder="Please explain why you cannot attend the proposed date..."
                    className="w-full rounded-xl border p-3"
                  />

                </div>

              </div>

            )}


            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="button"
              disabled={
                submitting ||
                !response
              }
              onClick={submitResponse}
              className="mt-6 w-full rounded-xl bg-purple-600 px-6 py-4 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {submitting
                ? "Submitting..."
                : "Submit Response"}

            </button>


          </div>


          {/* =================================================
              CURRENT RESPONSE
          ================================================= */}

          {panel.Accepted &&
            panel.Accepted !== "Pending" && (

              <div
                className={`mt-6 rounded-xl p-5 ${
                  panel.Accepted === "Yes"
                    ? "bg-green-50 text-green-800"
                    : "bg-orange-50 text-orange-800"
                }`}
              >

                <div className="font-bold">

                  {panel.Accepted === "Yes"
                    ? "Response Submitted: Available"
                    : "Response Submitted: Cannot Attend"}

                </div>

                {panel.ResponseDate && (

                  <div className="mt-1 text-sm">

                    Response recorded on:{" "}
                    {new Date(
                      panel.ResponseDate
                    ).toLocaleString()}

                  </div>

                )}

              </div>

            )}

        </div>

      </div>

    </div>
  );
}

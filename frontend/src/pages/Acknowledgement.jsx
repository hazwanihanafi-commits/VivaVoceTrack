import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API = "https://vivatrack-backend.onrender.com/api";

export default function Acknowledgement() {
  const [searchParams] = useSearchParams();

  const caseID = searchParams.get("caseID");
  const examinerID = searchParams.get("examinerID");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    candidateName: "",
    school: "",
    degree: "",
    receivedDate: "",
    others: "",

    officePhone: "",
    mobilePhone: "",
    email: "",
    fax: "",

    examinerName: "",
    examinerID: "",

    declarationAccepted: false,
    signature: "",
    signatureDate: "",
  });

  // ======================================================
  // LOAD ACKNOWLEDGEMENT DATA
  // ======================================================

  useEffect(() => {
    if (!caseID || !examinerID) {
      setError(
        "Invalid acknowledgement link. Case ID or Examiner ID is missing."
      );
      setLoading(false);
      return;
    }

    loadAcknowledgement();
  }, [caseID, examinerID]);

  async function loadAcknowledgement() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API}/acknowledgement/${encodeURIComponent(
          caseID
        )}/${encodeURIComponent(examinerID)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Unable to load acknowledgement form."
        );
      }

      const acknowledgement = data.data || {};

      if (acknowledgement.alreadySubmitted) {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      setForm({
        candidateName:
          acknowledgement.candidateName || "",

        school:
          acknowledgement.school || "",

        degree:
          acknowledgement.degree || "",

        receivedDate:
          acknowledgement.receivedDate ||
          new Date().toISOString().split("T")[0],

        others:
          acknowledgement.others || "",

        officePhone:
          acknowledgement.officePhone || "",

        mobilePhone:
          acknowledgement.mobilePhone || "",

        email:
          acknowledgement.email || "",

        fax:
          acknowledgement.fax || "",

        examinerName:
          acknowledgement.examinerName || "",

        examinerID:
          acknowledgement.examinerID || examinerID,

        declarationAccepted: false,

        signature:
          acknowledgement.examinerName || "",

        signatureDate:
          new Date().toISOString().split("T")[0],
      });

    } catch (err) {
      console.error(
        "LOAD ACKNOWLEDGEMENT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load acknowledgement form."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // UPDATE FIELD
  // ======================================================

  function updateField(e) {
    const { name, value, type, checked } =
      e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // ======================================================
  // SUBMIT
  // ======================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.declarationAccepted) {
      alert(
        "Please confirm the confidentiality declaration before submitting."
      );
      return;
    }

    if (!form.signature.trim()) {
      alert(
        "Please enter your name as the electronic signature."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(
        `${API}/acknowledgement/${encodeURIComponent(
          caseID
        )}/${encodeURIComponent(examinerID)}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            caseID,
            examinerID,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Unable to submit acknowledgement."
        );
      }

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "SUBMIT ACKNOWLEDGEMENT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to submit acknowledgement."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-lg font-semibold">
            Loading acknowledgement form...
          </div>

          <div className="text-sm text-gray-500 mt-2">
            Please wait.
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-xl shadow p-8">
          <h1 className="text-xl font-bold text-red-600">
            Unable to Open Form
          </h1>

          <p className="mt-4 text-gray-700">
            {error}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Please contact the VivaTrack administrator
            if you believe this link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // SUCCESS
  // ======================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-10 text-center">

          <div className="text-5xl mb-5">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-green-700">
            Acknowledgement Submitted
          </h1>

          <p className="mt-4 text-gray-700">
            Thank you. Your acknowledgement of
            receipt has been successfully submitted.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-5 text-left">
            <div>
              <span className="font-semibold">
                Viva Case:
              </span>{" "}
              {caseID}
            </div>

            <div className="mt-2">
              <span className="font-semibold">
                Examiner:
              </span>{" "}
              {form.examinerName}
            </div>

            <div className="mt-2">
              <span className="font-semibold">
                Date:
              </span>{" "}
              {form.signatureDate}
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            You may now close this page.
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // FORM
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="p-8 border-b">

            <div className="text-center">

              <h1 className="text-xl font-bold uppercase">
                PENGESAHAN PENERIMAAN TESIS
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                VivaTrack – Universiti Sains Malaysia
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="p-8 space-y-8">

              {/* ==================================================
                  KEPADA
              ================================================== */}

              <section>

                <h2 className="font-bold mb-3">
                  Kepada:
                </h2>

                <div className="text-sm leading-6">
                  <div>Pengarah</div>
                  <div>
                    Pusat Kanser Tun Abdullah Ahmad Badawi
                  </div>
                  <div>
                    (Sebelum ini Institut Perubatan dan
                    Pergigian Termaju)
                  </div>
                  <div>
                    Universiti Sains Malaysia
                  </div>
                  <div>13200 Kepala Batas</div>
                  <div>Pulau Pinang</div>
                  <div className="mt-2">
                    E-mel: anissyamimi@usm.my
                  </div>
                </div>

              </section>

              {/* ==================================================
                  DARIPADA
              ================================================== */}

              <section>

                <h2 className="font-bold mb-3">
                  Daripada:
                </h2>

                <div className="text-sm leading-6">
                  <div>Dr. Rohayu Hami</div>
                  <div>
                    Pusat Kanser Tun Abdullah Ahmad Badawi
                  </div>
                  <div>
                    Universiti Sains Malaysia
                  </div>
                  <div>13200 Kepala Batas</div>
                  <div>Pulau Pinang</div>
                </div>

              </section>

              {/* ==================================================
                  INTRO
              ================================================== */}

              <section>

                <p className="text-sm leading-7">
                  Saya mengesahkan penerimaan tesis
                  seperti berikut :-
                </p>

              </section>

              {/* ==================================================
                  CANDIDATE INFORMATION
              ================================================== */}

              <section className="space-y-5">

                <div>
                  <label className="block font-semibold mb-2">
                    Nama Calon
                  </label>

                  <input
                    type="text"
                    name="candidateName"
                    value={form.candidateName}
                    onChange={updateField}
                    readOnly
                    className="w-full rounded-lg border bg-gray-50 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Pusat Pengajian
                  </label>

                  <input
                    type="text"
                    name="school"
                    value={form.school}
                    onChange={updateField}
                    readOnly
                    className="w-full rounded-lg border bg-gray-50 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Ijazah
                  </label>

                  <input
                    type="text"
                    name="degree"
                    value={form.degree}
                    onChange={updateField}
                    readOnly
                    className="w-full rounded-lg border bg-gray-50 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Tarikh Terima
                  </label>

                  <input
                    type="date"
                    name="receivedDate"
                    value={form.receivedDate}
                    onChange={updateField}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Lain-lain
                  </label>

                  <textarea
                    name="others"
                    value={form.others}
                    onChange={updateField}
                    rows="3"
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>

              </section>

              {/* ==================================================
                  EXAMINER
              ================================================== */}

              <section>

                <h2 className="text-lg font-bold mb-5">
                  Maklumat Pemeriksa
                </h2>

                <div className="space-y-5">

                  <div>
                    <label className="block font-semibold mb-2">
                      Nama Pemeriksa
                    </label>

                    <input
                      type="text"
                      value={form.examinerName}
                      readOnly
                      className="w-full rounded-lg border bg-gray-50 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Tel. No. (Pejabat)
                    </label>

                    <input
                      type="text"
                      name="officePhone"
                      value={form.officePhone}
                      onChange={updateField}
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      H/P No.
                    </label>

                    <input
                      type="text"
                      name="mobilePhone"
                      value={form.mobilePhone}
                      onChange={updateField}
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Alamat Emel
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      No. Fax
                    </label>

                    <input
                      type="text"
                      name="fax"
                      value={form.fax}
                      onChange={updateField}
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                </div>

              </section>

              {/* ==================================================
                  DECLARATION
              ================================================== */}

              <section className="rounded-lg bg-gray-50 border p-6">

                <p className="text-sm leading-7">
                  Saya seperti nama di atas membuat
                  perakuan untuk menjaga kerahsiaan
                  kandungan tesis berdasarkan polisi
                  Universiti Sains Malaysia iaitu tesis
                  adalah hak milik pelajar.
                </p>

                <label className="flex items-start gap-3 mt-6 cursor-pointer">

                  <input
                    type="checkbox"
                    name="declarationAccepted"
                    checked={
                      form.declarationAccepted
                    }
                    onChange={updateField}
                    className="mt-1 h-5 w-5"
                  />

                  <span className="text-sm font-medium">
                    Saya bersetuju dengan perakuan
                    kerahsiaan di atas.
                  </span>

                </label>

              </section>

              {/* ==================================================
                  SIGNATURE
              ================================================== */}

              <section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>

                    <label className="block font-semibold mb-2">
                      Tandatangan / Nama Digital
                    </label>

                    <input
                      type="text"
                      name="signature"
                      value={form.signature}
                      onChange={updateField}
                      placeholder="Masukkan nama penuh"
                      className="w-full rounded-lg border px-4 py-3"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Nama ini akan direkodkan sebagai
                      tandatangan elektronik.
                    </p>

                  </div>

                  <div>

                    <label className="block font-semibold mb-2">
                      Tarikh
                    </label>

                    <input
                      type="date"
                      name="signatureDate"
                      value={form.signatureDate}
                      onChange={updateField}
                      className="w-full rounded-lg border px-4 py-3"
                    />

                  </div>

                </div>

              </section>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <section className="pt-4 border-t">

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 px-6 py-4 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Acknowledgement"}
                </button>

              </section>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

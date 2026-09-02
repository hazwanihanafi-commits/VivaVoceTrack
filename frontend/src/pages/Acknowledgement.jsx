import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API =
  "https://vivatrack-backend.onrender.com/api";

export default function Acknowledgement() {
  const [searchParams] = useSearchParams();

  const caseID =
    searchParams.get("caseID") || "";

  const examinerID =
    searchParams.get("examinerID") || "";

  const [loading, setLoading] =
    useState(true);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    CaseID: caseID,

    StudentID: "",

    CandidateName: "",

    School: "",

    Degree: "",

    DateReceived:
      new Date()
        .toISOString()
        .split("T")[0],

    Other: "",

    ExaminerID: "",

    ExaminerName: "",

    ExaminerAddress: "",

    OfficePhone: "",

    MobilePhone: "",

    Email: "",

    Fax: "",

    ConfidentialityAccepted:
      false,

    SignatureDate:
      new Date()
        .toISOString()
        .split("T")[0],
  });

  // =====================================================
  // LOAD CASE + STUDENT + EXAMINER
  // =====================================================

  useEffect(() => {
    async function loadAcknowledgementData() {
      if (!caseID) {
        setError(
          "Viva Case ID is missing."
        );

        setLoading(false);

        return;
      }

      if (!examinerID) {
        setError(
          "Examiner ID is missing. Please use the acknowledgement link provided in the email."
        );

        setLoading(false);

        return;
      }

      try {
        const url =
          `${API}/emails/acknowledgement-data` +
          `?caseID=${encodeURIComponent(caseID)}` +
          `&examinerID=${encodeURIComponent(examinerID)}`;

        console.log(
          "Loading acknowledgement:",
          url
        );

        const res =
          await fetch(url);

        const data =
          await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load acknowledgement data."
          );
        }

        // =================================================
        // AUTO POPULATE FORM
        // =================================================

        setForm((prev) => ({
          ...prev,

          CaseID:
            data.case?.CaseID ||
            caseID,

          StudentID:
            data.student?.StudentID ||
            "",

          CandidateName:
            data.student?.StudentName ||
            "",

          School:
            data.student?.School ||
            "",

          Degree:
            data.student?.Degree ||
            data.student?.Programme ||
            "",

          ExaminerID:
            data.examiner?.ExaminerID ||
            examinerID,

          ExaminerName:
            data.examiner?.ExaminerName ||
            "",

          ExaminerAddress:
            data.examiner?.Address ||
            "",

          OfficePhone:
            data.examiner?.OfficePhone ||
            "",

          MobilePhone:
            data.examiner?.MobilePhone ||
            "",

          Email:
            data.examiner?.Email ||
            "",

          Fax:
            data.examiner?.Fax ||
            "",
        }));
      } catch (err) {
        console.error(
          "LOAD ACKNOWLEDGEMENT ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to load acknowledgement data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAcknowledgementData();
  }, [caseID, examinerID]);

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  function updateField(e) {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.ExaminerName.trim()) {
      setError(
        "Examiner information could not be loaded."
      );

      return;
    }

    if (!form.Email.trim()) {
      setError(
        "Examiner email could not be loaded."
      );

      return;
    }

    if (!form.ConfidentialityAccepted) {
      setError(
        "Please accept the confidentiality declaration."
      );

      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          `${API}/acknowledgement/submit`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(form),
          }
        );

      const data =
        await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to submit acknowledgement."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error(
        "ACK SUBMIT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to submit acknowledgement."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">
            Loading acknowledgement form...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR WHEN DATA CANNOT LOAD
  // =====================================================

  if (
    error &&
    !form.StudentID
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl rounded-xl bg-white p-8 shadow">

          <h1 className="mb-3 text-xl font-bold text-red-600">
            Unable to Load Form
          </h1>

          <p className="text-gray-700">
            {error}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Please use the acknowledgement
            link provided in your thesis
            examination email.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

        <div className="max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">

          <div className="mb-5 text-5xl">
            ✓
          </div>

          <h1 className="mb-3 text-2xl font-bold text-green-700">
            Acknowledgement Submitted
          </h1>

          <p className="mb-4 text-gray-600">
            Thank you. Your Acknowledgement
            of Receipt has been successfully
            submitted.
          </p>

          <div className="rounded-lg bg-gray-50 p-4">

            <p className="text-sm text-gray-500">
              Viva Case
            </p>

            <p className="font-semibold">
              {form.CaseID}
            </p>

          </div>

          <p className="mt-6 text-sm text-gray-500">
            You may now close this page.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // FORM
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="mx-auto max-w-4xl">

        <div className="mb-6 rounded-xl bg-white p-8 shadow">

          {/* ===========================================
              TITLE
          =========================================== */}

          <div className="mb-8 text-center">

            <h1 className="text-2xl font-bold">
              PENGESAHAN PENERIMAAN TESIS
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Acknowledgement of Receipt
            </p>

            <p className="mt-2 text-sm font-semibold">
              Viva Case: {form.CaseID}
            </p>

          </div>

          {/* ===========================================
              TO
          =========================================== */}

          <div className="mb-8 leading-relaxed">

            <p className="font-bold">
              Kepada:
            </p>

            <p>
              Pengarah
              <br />
              Pusat Kanser Tun Abdullah Ahmad Badawi
              <br />
              (Sebelum ini Institut Perubatan dan
              Pergigian Termaju)
              <br />
              Universiti Sains Malaysia
              <br />
              13200 Kepala Batas
              <br />
              Pulau Pinang
            </p>

            <p className="mt-3">
              E-mel: anissyamimi@usm.my
            </p>

          </div>

          {/* ===========================================
              FROM — EXAMINER
          =========================================== */}

          <div className="mb-8 leading-relaxed">

            <p className="font-bold">
              Daripada:
            </p>

            <p className="mt-2">

              {form.ExaminerName ? (
                <>
                  <strong>
                    {form.ExaminerName}
                  </strong>

                  <br />

                  {form.ExaminerAddress
                    ? form.ExaminerAddress
                        .split("\n")
                        .map(
                          (
                            line,
                            index
                          ) => (
                            <span
                              key={index}
                            >
                              {line}
                              <br />
                            </span>
                          )
                        )
                    : (
                      <>
                        __________________________________
                        <br />
                        __________________________________
                      </>
                    )}
                </>
              ) : (
                <>
                  __________________________________
                  <br />
                  __________________________________
                </>
              )}

            </p>

          </div>

          {/* ===========================================
              ERROR
          =========================================== */}

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* ===========================================
              THESIS INFORMATION
          =========================================== */}

          <h2 className="mb-4 text-lg font-bold">
            Maklumat Tesis
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            {/* CANDIDATE NAME */}

            <div>

              <label className="block text-sm font-medium">
                Nama Calon
              </label>

              <input
                value={
                  form.CandidateName
                }
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 p-3"
              />

            </div>

            {/* SCHOOL */}

            <div>

              <label className="block text-sm font-medium">
                Pusat Pengajian
              </label>

              <input
                value={
                  form.School
                }
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 p-3"
              />

            </div>

            {/* DEGREE */}

            <div>

              <label className="block text-sm font-medium">
                Ijazah
              </label>

              <input
                value={
                  form.Degree
                }
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 p-3"
              />

            </div>

            {/* DATE RECEIVED */}

            <div>

              <label className="block text-sm font-medium">
                Tarikh Terima
              </label>

              <input
                type="date"
                value={
                  form.DateReceived
                }
                onChange={
                  updateField
                }
                name="DateReceived"
                className="mt-1 w-full rounded border p-3"
              />

            </div>

          </div>

          {/* ===========================================
              OTHER
          =========================================== */}

          <div className="mt-4">

            <label className="block text-sm font-medium">
              Lain-lain
            </label>

            <textarea
              name="Other"
              value={
                form.Other
              }
              onChange={
                updateField
              }
              rows="3"
              className="mt-1 w-full rounded border p-3"
            />

          </div>

          {/* ===========================================
              EXAMINER INFORMATION
          =========================================== */}

          <h2 className="mb-4 mt-10 text-lg font-bold">
            Maklumat Pemeriksa
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            {/* NAME */}

            <div>

              <label className="block text-sm font-medium">
                Nama Pemeriksa
              </label>

              <input
                name="ExaminerName"
                value={
                  form.ExaminerName
                }
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 p-3"
              />

            </div>

            {/* OFFICE PHONE */}

            <div>

              <label className="block text-sm font-medium">
                Tel. No. (Pejabat)
              </label>

              <input
                name="OfficePhone"
                value={
                  form.OfficePhone
                }
                onChange={
                  updateField
                }
                className="mt-1 w-full rounded border p-3"
              />

            </div>

            {/* MOBILE */}

            <div>

              <label className="block text-sm font-medium">
                H/P No.
              </label>

              <input
                name="MobilePhone"
                value={
                  form.MobilePhone
                }
                onChange={
                  updateField
                }
                className="mt-1 w-full rounded border p-3"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium">
                Alamat Emel
              </label>

              <input
                type="email"
                name="Email"
                value={
                  form.Email
                }
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 p-3"
              />

            </div>

            {/* FAX */}

            <div>

              <label className="block text-sm font-medium">
                No. Fax
              </label>

              <input
                name="Fax"
                value={
                  form.Fax
                }
                onChange={
                  updateField
                }
                className="mt-1 w-full rounded border p-3"
              />

            </div>

          </div>

          {/* ===========================================
              CONFIDENTIALITY
          =========================================== */}

          <div className="mt-10 rounded-lg border bg-gray-50 p-5">

            <p className="leading-relaxed">

              Saya seperti nama di atas membuat
              perakuan untuk menjaga kerahsiaan
              kandungan tesis berdasarkan polisi
              Universiti Sains Malaysia iaitu tesis
              adalah hak milik pelajar.

            </p>

            <label className="mt-5 flex gap-3">

              <input
                type="checkbox"
                name="ConfidentialityAccepted"
                checked={
                  form.ConfidentialityAccepted
                }
                onChange={
                  updateField
                }
                className="mt-1 h-5 w-5"
              />

              <span className="font-medium">

                Saya mengesahkan dan bersetuju
                dengan perakuan kerahsiaan di atas.

              </span>

            </label>

          </div>

          {/* ===========================================
              SIGNATURE DATE
          =========================================== */}

          <div className="mt-6 max-w-sm">

            <label className="block text-sm font-medium">
              Tarikh
            </label>

            <input
              type="date"
              name="SignatureDate"
              value={
                form.SignatureDate
              }
              onChange={
                updateField
              }
              className="mt-1 w-full rounded border p-3"
            />

          </div>

          {/* ===========================================
              SUBMIT
          =========================================== */}

          <div className="mt-10 flex justify-end">

            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={loading}
              className="rounded-lg bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >

              {loading
                ? "Submitting..."
                : "Submit Acknowledgement"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

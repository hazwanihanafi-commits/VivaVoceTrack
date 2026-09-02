import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API =
  "https://vivatrack-backend.onrender.com/api";

export default function Acknowledgement() {

  const [searchParams] =
    useSearchParams();

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

  const [form, setForm] =
    useState({

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

      ExaminerName: "",

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
  // LOAD CASE
  // =====================================================

  useEffect(() => {

    async function loadCase() {

      if (!caseID) {

        setError(
          "Viva Case ID is missing."
        );

        setLoading(false);

        return;
      }

      try {

        const res =
          await fetch(
            `${API}/vivacases`
          );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            "Unable to load Viva Case."
          );

        }

        const cases =
          Array.isArray(data.data)
            ? data.data
            : [];

        const item =
          cases.find(
            (x) =>
              String(
                x.CaseID ||
                x.caseID ||
                x.caseId ||
                ""
              ).trim() ===
              String(caseID).trim()
          );

        if (!item) {

          throw new Error(
            `Viva Case ${caseID} not found.`
          );

        }

        setForm((prev) => ({

          ...prev,

          CaseID: caseID,

          StudentID:
            item.StudentID ||
            item.studentID ||
            item.studentId ||
            "",

          CandidateName:
            item.StudentName ||
            item.CandidateName ||
            "",

          School:
            item.School ||
            item.PusatPengajian ||
            item.Centre ||
            "",

          Degree:
            item.Degree ||
            item.Programme ||
            "",

        }));

      } catch (err) {

        console.error(
          "LOAD ACK CASE ERROR:",
          err
        );

        setError(
          err.message ||
          "Unable to load case."
        );

      } finally {

        setLoading(false);

      }

    }

    loadCase();

  }, [caseID]);


  // =====================================================
  // UPDATE
  // =====================================================

  function updateField(e) {

    const {
      name,
      value,
      checked,
      type
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

    if (
      !form.ExaminerName.trim()
    ) {

      setError(
        "Please enter examiner name."
      );

      return;
    }

    if (
      !form.Email.trim()
    ) {

      setError(
        "Please enter examiner email."
      );

      return;
    }

    if (
      !form.ConfidentialityAccepted
    ) {

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
              JSON.stringify(
                form
              ),

          }
        );

      const data =
        await res.json();

      if (!res.ok || !data.success) {

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
  // ERROR
  // =====================================================

  if (error && !form.StudentID) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

        <div className="max-w-xl rounded-xl bg-white p-8 shadow">

          <h1 className="mb-3 text-xl font-bold text-red-600">
            Unable to Load Form
          </h1>

          <p>
            {error}
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


          {/* ADDRESS */}

          <div className="mb-8 leading-relaxed">

            <p className="font-bold">
              Kepada:
            </p>

            <p>
              Pengarah<br />
              Pusat Kanser Tun Abdullah Ahmad Badawi<br />
              (Sebelum ini Institut Perubatan dan Pergigian Termaju)<br />
              Universiti Sains Malaysia<br />
              13200 Kepala Batas<br />
              Pulau Pinang
            </p>

            <p className="mt-3">
              E-mel: anissyamimi@usm.my
            </p>

          </div>


          <div className="mb-8 leading-relaxed">

            <p className="font-bold">
              Daripada:
            </p>

            <p>
              Dr. Rohayu Hami<br />
              Pusat Kanser Tun Abdullah Ahmad Badawi<br />
              Universiti Sains Malaysia<br />
              13200 Kepala Batas<br />
              Pulau Pinang
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">

              {error}

            </div>

          )}


          {/* CANDIDATE */}

          <h2 className="mb-4 text-lg font-bold">
            Maklumat Tesis
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

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


            <div>

              <label className="block text-sm font-medium">
                Pusat Pengajian
              </label>

              <input
                value={
                  form.School
                }
                onChange={updateField}
                name="School"
                className="mt-1 w-full rounded border p-3"
              />

            </div>


            <div>

              <label className="block text-sm font-medium">
                Ijazah
              </label>

              <input
                value={
                  form.Degree
                }
                onChange={updateField}
                name="Degree"
                className="mt-1 w-full rounded border p-3"
              />

            </div>


            <div>

              <label className="block text-sm font-medium">
                Tarikh Terima
              </label>

              <input
                type="date"
                value={
                  form.DateReceived
                }
                onChange={updateField}
                name="DateReceived"
                className="mt-1 w-full rounded border p-3"
              />

            </div>

          </div>


          {/* OTHER */}

          <div className="mt-4">

            <label className="block text-sm font-medium">
              Lain-lain
            </label>

            <textarea
              name="Other"
              value={
                form.Other
              }
              onChange={updateField}
              rows="3"
              className="mt-1 w-full rounded border p-3"
            />

          </div>


          {/* EXAMINER */}

          <h2 className="mb-4 mt-10 text-lg font-bold">
            Maklumat Pemeriksa
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <label className="block text-sm font-medium">
                Nama Pemeriksa
              </label>

              <input
                name="ExaminerName"
                value={
                  form.ExaminerName
                }
                onChange={updateField}
                required
                className="mt-1 w-full rounded border p-3"
              />

            </div>


            <div>

              <label className="block text-sm font-medium">
                Tel. No. (Pejabat)
              </label>

              <input
                name="OfficePhone"
                value={
                  form.OfficePhone
                }
                onChange={updateField}
                className="mt-1 w-full rounded border p-3"
              />

            </div>


            <div>

              <label className="block text-sm font-medium">
                H/P No.
              </label>

              <input
                name="MobilePhone"
                value={
                  form.MobilePhone
                }
                onChange={updateField}
                className="mt-1 w-full rounded border p-3"
              />

            </div>


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
                onChange={updateField}
                required
                className="mt-1 w-full rounded border p-3"
              />

            </div>


            <div>

              <label className="block text-sm font-medium">
                No. Fax
              </label>

              <input
                name="Fax"
                value={
                  form.Fax
                }
                onChange={updateField}
                className="mt-1 w-full rounded border p-3"
              />

            </div>

          </div>


          {/* DECLARATION */}

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
                onChange={updateField}
                className="mt-1 h-5 w-5"
              />

              <span className="font-medium">

                Saya mengesahkan dan bersetuju
                dengan perakuan kerahsiaan di atas.

              </span>

            </label>

          </div>


          {/* SIGNATURE DATE */}

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
              onChange={updateField}
              className="mt-1 w-full rounded border p-3"
            />

          </div>


          {/* SUBMIT */}

          <div className="mt-10 flex justify-end">

            <button
              type="button"
              onClick={handleSubmit}
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

"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Upload,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditPatientPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
    medicalNotes: "",
  });

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  async function fetchPatient() {
    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Patient not found.");
        return;
      }

      const patient = data.patient;

      setForm({
        fullName: patient.fullName || "",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        bloodGroup: patient.bloodGroup || "Unknown",
        medicalNotes: patient.medicalNotes || "",
      });

      setPdfName(patient.medicalPdf?.name || "");
    } catch (error) {
      console.error(error);
      alert("Unable to load patient.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // ================= SAVE PATIENT =================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update patient.");
        return;
      }

      alert("Patient details updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to update patient.");
    } finally {
      setSaving(false);
    }
  }

  // ================= UPLOAD PDF =================

  async function handlePdfUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    setPdfLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}/pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "PDF upload failed.");
        return;
      }

      setPdfName(data.pdfName || file.name);

      alert("PDF saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to upload PDF.");
    } finally {
      setPdfLoading(false);
      event.target.value = "";
    }
  }

  // ================= VIEW PDF =================

  function viewPdf() {
    window.open(
      `/api/patients/${encodeURIComponent(patientId)}/pdf`,
      "_blank"
    );
  }

  // ================= DOWNLOAD PDF =================

  function downloadPdf() {
    const link = document.createElement("a");

    link.href = `/api/patients/${encodeURIComponent(
      patientId
    )}/pdf?download=true`;

    link.download = pdfName || "medical-report.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ================= REMOVE PDF =================

  async function removePdf() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this PDF?"
    );

    if (!confirmed) return;

    setPdfLoading(true);

    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}/pdf`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to remove PDF.");
        return;
      }

      setPdfName("");

      alert("PDF removed successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to remove PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="min-h-screen bg-sky-50 p-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">
            Loading patient information...
          </p>
        </div>
      </main>
    );
  }

  // ================= PAGE =================

  return (
    <main className="min-h-screen bg-sky-50">

      {/* HEADER */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">

          <Link
            href="/dashboard/admin/patients"
            className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Clinic-Chain
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Update Patient
            </h1>

            <p className="text-sm font-semibold text-sky-600">
              {patientId}
            </p>
          </div>

        </div>
      </header>

      {/* FORM */}

      <section className="mx-auto max-w-3xl px-6 py-10">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm md:p-10"
        >

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Patient Information
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Update the patient's important information.
            </p>
          </div>

          {/* BASIC INFORMATION */}

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              name="fullName"
              label="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            <Input
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />

            <Select
              name="gender"
              label="Gender"
              value={form.gender}
              onChange={handleChange}
              options={[
                "Male",
                "Female",
                "Other",
              ]}
              required
            />

            <Select
              name="bloodGroup"
              label="Blood Group"
              value={form.bloodGroup}
              onChange={handleChange}
              options={[
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
                "Unknown",
              ]}
            />

            <Input
              name="phone"
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

          </div>

          {/* ADDRESS */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address
              <span className="text-red-500"> *</span>
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

          </div>

          {/* MEDICAL NOTES */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Medical Notes
            </label>

            <textarea
              name="medicalNotes"
              value={form.medicalNotes}
              onChange={handleChange}
              rows={5}
              placeholder="Enter important medical information..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

          </div>

          {/* PDF */}

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">

            <p className="font-semibold text-slate-800">
              Medical PDF
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Upload one medical report or document.
            </p>

            {/* NO PDF */}

            {!pdfName && (
              <div className="mt-4">

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">

                  <Upload size={18} />

                  {pdfLoading
                    ? "Saving..."
                    : "Choose PDF"}

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfUpload}
                    disabled={pdfLoading}
                    className="hidden"
                  />

                </label>

              </div>
            )}

            {/* PDF EXISTS */}

            {pdfName && (
              <div className="mt-4 rounded-xl bg-white p-4">

                <p className="truncate text-sm font-semibold text-slate-700">
                  📄 {pdfName}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={viewPdf}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-200"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {/* DOWNLOAD */}

                  <button
                    type="button"
                    onClick={downloadPdf}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200"
                  >
                    <Download size={16} />
                    Download
                  </button>

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={removePdf}
                    disabled={pdfLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* SAVE */}

          <button
            type="submit"
            disabled={saving}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Save size={18} />

            {saving
              ? "Saving Changes..."
              : "Save Patient Details"}

          </button>

        </form>

      </section>

    </main>
  );
}


/* ================= INPUT ================= */

function Input({
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />

    </div>
  );
}


/* ================= SELECT ================= */

function Select({
  name,
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      >

        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}
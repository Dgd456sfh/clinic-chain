"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplets,
  HeartPulse,
  FileText,
  Upload,
  Save,
  Loader2,
} from "lucide-react";

type Patient = {
  patientId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: string;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  medicalNotes?: string;

  medicalPdf?: {
    name?: string;
    path?: string;
  };
};

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = String(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] =
    useState("");

  const [medicalNotes, setMedicalNotes] = useState("");

  const [pdfName, setPdfName] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PATIENT
  // ============================================================

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/patients/${encodeURIComponent(patientId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load patient."
          );
        }

        const p: Patient = data.patient || data;

        setPatient(p);

        setFullName(p.fullName || "");

        setDateOfBirth(
          p.dateOfBirth
            ? new Date(p.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : ""
        );

        setGender(p.gender || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
        setAddress(p.address || "");
        setBloodGroup(p.bloodGroup || "");

        setEmergencyName(
          p.emergencyContact?.name || ""
        );

        setEmergencyPhone(
          p.emergencyContact?.phone || ""
        );

        setEmergencyRelationship(
          p.emergencyContact?.relationship || ""
        );

        setMedicalNotes(p.medicalNotes || "");

        setPdfName(
          p.medicalPdf?.name || ""
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load patient."
        );
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  // ============================================================
  // SAVE PATIENT DETAILS
  // ============================================================

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            bloodGroup,

            emergencyContact: {
              name: emergencyName,
              phone: emergencyPhone,
              relationship: emergencyRelationship,
            },

            medicalNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update patient."
        );
      }

      setPatient(data.patient || patient);

      setMessage(
        "Patient details updated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update patient."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // PDF UPLOAD
  // ============================================================

  async function handlePdfUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    // Optional 10 MB limit
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("PDF must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setPdfUploading(true);
      setError("");
      setMessage("");

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
        throw new Error(
          data.message ||
            "Failed to upload medical PDF."
        );
      }

      setPdfName(
        data.pdfName ||
          data.medicalPdf?.name ||
          file.name
      );

      setMessage(
        "Medical PDF uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Medical PDF upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload medical PDF."
      );
    } finally {
      setPdfUploading(false);

      // Allows selecting the same file again
      event.target.value = "";
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2
            size={22}
            className="animate-spin text-sky-600"
          />

          <span className="text-sm font-medium text-slate-600">
            Loading patient...
          </span>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (!patient) {
    return (
      <main className="min-h-screen bg-sky-50">
        <header className="border-b border-sky-100 bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
            <Link
              href="/dashboard/receptionist"
              className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                Clinic-Chain
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Edit Patient
              </h1>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <p className="font-semibold text-red-600">
              {error || "Patient not found."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-sky-50">
      {/* HEADER */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard/receptionist"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Clinic-Chain
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Edit Patient
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Patient ID: {patient.patientId}
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* PATIENT FORM */}

        <form onSubmit={handleSave}>
          <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
            {/* PATIENT HEADER */}

            <div className="bg-sky-50 p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                  <UserRound size={27} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                    Patient
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900">
                    {patient.fullName}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-sky-600">
                    {patient.patientId}
                  </p>
                </div>
              </div>
            </div>

            {/* PERSONAL INFORMATION */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<UserRound size={19} />}
                title="Personal Information"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Date of Birth
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) =>
                        setDateOfBirth(
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Blood Group
                  </label>

                  <div className="relative">
                    <Droplets
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={bloodGroup}
                      onChange={(event) =>
                        setBloodGroup(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="">
                        Unknown
                      </option>

                      <option value="A+">
                        A+
                      </option>

                      <option value="A-">
                        A-
                      </option>

                      <option value="B+">
                        B+
                      </option>

                      <option value="B-">
                        B-
                      </option>

                      <option value="AB+">
                        AB+
                      </option>

                      <option value="AB-">
                        AB-
                      </option>

                      <option value="O+">
                        O+
                      </option>

                      <option value="O-">
                        O-
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<Phone size={19} />}
                title="Contact Information"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  required
                  icon={<Phone size={17} />}
                />

                <InputField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  icon={<Mail size={17} />}
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    value={address}
                    onChange={setAddress}
                    required
                    icon={<MapPin size={17} />}
                  />
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<HeartPulse size={19} />}
                title="Emergency Contact"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <InputField
                  label="Name"
                  value={emergencyName}
                  onChange={setEmergencyName}
                />

                <InputField
                  label="Phone"
                  value={emergencyPhone}
                  onChange={setEmergencyPhone}
                />

                <InputField
                  label="Relationship"
                  value={emergencyRelationship}
                  onChange={setEmergencyRelationship}
                />
              </div>
            </div>

            {/* MEDICAL NOTES */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<HeartPulse size={19} />}
                title="Medical Information"
              />

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Medical Notes
                </label>

                <textarea
                  value={medicalNotes}
                  onChange={(event) =>
                    setMedicalNotes(
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Enter medical notes, allergies, previous conditions, etc."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* MEDICAL PDF */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<FileText size={19} />}
                title="Medical Documents"
              />

              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                      <FileText size={23} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Medical History PDF
                      </p>

                      {pdfName ? (
                        <p className="mt-1 break-all text-sm text-slate-500">
                          Current file: {pdfName}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">
                          No medical PDF uploaded yet.
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-400">
                        PDF only • Maximum 10 MB
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                    {pdfUploading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={17} />

                        {pdfName
                          ? "Replace PDF"
                          : "Upload PDF"}
                      </>
                    )}

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      disabled={pdfUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* VIEW CURRENT PDF */}

                {patient.medicalPdf?.path && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-sky-100 pt-5">
                    <a
                      href={`/api/patients/${encodeURIComponent(
                        patientId
                      )}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:bg-sky-100"
                    >
                      <FileText size={17} />

                      View Medical PDF
                    </a>

                    <a
                      href={`/api/patients/${encodeURIComponent(
                        patientId
                      )}/pdf`}
                      download
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-sky-50"
                    >
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* SAVE */}

            <div className="flex flex-col gap-3 bg-slate-50 p-7 sm:flex-row sm:justify-between">
              <Link
                href="/dashboard/receptionist"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <ArrowLeft size={17} />

                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    Save Patient Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

// ============================================================
// INPUT FIELD
// ============================================================

function InputField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
            icon ? "pl-11" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
}
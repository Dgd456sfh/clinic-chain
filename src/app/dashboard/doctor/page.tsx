"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  HeartPulse,
  FileText,
  ShieldCheck,
  UserCheck,
  Eye,
} from "lucide-react";

type EmergencyContact = {
  name?: string;
  phone?: string;
  relationship?: string;
};

type EnteredBy = {
  userId?: string;
  name?: string;
  role?: string;
};

type MedicalPdf = {
  name?: string;
  path?: string;
};

type Patient = {
  patientId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: string;
  emergencyContact?: EmergencyContact;
  medicalNotes?: string;
  enteredBy?: EnteredBy;
  medicalPdf?: MedicalPdf;
  createdAt?: string;
  updatedAt?: string;
};

export default function DoctorPatientPage() {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const id = patientId.trim();

    if (!id) {
      setPatient(null);
      setMessage("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setMessage("");
    setPatient(null);

    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(id)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Patient not found.");
        return;
      }

      if (!data.patient) {
        setMessage("Patient data was not returned.");
        return;
      }

      setPatient(data.patient);
    } catch (error) {
      console.error("Patient search error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-sky-50">
      {/* HEADER */}
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard/doctor"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Clinic-Chain
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Patient Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Search a patient to view the information entered by the
              receptionist.
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* SEARCH CARD */}
        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm md:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Find Patient
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the patient's unique ID to view their complete
              receptionist-entered information.
            </p>
          </div>

          <form
            onSubmit={searchPatient}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                placeholder="Enter Patient ID e.g. CC-PAT-A1B2C3"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search Patient"}
            </button>
          </form>

          {/* ERROR / MESSAGE */}
          {message && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              {message}
            </div>
          )}

          {/* PATIENT */}
          {patient && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-sky-100">
              {/* PATIENT HEADER */}
              <div className="bg-sky-50 p-6 md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <UserRound size={30} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                        Patient
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900">
                        {patient.fullName}
                      </h2>

                      <p className="mt-1 text-sm font-bold text-sky-600">
                        {patient.patientId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-emerald-600 shadow-sm">
                    <ShieldCheck size={18} />
                    Patient Record
                  </div>
                </div>
              </div>

              {/* PERSONAL DETAILS */}
              <div className="p-6 md:p-8">
                <SectionTitle
                  icon={<UserRound size={19} />}
                  title="Patient Information"
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Detail
                    icon={<UserRound size={18} />}
                    label="Full Name"
                    value={patient.fullName}
                  />

                  <Detail
                    icon={<Calendar size={18} />}
                    label="Date of Birth"
                    value={formatDate(patient.dateOfBirth)}
                  />

                  <Detail
                    icon={<UserRound size={18} />}
                    label="Gender"
                    value={patient.gender || "Not provided"}
                  />

                  <Detail
                    icon={<Droplets size={18} />}
                    label="Blood Group"
                    value={patient.bloodGroup || "Unknown"}
                  />

                  <Detail
                    icon={<Phone size={18} />}
                    label="Phone"
                    value={patient.phone || "Not provided"}
                  />

                  <Detail
                    icon={<Mail size={18} />}
                    label="Email"
                    value={patient.email || "Not provided"}
                  />

                  <Detail
                    icon={<MapPin size={18} />}
                    label="Address"
                    value={patient.address || "Not provided"}
                  />

                  <Detail
                    icon={<HeartPulse size={18} />}
                    label="Patient ID"
                    value={patient.patientId}
                  />
                </div>
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="border-t border-sky-100 p-6 md:p-8">
                <SectionTitle
                  icon={<HeartPulse size={19} />}
                  title="Emergency Contact"
                />

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Detail
                    icon={<UserRound size={18} />}
                    label="Name"
                    value={
                      patient.emergencyContact?.name || "Not provided"
                    }
                  />

                  <Detail
                    icon={<Phone size={18} />}
                    label="Phone"
                    value={
                      patient.emergencyContact?.phone || "Not provided"
                    }
                  />

                  <Detail
                    icon={<UserCheck size={18} />}
                    label="Relationship"
                    value={
                      patient.emergencyContact?.relationship ||
                      "Not provided"
                    }
                  />
                </div>
              </div>

              {/* MEDICAL NOTES */}
              <div className="border-t border-sky-100 p-6 md:p-8">
                <SectionTitle
                  icon={<HeartPulse size={19} />}
                  title="Medical Notes"
                />

                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {patient.medicalNotes?.trim()
                      ? patient.medicalNotes
                      : "No medical notes were entered by the receptionist."}
                  </p>
                </div>
              </div>

              {/* PDF */}
              <div className="border-t border-sky-100 p-6 md:p-8">
                <SectionTitle
                  icon={<FileText size={19} />}
                  title="Medical Document"
                />

                <div className="mt-5">
                  {patient.medicalPdf?.path ? (
                    <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                          <FileText size={23} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {patient.medicalPdf.name ||
                              "Medical Document.pdf"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Medical PDF uploaded by the receptionist
                          </p>
                        </div>
                      </div>

                      <a
                        href={`/api/patients/${encodeURIComponent(
                          patient.patientId
                        )}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        <Eye size={17} />
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      No medical PDF has been uploaded for this patient.
                    </div>
                  )}
                </div>
              </div>

              {/* ENTERED BY */}
              <div className="border-t border-sky-100 bg-slate-50 p-6 md:p-8">
                <SectionTitle
                  icon={<UserCheck size={19} />}
                  title="Record Information"
                />

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Detail
                    icon={<UserRound size={18} />}
                    label="Entered / Updated By"
                    value={
                      patient.enteredBy?.name || "Not available"
                    }
                  />

                  <Detail
                    icon={<ShieldCheck size={18} />}
                    label="Role"
                    value={
                      patient.enteredBy?.role || "Not available"
                    }
                  />

                  <Detail
                    icon={<Calendar size={18} />}
                    label="Last Updated"
                    value={formatDate(patient.updatedAt)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ================= SECTION TITLE ================= */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sky-600">{icon}</div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
  );
}

/* ================= DETAIL ================= */

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-sky-500">{icon}</div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
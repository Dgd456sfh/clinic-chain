"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UserRound } from "lucide-react";

type Patient = {
  patientId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalPdf?: {
    name?: string;
  };
};

export default function ReceptionistSearchPatient() {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (!patientId.trim()) {
      setMessage("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setPatient(null);
    setMessage("");

    try {
      const response = await fetch(
        `/api/patients/search?patientId=${encodeURIComponent(
          patientId.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Patient not found.");
        return;
      }

      setPatient(data.patient);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sky-50">
      {/* HEADER */}
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
              Receptionist
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Search Patient
            </h1>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* SEARCH BOX */}
        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Search size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Find Patient
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the patient's unique Patient ID.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              placeholder="Enter Patient ID"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-600 px-7 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {message}
            </div>
          )}
        </div>

        {/* PATIENT INFORMATION */}
        {patient && (
          <div className="mt-6 rounded-3xl border border-sky-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <UserRound size={25} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {patient.fullName}
                </h2>

                <p className="text-sm text-sky-600">
                  Patient ID: {patient.patientId}
                </p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Info
                label="Email"
                value={patient.email}
              />

              <Info
                label="Phone"
                value={patient.phone}
              />

              <Info
                label="Gender"
                value={patient.gender}
              />

              <Info
                label="Date of Birth"
                value={
                  patient.dateOfBirth
                    ? new Date(
                        patient.dateOfBirth
                      ).toLocaleDateString("en-GB")
                    : undefined
                }
              />

              <Info
                label="Blood Group"
                value={patient.bloodGroup}
              />

              <Info
                label="Address"
                value={patient.address}
              />
            </div>

            {/* MEDICAL NOTES */}
            {patient.medicalNotes && (
              <div className="mt-5 rounded-xl bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Medical Notes
                </p>

                <p className="mt-2 text-sm text-slate-800">
                  {patient.medicalNotes}
                </p>
              </div>
            )}

            {/* PDF STATUS */}
            {patient.medicalPdf?.name && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-700">
                  📄 Medical PDF: {patient.medicalPdf.name}
                </p>
              </div>
            )}

            {/* UPDATE BUTTON */}
            <div className="mt-7">
              <Link
                href={`/dashboard/receptionist/patients/${patient.patientId}/edit`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3.5 font-semibold text-white transition hover:bg-sky-700"
              >
                Update Patient
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl bg-sky-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}
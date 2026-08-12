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
  medicalNotes?: string;
};

export default function PatientSearchPage() {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchPatient(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const id = patientId.trim();

    if (!id) {
      setMessage("Please enter a Patient ID.");
      setPatient(null);
      return;
    }

    setLoading(true);
    setMessage("");
    setPatient(null);

    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Patient not found."
        );
        return;
      }

      setPatient(data.patient);
    } catch (error) {
      console.error("Patient search error:", error);

      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

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
              Search Patient
            </h1>
          </div>

        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">

        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm md:p-10">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Find Patient
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the patient's unique Patient ID to view their information.
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
                onChange={(event) =>
                  setPatientId(event.target.value)
                }
                placeholder="Enter Patient ID e.g. CC-PAT-A1B2C3"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>

          </form>

          {message && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {message}
            </div>
          )}

          {patient && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-sky-100">

              <div className="bg-sky-50 p-6">

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

              <div className="grid gap-4 p-6 md:grid-cols-2">

                <Detail
                  icon={<Calendar size={18} />}
                  label="Date of Birth"
                  value={
                    patient.dateOfBirth
                      ? new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"
                  }
                />

                <Detail
                  icon={<UserRound size={18} />}
                  label="Gender"
                  value={patient.gender}
                />

                <Detail
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={patient.phone}
                />

                <Detail
                  icon={<Mail size={18} />}
                  label="Email"
                  value={patient.email || "Not provided"}
                />

                <Detail
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={patient.address}
                />

                <Detail
                  icon={<Droplets size={18} />}
                  label="Blood Group"
                  value={patient.bloodGroup || "Unknown"}
                />

              </div>

              <div className="border-t border-sky-100 p-6">

                <p className="text-sm font-semibold text-slate-700">
                  Medical Notes
                </p>

                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                  {patient.medicalNotes ||
                    "No medical notes available."}
                </p>

              </div>

              <div className="border-t border-sky-100 bg-slate-50 p-6">

                <Link
                  href={`/dashboard/admin/patients/${patient.patientId}/edit`}
                  className="inline-flex rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Update Patient Details
                </Link>

              </div>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

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
    <div className="rounded-2xl border border-slate-100 bg-white p-4">

      <div className="flex items-center gap-3">

        <div className="text-sky-500">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

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
};

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    medicalNotes: "",
  });

  useEffect(() => {
    async function loadPatient() {
      try {
        const { patientId } = await params;

        const response = await fetch(
          `/api/patients/${encodeURIComponent(patientId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Patient not found.");
          return;
        }

        const p = data.patient;

        setPatient(p);

        setForm({
          fullName: p.fullName || "",
          dateOfBirth: p.dateOfBirth
            ? new Date(p.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",
          gender: p.gender || "",
          phone: p.phone || "",
          email: p.email || "",
          address: p.address || "",
          bloodGroup: p.bloodGroup || "",
          emergencyName:
            p.emergencyContact?.name || "",
          emergencyPhone:
            p.emergencyContact?.phone || "",
          emergencyRelationship:
            p.emergencyContact?.relationship || "",
          medicalNotes:
            p.medicalNotes || "",
        });
      } catch (error) {
        console.error(error);
        setMessage("Unable to load patient.");
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [params]);

  function updateField(
    field: string,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const { patientId } = await params;

      const response = await fetch(
        `/api/patients/${encodeURIComponent(patientId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            phone: form.phone,
            email: form.email,
            address: form.address,
            bloodGroup: form.bloodGroup,
            emergencyContact: {
              name: form.emergencyName,
              phone: form.emergencyPhone,
              relationship:
                form.emergencyRelationship,
            },
            medicalNotes: form.medicalNotes,
          }),
        }
      );

      const responseText = await response.text();

let data: any = {};

try {
  data = responseText
    ? JSON.parse(responseText)
    : {};
} catch {
  data = {};
}

if (!response.ok) {
  setMessage(
    data.message ||
      `Update failed. Server returned ${response.status}.`
  );
  return;
}

setMessage(
  data.message ||
    "Patient updated successfully."
);

      alert("Patient details updated successfully.");

      window.location.href = "/dashboard/admin/patients";
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-slate-500">
          Loading patient...
        </p>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50 p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Patient not found
          </h1>

          <p className="mt-2 text-sm text-red-500">
            {message}
          </p>

          <Link
          href="/dashboard/admin/patients"
            className="mt-6 inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white"
          >
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sky-50">
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard/admin/patients"
            className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Receptionist
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Update Patient
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl p-6 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm lg:p-9"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <UserRound size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="text-sm text-sky-600">
                Patient ID: {patient.patientId}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Full Name *"
              value={form.fullName}
              onChange={(v) =>
                updateField("fullName", v)
              }
              required
            />

            <Input
              label="Date of Birth *"
              type="date"
              value={form.dateOfBirth}
              onChange={(v) =>
                updateField("dateOfBirth", v)
              }
              required
            />

            <Select
              label="Gender *"
              value={form.gender}
              onChange={(v) =>
                updateField("gender", v)
              }
              options={[
                "Male",
                "Female",
                "Other",
              ]}
              required
            />

            <Input
              label="Phone *"
              value={form.phone}
              onChange={(v) =>
                updateField("phone", v)
              }
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) =>
                updateField("email", v)
              }
            />

            <Select
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(v) =>
                updateField("bloodGroup", v)
              }
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
          </div>

          <div className="mt-5">
            <Input
              label="Address *"
              value={form.address}
              onChange={(v) =>
                updateField("address", v)
              }
              required
            />
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Emergency Contact
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Someone to contact in case of emergency.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Input
                label="Name"
                value={form.emergencyName}
                onChange={(v) =>
                  updateField(
                    "emergencyName",
                    v
                  )
                }
              />

              <Input
                label="Phone"
                value={form.emergencyPhone}
                onChange={(v) =>
                  updateField(
                    "emergencyPhone",
                    v
                  )
                }
              />

              <Input
                label="Relationship"
                value={
                  form.emergencyRelationship
                }
                onChange={(v) =>
                  updateField(
                    "emergencyRelationship",
                    v
                  )
                }
              />
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Initial Medical Notes
            </h2>

            <textarea
              value={form.medicalNotes}
              onChange={(event) =>
                updateField(
                  "medicalNotes",
                  event.target.value
                )
              }
              rows={5}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          {message && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-sky-600 py-4 font-semibold text-white shadow-lg hover:bg-sky-700 disabled:opacity-60"
          >
            {saving
              ? "Updating Patient..."
              : "Update Patient"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
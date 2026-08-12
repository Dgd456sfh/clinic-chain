"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
} from "lucide-react";

export default function RegisterPatient() {

  const [loading, setLoading] =
    useState(false);

  const [registeredId, setRegisteredId] =
    useState("");

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

    setLoading(true);

    try {

      const response = await fetch(
        "/api/patients",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName: form.fullName,
            dateOfBirth:
              form.dateOfBirth,
            gender: form.gender,
            phone: form.phone,
            email: form.email,
            address: form.address,
            bloodGroup:
              form.bloodGroup,

            emergencyContact: {
              name:
                form.emergencyName,

              phone:
                form.emergencyPhone,

              relationship:
                form.emergencyRelationship,
            },

            medicalNotes:
              form.medicalNotes,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(data.message);

        return;
      }


      setRegisteredId(
        data.patient.patientId
      );


    } catch (error) {

      console.error(error);

      alert(
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  }


  if (registeredId) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-sky-50 p-6">

        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">

            <CheckCircle2 size={36} />

          </div>


          <h1 className="mt-6 text-2xl font-bold text-slate-900">

            Patient Registered!

          </h1>


          <p className="mt-2 text-sm text-slate-500">

            The patient's unique Clinic-Chain ID is:

          </p>


          <div className="mt-6 rounded-2xl bg-sky-50 p-5">

            <p className="text-3xl font-bold tracking-widest text-sky-700">

              {registeredId}

            </p>

          </div>


          <p className="mt-5 text-sm text-slate-500">

            Save this ID. Doctors, receptionists
            and authorized staff can use it to
            find this patient's records.

          </p>


          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
          >

            Register Another Patient

          </button>

        </div>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-sky-50">

      {/* HEADER */}

      <header className="border-b border-sky-100 bg-white">

        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">

          <a
            href="/dashboard/admin"
            className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
          >

            <ArrowLeft size={20} />

          </a>


          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">

              <HeartPulse size={21} />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">

                Clinic-Chain

              </p>

              <h1 className="text-xl font-bold text-slate-900">

                Patient Registration

              </h1>

            </div>

          </div>

        </div>

      </header>


      {/* FORM */}

      <section className="mx-auto max-w-4xl p-6 lg:p-8">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm lg:p-9"
        >

          <div className="mb-8">

            <h2 className="text-xl font-bold text-slate-900">

              Personal Information

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Enter the patient's basic information.

            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Full Name *"
              value={form.fullName}
              onChange={(value) =>
                updateField(
                  "fullName",
                  value
                )
              }
            />


            <Input
              label="Date of Birth *"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) =>
                updateField(
                  "dateOfBirth",
                  value
                )
              }
            />


            <Select
              label="Gender *"
              value={form.gender}
              onChange={(value) =>
                updateField(
                  "gender",
                  value
                )
              }
              options={[
                "Male",
                "Female",
                "Other",
              ]}
            />


            <Input
              label="Phone *"
              value={form.phone}
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />


            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField(
                  "email",
                  value
                )
              }
            />


            <Select
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(value) =>
                updateField(
                  "bloodGroup",
                  value
                )
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
              onChange={(value) =>
                updateField(
                  "address",
                  value
                )
              }
            />

          </div>


          {/* EMERGENCY */}

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
                value={
                  form.emergencyName
                }
                onChange={(value) =>
                  updateField(
                    "emergencyName",
                    value
                  )
                }
              />


              <Input
                label="Phone"
                value={
                  form.emergencyPhone
                }
                onChange={(value) =>
                  updateField(
                    "emergencyPhone",
                    value
                  )
                }
              />


              <Input
                label="Relationship"
                value={
                  form.emergencyRelationship
                }
                onChange={(value) =>
                  updateField(
                    "emergencyRelationship",
                    value
                  )
                }
              />

            </div>

          </div>


          {/* NOTES */}

          <div className="mt-10 border-t border-slate-100 pt-8">

            <h2 className="text-xl font-bold text-slate-900">

              Initial Medical Notes

            </h2>


            <textarea
              value={
                form.medicalNotes
              }
              onChange={(event) =>
                updateField(
                  "medicalNotes",
                  event.target.value
                )
              }
              rows={5}
              placeholder="Enter any important initial information..."
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-sky-600 py-4 font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Registering Patient..."
              : "Register Patient"}

          </button>

        </form>

      </section>

    </main>

  );
}


/* INPUT */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
          onChange(
            event.target.value
          )
        }
        required={
          label.includes("*")
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />

    </div>

  );
}


/* SELECT */

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        required={
          label.includes("*")
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      >

        <option value="">
          Select
        </option>

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {option}
            </option>

          )
        )}

      </select>

    </div>

  );
}
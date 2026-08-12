"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";

type Clinic = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  totalDoctors: number;
  totalPatients: number;
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  async function fetchClinics() {
    try {
      const response = await fetch("/api/clinics");
      const data = await response.json();

      if (data.success) {
        setClinics(data.clinics);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClinics();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setClinics((current) => [
        data.clinic,
        ...current,
      ]);

      setForm({
        name: "",
        address: "",
        phone: "",
        email: "",
      });

      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-sky-50">

      {/* HEADER */}

      <header className="border-b border-sky-100 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <a
              href="/dashboard/admin"
              className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
            >
              <ArrowLeft size={20} />
            </a>

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                Admin
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Clinic Management
              </h1>

            </div>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
          >
            <Plus size={18} />
            Add Clinic
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-7xl p-6 lg:p-8">

        {/* SEARCH */}

        <div className="mb-6 flex items-center rounded-2xl border border-sky-100 bg-white px-4 shadow-sm">

          <Search
            size={19}
            className="text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search clinics..."
            className="w-full bg-transparent px-3 py-4 text-sm outline-none"
          />

        </div>


        {/* CLINICS */}

        {loading ? (

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <p className="text-slate-500">
              Loading clinics...
            </p>

          </div>

        ) : filteredClinics.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-16 text-center">

            <Building2
              size={45}
              className="mx-auto text-sky-300"
            />

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No clinics found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your first clinic to get started.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Add Clinic
            </button>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredClinics.map((clinic) => (

              <div
                key={clinic._id}
                className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Building2 size={23} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      clinic.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {clinic.status}
                  </span>

                </div>


                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {clinic.name}
                </h2>


                <div className="mt-5 space-y-3">

                  <Info
                    icon={<MapPin size={16} />}
                    text={clinic.address}
                  />

                  <Info
                    icon={<Phone size={16} />}
                    text={clinic.phone}
                  />

                  <Info
                    icon={<Mail size={16} />}
                    text={clinic.email}
                  />

                </div>


                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-sky-50 p-3 text-center">

                    <p className="text-xl font-bold text-sky-700">
                      {clinic.totalDoctors}
                    </p>

                    <p className="text-xs text-slate-500">
                      Doctors
                    </p>

                  </div>

                  <div className="rounded-xl bg-sky-50 p-3 text-center">

                    <p className="text-xl font-bold text-sky-700">
                      {clinic.totalPatients}
                    </p>

                    <p className="text-xs text-slate-500">
                      Patients
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ADD CLINIC MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">

          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Add New Clinic
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the clinic details below.
                </p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >

              <Input
                label="Clinic Name"
                value={form.name}
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />

              <Input
                label="Address"
                value={form.address}
                onChange={(value) =>
                  setForm({
                    ...form,
                    address: value,
                  })
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      phone: value,
                    })
                  }
                />

                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      email: value,
                    })
                  }
                />

              </div>


              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-sky-600 py-3.5 font-semibold text-white hover:bg-sky-700"
              >
                Create Clinic
              </button>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}


/* INFO */

function Info({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">

      <span className="text-sky-500">
        {icon}
      </span>

      <span className="truncate">
        {text}
      </span>

    </div>
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
          onChange(event.target.value)
        }
        required
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />

    </div>
  );
}
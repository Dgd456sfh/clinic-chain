"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

type Role =
  | "patient"
  | "doctor"
  | "receptionist"
  | "admin";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      {!selectedRole ? (
        <RoleSelection onSelect={setSelectedRole} />
      ) : (
        <RegistrationForm
          role={selectedRole}
          onBack={() => setSelectedRole(null)}
        />
      )}
    </main>
  );
}

/* ================= ROLE SELECTION ================= */

function RoleSelection({
  onSelect,
}: {
  onSelect: (role: Role) => void;
}) {
  const roles = [
    {
      id: "patient" as Role,
      title: "Patient",
      description:
        "Create your patient account and manage your healthcare records.",
      icon: UserRound,
    },
    {
      id: "doctor" as Role,
      title: "Doctor",
      description:
        "Register as a doctor and manage patients and appointments.",
      icon: Stethoscope,
    },
    {
      id: "receptionist" as Role,
      title: "Receptionist",
      description:
        "Handle appointments, patients and clinic operations.",
      icon: Users,
    },
    {
      id: "admin" as Role,
      title: "Admin",
      description:
        "Manage clinics, staff, patients and the Clinic-Chain system.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-12 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
          Clinic-Chain
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Choose your role to continue with registration.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="group rounded-3xl border border-sky-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition duration-300 group-hover:bg-sky-600 group-hover:text-white">
                <Icon size={27} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                {role.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {role.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-600">
                Continue
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-sky-600 hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}

/* ================= REGISTRATION FORM ================= */

function RegistrationForm({
  role,
  onBack,
}: {
  role: Role;
  onBack: () => void;
}) {
  const router = useRouter();

  const roleName =
    role.charAt(0).toUpperCase() + role.slice(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
    specialization: "",
    qualification: "",
    license: "",
    experience: "",
    clinic: "",
    adminCode: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (role === "admin" && !formData.adminCode) {
      alert("Please enter the admin verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: role,

            adminCode:
              role === "admin"
                ? formData.adminCode
                : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Registration failed."
        );
        return;
      }

      alert(
        "Registration successful! Redirecting to login..."
      );

      router.push("/login");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600"
      >
        <ArrowLeft size={17} />
        Change role
      </button>

      <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-xl md:p-10">

        {/* HEADER */}

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            {role === "doctor" && (
              <Stethoscope size={27} />
            )}

            {role === "patient" && (
              <UserRound size={27} />
            )}

            {role === "receptionist" && (
              <Users size={27} />
            )}

            {role === "admin" && (
              <ShieldCheck size={27} />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-sky-600">
              Registration
            </p>

            <h2 className="text-2xl font-bold text-slate-900">
              {roleName} Account
            </h2>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* COMMON FIELDS */}

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* PATIENT */}

          {role === "patient" && (
            <>
              <div className="grid gap-5 border-t border-sky-100 pt-5 md:grid-cols-2">

                <Input
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />

                <Select
                  name="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                  ]}
                  required
                />
              </div>

              <Input
                name="address"
                label="Address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <Select
                name="bloodGroup"
                label="Blood Group"
                value={formData.bloodGroup}
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
            </>
          )}

          {/* DOCTOR */}

          {role === "doctor" && (
            <div className="grid gap-5 border-t border-sky-100 pt-5 md:grid-cols-2">

              <Input
                name="specialization"
                label="Specialization"
                placeholder="e.g. Cardiologist"
                value={formData.specialization}
                onChange={handleChange}
              />

              <Input
                name="qualification"
                label="Qualification"
                placeholder="e.g. MBBS, MD"
                value={formData.qualification}
                onChange={handleChange}
              />

              <Input
                name="license"
                label="Medical License Number"
                placeholder="License number"
                value={formData.license}
                onChange={handleChange}
              />

              <Input
                name="experience"
                label="Years of Experience"
                type="number"
                placeholder="e.g. 5"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>
          )}

          {/* RECEPTIONIST */}

          {role === "receptionist" && (
            <div className="border-t border-sky-100 pt-5">
              <Select
                name="clinic"
                label="Assigned Clinic"
                value={formData.clinic}
                onChange={handleChange}
                options={[
                  "City Care Clinic",
                  "HealthPlus Clinic",
                  "Wellness Center",
                ]}
              />
            </div>
          )}

          {/* ADMIN */}

          {role === "admin" && (
            <div className="border-t border-sky-100 pt-5">
              <Input
                name="adminCode"
                label="Admin Verification Code"
                placeholder="Enter admin code"
                type="password"
                value={formData.adminCode}
                onChange={handleChange}
                required
              />

              <p className="mt-2 text-xs text-slate-400">
                Enter the administrator verification code.
              </p>
            </div>
          )}

          {/* TERMS */}

          <div className="flex items-start gap-3 rounded-xl bg-sky-50 p-4">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 accent-sky-600"
            />

            <p className="text-xs leading-5 text-slate-600">
              I agree to the Clinic-Chain terms
              of service and privacy policy.
            </p>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3.5 font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : `Create ${roleName} Account`}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-sky-600 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function Input({
  name,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}*
          </span>
        )}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
    </div>
  );
}

/* ================= SELECT ================= */

function Select({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
}: {
  name: string;
  label: string;
  options: string[];
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}*
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-sky-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
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
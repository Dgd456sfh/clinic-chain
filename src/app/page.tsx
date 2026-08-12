"use client";

import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  ClipboardPlus,
  HeartPulse,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-sky-50 text-slate-800">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(14,165,233,0.65)] group-hover:animate-pulse">
              <HeartPulse size={25} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Clinic<span className="text-sky-600">-Chain</span>
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-sky-500">
                Healthcare Connected
              </p>
            </div>
          </Link>


          {/* DESKTOP NAVIGATION */}

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-sky-600"
            >
              About
            </a>

            <Link
              href="/register"
              className="text-sm font-medium text-slate-600 transition hover:text-sky-600"
            >
              Register
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition hover:text-sky-600"
            >
              Login
            </Link>

            <Link
              href="/book-appointment"
              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-lg"
            >
              Book Appointment
            </Link>

          </div>


          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-700 md:hidden"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

        </div>


        {/* MOBILE NAVIGATION */}

        {menuOpen && (

          <div className="border-t border-sky-100 bg-white px-6 py-5 md:hidden">

            <div className="flex flex-col gap-4">

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-slate-700"
              >
                About
              </a>

              <Link
                href="/register"
                className="font-medium text-slate-700"
              >
                Register
              </Link>

              <Link
                href="/login"
                className="font-medium text-slate-700"
              >
                Login
              </Link>

              <Link
                href="/book-appointment"
                className="rounded-xl bg-sky-600 px-5 py-3 text-center font-semibold text-white"
              >
                Book Appointment
              </Link>

            </div>

          </div>

        )}

      </nav>


      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        {/* Background decoration */}

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />


        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">

          {/* LEFT */}

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 shadow-sm">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-sm font-medium text-sky-700">
                Smarter Healthcare Management
              </span>

            </div>


            <h2 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">

              Your Health.

              <span className="block text-sky-600">
                Connected.
              </span>

            </h2>


            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">

              Clinic-Chain brings clinics, doctors, receptionists and
              patients together on one simple healthcare management
              platform.

            </p>


            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/book-appointment"
                className="rounded-full bg-sky-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-1 hover:bg-sky-700 hover:shadow-xl"
              >
                Book Appointment
              </Link>

              <Link
                href="/register"
                className="rounded-full border border-sky-200 bg-white px-7 py-3.5 font-semibold text-sky-700 transition hover:-translate-y-1 hover:border-sky-300 hover:bg-sky-50"
              >
                Create Account
              </Link>

            </div>


            {/* TRUST */}

            <div className="mt-10 flex flex-wrap gap-6">

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="text-sky-600" size={18} />
                Secure
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Activity className="text-sky-600" size={18} />
                Connected
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="text-sky-600" size={18} />
                Patient-focused
              </div>

            </div>

          </div>


          {/* RIGHT HEALTHCARE CARD */}

          <div className="relative">

            <div className="absolute inset-0 rounded-[2rem] bg-sky-300/30 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white bg-white/80 p-6 shadow-2xl backdrop-blur-md">

              {/* Header */}

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Today's Overview
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    Healthcare at a glance
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <HeartPulse size={25} />
                </div>

              </div>


              {/* Stats */}

              <div className="mt-8 grid grid-cols-2 gap-4">

                <StatCard
                  icon={<Stethoscope size={20} />}
                  number="86"
                  label="Doctors"
                />

                <StatCard
                  icon={<Users size={20} />}
                  number="2.4K"
                  label="Patients"
                />

                <StatCard
                  icon={<CalendarCheck size={20} />}
                  number="348"
                  label="Appointments"
                />

                <StatCard
                  icon={<ClipboardPlus size={20} />}
                  number="12"
                  label="Clinics"
                />

              </div>


              {/* Appointment card */}

              <div className="mt-5 rounded-2xl bg-sky-600 p-5 text-white">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-sky-100">
                      Next Appointment
                    </p>

                    <p className="mt-1 font-bold">
                      Dr. Rajesh Mehta
                    </p>

                    <p className="mt-1 text-sm text-sky-100">
                      Today • 10:30 AM
                    </p>

                  </div>

                  <CalendarCheck size={30} />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="border-y border-sky-100 bg-white"
      >

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold uppercase tracking-widest text-sky-600">
              About Clinic-Chain
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              One platform for better healthcare
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              Clinic-Chain helps healthcare organizations manage their
              clinics, doctors, receptionists, appointments, patients,
              medical records and prescriptions from one connected system.
            </p>

          </div>


          {/* FEATURES */}

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <FeatureCard
              icon={<CalendarCheck size={25} />}
              title="Easy Appointments"
              description="Find doctors, choose available time slots and manage appointments without unnecessary hassle."
            />

            <FeatureCard
              icon={<Stethoscope size={25} />}
              title="Connected Doctors"
              description="Doctors can manage appointments, patient information, medical records and prescriptions."
            />

            <FeatureCard
              icon={<ShieldCheck size={25} />}
              title="Secure Records"
              description="Keep important healthcare information organized and accessible to authorized users."
            />

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="bg-sky-600">

        <div className="mx-auto max-w-5xl px-6 py-20 text-center">

          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to simplify healthcare?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sky-100">
            Join Clinic-Chain and manage your healthcare journey from
            one connected platform.
          </p>

          <div className="mt-8 flex justify-center gap-4">

            <Link
              href="/register"
              className="rounded-full bg-white px-7 py-3.5 font-semibold text-sky-700 transition hover:-translate-y-1 hover:shadow-xl"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-sky-300 px-7 py-3.5 font-semibold text-white transition hover:bg-sky-700"
            >
              Login
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 px-6 py-8 text-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">

          <div className="flex items-center gap-2">

            <HeartPulse size={20} className="text-sky-400" />

            <span className="font-semibold">
              Clinic-Chain
            </span>

          </div>

          <p className="text-sm text-slate-400">
            © 2026 Clinic-Chain. Healthcare, connected.
          </p>

        </div>

      </footer>

    </main>
  );
}


/* ================= COMPONENTS ================= */

function StatCard({
  icon,
  number,
  label,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {number}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>

    </div>
  );
}


function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-sky-100 bg-sky-50 p-7 transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm transition group-hover:bg-sky-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

    </div>
  );
}
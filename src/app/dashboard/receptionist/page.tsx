"use client";

import Link from "next/link";
import {
  Search,
  UserRound,
  LogOut,
  Users,
} from "lucide-react";

export default function ReceptionistDashboard() {
  return (
    <main className="min-h-screen bg-sky-50">

      {/* HEADER */}

      <header className="border-b border-sky-100 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Users size={24} />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                Clinic-Chain
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Receptionist Dashboard
              </h1>

            </div>

          </div>


          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </Link>

        </div>

      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* WELCOME */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, Receptionist
          </h2>

          <p className="mt-2 text-slate-500">
            Search and manage patient information using their unique Patient ID.
          </p>

        </div>


        {/* MAIN CARDS */}

        <div className="grid gap-6 md:grid-cols-2">


          {/* SEARCH PATIENT */}

          <Link
          href="/dashboard/receptionist/search"
          className="group rounded-3xl border border-sky-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl"
          >
          

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">

              <Search size={27} />

            </div>


            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Search Patient
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Search for a patient using their unique Patient ID and view their information.
            </p>


            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-600">

              Search Patient

              <span className="transition group-hover:translate-x-1">
                →
              </span>

            </div>

          </Link>


          {/* PATIENT REGISTRATION */}

          <Link
          href="/register"
          className="group rounded-3xl border border-sky-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl"
>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">

              <UserRound size={27} />

            </div>


            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Register Patient
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Register a new patient and generate their unique Clinic-Chain Patient ID.
            </p>


            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-600">

              Register Patient

              <span className="transition group-hover:translate-x-1">
                →
              </span>

            </div>

          </Link>

        </div>


        {/* INFORMATION */}

        <div className="mt-8 rounded-3xl border border-sky-100 bg-white p-7 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <UserRound size={21} />
            </div>

            <div>

              <h3 className="font-bold text-slate-900">
                Receptionist Access
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You can search patients using their Patient ID
                and update their information. Doctor and Admin
                accounts can view patient information but cannot
                update it from the receptionist section.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
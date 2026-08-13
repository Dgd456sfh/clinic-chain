"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  History,
  UserRound,
  ShieldCheck,
  Calendar,
} from "lucide-react";

type HistoryItem = {
  _id: string;
  patientId: string;
  action: string;

  changes: string[];

  updatedBy?: {
    name?: string;
    role?: string;
  };

  createdAt: string;
};

type Patient = {
  patientId: string;
  email?: string;
};

export default function PatientHistoryPage() {
  const [history, setHistory] = useState<
    HistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setMessage("");

      // ================= GET LOGGED-IN USER =================

      const meResponse = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const meData = await meResponse.json();

      if (!meResponse.ok || !meData.user) {
        setMessage(
          "Your login session could not be verified."
        );

        return;
      }

      if (meData.user.role !== "patient") {
        setMessage(
          "Only patients can view medical history."
        );

        return;
      }

      // ================= FIND PATIENT USING EMAIL =================

      /*
       * Your existing search API requires patientId,
       * so we don't use it here.
       *
       * Instead, ask the patient API for the record
       * using the logged-in email through this route.
       */

      const patientResponse = await fetch(
        `/api/patients/by-email?email=${encodeURIComponent(
          meData.user.email
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const patientData =
        await patientResponse.json();

      if (!patientResponse.ok) {
        setMessage(
          patientData.message ||
            "Patient record could not be found."
        );

        return;
      }

      const patient: Patient =
        patientData.patient;

      if (!patient?.patientId) {
        setMessage(
          "Patient ID could not be found."
        );

        return;
      }

      // ================= GET HISTORY =================

      const historyResponse = await fetch(
        `/api/patients/${encodeURIComponent(
          patient.patientId
        )}/history`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const historyData =
        await historyResponse.json();

      if (!historyResponse.ok) {
        setMessage(
          historyData.message ||
            "Unable to load your history."
        );

        return;
      }

      setHistory(historyData.history || []);
    } catch (error) {
      console.error(
        "Patient history error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-sky-50">

      {/* ================= HEADER ================= */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">

          <Link
            href="/dashboard/patient"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Clinic-Chain
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              My Medical History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View all updates made to your patient
              record.
            </p>
          </div>

        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-5xl px-6 py-10">

        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm md:p-10">

          {/* TITLE */}

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <History size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Update History
              </h2>

              <p className="text-sm text-slate-500">
                Every update made to your patient
                record appears here.
              </p>
            </div>

          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">

              <p className="text-sm text-slate-500">
                Loading your history...
              </p>

            </div>
          )}

          {/* ================= ERROR ================= */}

          {message && !loading && (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">

              <p className="text-sm font-medium text-red-600">
                {message}
              </p>

            </div>
          )}

          {/* ================= EMPTY ================= */}

          {!loading &&
            !message &&
            history.length === 0 && (

              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">

                <History
                  size={35}
                  className="mx-auto text-slate-400"
                />

                <h3 className="mt-4 font-semibold text-slate-700">
                  No update history yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Updates made to your patient record
                  will appear here.
                </p>

              </div>
            )}

          {/* ================= HISTORY ================= */}

          {!loading &&
            !message &&
            history.length > 0 && (

              <div className="relative mt-10">

                <div className="absolute left-5 top-2 hidden h-full w-px bg-sky-100 sm:block" />

                <div className="space-y-7">

                  {history.map((item) => (

                    <div
                      key={item._id}
                      className="relative sm:pl-14"
                    >

                      {/* ICON */}

                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <History size={18} />
                      </div>

                      {/* CARD */}

                      <div className="mt-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:mt-0">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <h3 className="font-bold text-slate-900">
                              {item.action}
                            </h3>

                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">

                              <Calendar size={14} />

                              {formatDate(
                                item.createdAt
                              )}

                            </div>

                          </div>

                          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">

                            <ShieldCheck size={14} />

                            Record Updated

                          </div>

                        </div>

                        {/* CHANGES */}

                        {item.changes &&
                          item.changes.length > 0 && (

                            <div className="mt-5 rounded-xl bg-sky-50 p-4">

                              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                                Changes
                              </p>

                              <ul className="mt-3 space-y-2">

                                {item.changes.map(
                                  (
                                    change,
                                    index
                                  ) => (

                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm text-slate-600"
                                    >

                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />

                                      <span>
                                        {change}
                                      </span>

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                        {/* UPDATED BY */}

                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">

                          <UserRound size={14} />

                          <span>
                            Updated by:{" "}

                            <span className="font-semibold text-slate-500">
                              {item.updatedBy?.name ||
                                "Receptionist"}
                            </span>
                          </span>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}

        </div>

      </section>

    </main>
  );
}
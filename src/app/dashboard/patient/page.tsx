"use client";

import { useEffect, useState } from "react";

import {
  UserRound,
  HeartPulse,
  FileText,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Droplets,
  LogOut,
  Loader2,
  AlertCircle,
  Stethoscope,
  Pill,
  ClipboardList,
} from "lucide-react";

import { useRouter } from "next/navigation";

// ============================================================
// TYPES
// ============================================================

type MedicalPdf = {
  name?: string;
  path?: string;
  uploadedAt?: string;

  uploadedBy?: {
    userId?: string;
    name?: string;
    role?: string;
  };
};

type Patient = {
  patientId: string;

  fullName: string;

  dateOfBirth?: string;

  gender?: string;

  phone?: string;

  email?: string;

  address?: string;

  bloodGroup?: string;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  // Old single PDF
  medicalPdf?: {
    name?: string;
    path?: string;
  };

  // New PDF history
  medicalPdfs?: MedicalPdf[];

  medicalNotes?: string;

  updatedAt?: string;
};

type MedicalHistory = {
  _id?: string;

  patientId?: string;

  patientCode?: string;

  doctorName?: string;

  diagnosis?: string;

  prescription?: string;

  treatment?: string;

  notes?: string;

  visitDate?: string;

  date?: string;

  createdAt?: string;

  enteredBy?: {
    name?: string;
    role?: string;
  };
};

// ============================================================
// PAGE
// ============================================================

export default function PatientDashboard() {
  const router = useRouter();

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [history, setHistory] =
    useState<MedicalHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadPatientData();
  }, []);

  async function loadPatientData() {
    try {
      setLoading(true);

      setError("");

      // ======================================================
      // STEP 1
      // GET CURRENT LOGGED-IN USER
      // ======================================================

      const authResponse =
        await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

      const authData =
        await authResponse.json();

      if (!authResponse.ok) {
        router.push("/login");
        return;
      }

      const user = authData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // ======================================================
      // MAKE SURE USER IS PATIENT
      // ======================================================

      if (user.role !== "patient") {
        setError(
          "This dashboard is only available for patient accounts."
        );

        return;
      }

      // ======================================================
      // GET PATIENT ID
      // ======================================================

      const patientId =
        user.patientId;

      if (!patientId) {
        setError(
          "Your Patient ID could not be found. Please login again."
        );

        return;
      }

      // ======================================================
      // STEP 2
      // FETCH PATIENT PROFILE
      // ======================================================

      const patientResponse =
        await fetch(
          `/api/patients/${encodeURIComponent(
            patientId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const patientData =
        await patientResponse.json();

      if (!patientResponse.ok) {
        throw new Error(
          patientData.message ||
            "Unable to load patient profile."
        );
      }

      const loadedPatient =
        patientData.patient ||
        patientData.data;

      if (!loadedPatient) {
        throw new Error(
          "Patient profile was not found."
        );
      }

      // ======================================================
      // STEP 2.5
      // FETCH ALL PDF HISTORY
      // ======================================================

      let medicalPdfs: MedicalPdf[] =
        [];

      try {
        const pdfResponse =
          await fetch(
            `/api/patients/${encodeURIComponent(
              patientId
            )}/pdf`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const pdfData =
          await pdfResponse.json();

        if (pdfResponse.ok) {
          medicalPdfs =
            Array.isArray(
              pdfData.medicalPdfs
            )
              ? pdfData.medicalPdfs
              : [];
        }
      } catch (pdfError) {
        console.error(
          "Unable to load PDF history:",
          pdfError
        );
      }

      // ======================================================
      // BACKWARD COMPATIBILITY
      //
      // If database only has old medicalPdf,
      // put it into medicalPdfs.
      // ======================================================

      if (
        medicalPdfs.length === 0 &&
        loadedPatient.medicalPdf?.path
      ) {
        medicalPdfs = [
          {
            name:
              loadedPatient.medicalPdf.name ||
              "Medical Document",

            path:
              loadedPatient.medicalPdf.path,

            uploadedAt:
              loadedPatient.updatedAt ||
              undefined,
          },
        ];
      }

      // ======================================================
      // SORT PDFS
      //
      // Newest first.
      // ======================================================

      medicalPdfs.sort(
        (
          first,
          second
        ) => {
          const firstTime =
            first.uploadedAt
              ? new Date(
                  first.uploadedAt
                ).getTime()
              : 0;

          const secondTime =
            second.uploadedAt
              ? new Date(
                  second.uploadedAt
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        }
      );

      // ======================================================
      // SAVE PATIENT
      // ======================================================

      setPatient({
        ...loadedPatient,
        medicalPdfs,
      });

      // ======================================================
      // STEP 3
      // FETCH ALL MEDICAL HISTORY
      // ======================================================

      const historyResponse =
        await fetch(
          `/api/medical-history?patientId=${encodeURIComponent(
            patientId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const historyData =
        await historyResponse.json();

      if (!historyResponse.ok) {
        throw new Error(
          historyData.message ||
            "Unable to load medical history."
        );
      }

      setHistory(
        historyData.history ||
          historyData.data ||
          []
      );
    } catch (err) {
      console.error(
        "Patient dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your records."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    router.push("/login");
  }

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==========================================================
  // GET FILE NAME
  //
  // Example:
  // /uploads/medical/abc.pdf
  //
  // returns:
  // abc.pdf
  // ==========================================================

  function getFileName(
    filePath?: string
  ) {
    if (!filePath) {
      return "";
    }

    return filePath
      .split("/")
      .pop() || "";
  }

  // ==========================================================
  // CREATE SECURE PDF URL
  //
  // IMPORTANT:
  // We DO NOT use pdf.path directly.
  //
  // Instead:
  //
  // /api/patients/PATIENT_ID/pdf?file=FILE_NAME
  //
  // This allows the API to verify the PDF belongs
  // to this patient before serving it.
  // ==========================================================

  function getPdfUrl(
    patientId: string,
    pdfPath?: string
  ) {
    const fileName =
      getFileName(pdfPath);

    if (!fileName) {
      return "";
    }

    return `/api/patients/${encodeURIComponent(
      patientId
    )}/pdf?file=${encodeURIComponent(
      fileName
    )}`;
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-sky-600"
            size={40}
          />

          <p className="mt-4 font-medium text-slate-600">
            Loading your medical records...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <main className="min-h-screen bg-sky-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            className="mx-auto text-red-500"
            size={45}
          />

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Unable to load your records
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.push("/login")
            }
            className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  // ==========================================================
  // NO PATIENT
  // ==========================================================

  if (!patient) {
    return null;
  }

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (
    <main className="min-h-screen bg-sky-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              Clinic-Chain
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Patient Dashboard
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">

        {/* ====================================================
            WELCOME
        ==================================================== */}

        <div className="mb-8 rounded-3xl bg-sky-600 p-7 text-white shadow-lg">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-sm text-sky-100">
                Welcome back
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {patient.fullName}
              </h2>

              <p className="mt-2 text-sm text-sky-100">
                Your profile and medical history are
                available below.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">

              <p className="text-xs uppercase tracking-wider text-sky-100">
                Patient ID
              </p>

              <p className="mt-1 text-xl font-bold">
                {patient.patientId}
              </p>

            </div>

          </div>
        </div>

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <div className="mb-8 rounded-3xl border border-sky-100 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <UserRound size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                My Profile
              </h2>

              <p className="text-sm text-slate-500">
                Your personal information
              </p>

            </div>

          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <ProfileItem
              icon={
                <UserRound size={18} />
              }
              label="Full Name"
              value={patient.fullName}
            />

            <ProfileItem
              icon={
                <CalendarDays size={18} />
              }
              label="Date of Birth"
              value={formatDate(
                patient.dateOfBirth
              )}
            />

            <ProfileItem
              icon={
                <UserRound size={18} />
              }
              label="Gender"
              value={
                patient.gender ||
                "Not available"
              }
            />

            <ProfileItem
              icon={
                <Phone size={18} />
              }
              label="Phone"
              value={
                patient.phone ||
                "Not available"
              }
            />

            <ProfileItem
              icon={
                <Mail size={18} />
              }
              label="Email"
              value={
                patient.email ||
                "Not available"
              }
            />

            <ProfileItem
              icon={
                <Droplets size={18} />
              }
              label="Blood Group"
              value={
                patient.bloodGroup ||
                "Unknown"
              }
            />

            <ProfileItem
              icon={
                <MapPin size={18} />
              }
              label="Address"
              value={
                patient.address ||
                "Not available"
              }
            />

          </div>
        </div>

        {/* ====================================================
            EMERGENCY CONTACT
        ==================================================== */}

        <div className="mb-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Phone size={23} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Emergency Contact
              </h2>

              <p className="text-sm text-slate-500">
                Contact information for emergencies
              </p>

            </div>

          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <ProfileItem
              icon={
                <UserRound size={18} />
              }
              label="Name"
              value={
                patient
                  .emergencyContact
                  ?.name ||
                "Not available"
              }
            />

            <ProfileItem
              icon={
                <Phone size={18} />
              }
              label="Phone"
              value={
                patient
                  .emergencyContact
                  ?.phone ||
                "Not available"
              }
            />

            <ProfileItem
              icon={
                <UserRound size={18} />
              }
              label="Relationship"
              value={
                patient
                  .emergencyContact
                  ?.relationship ||
                "Not available"
              }
            />

          </div>
        </div>

        {/* ====================================================
            MEDICAL HISTORY
        ==================================================== */}

        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <HeartPulse size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Medical History
              </h2>

              <p className="text-sm text-slate-500">
                Your previous medical records and consultations
              </p>

            </div>

          </div>

          {/* ==================================================
              GENERAL MEDICAL NOTES
          ================================================== */}

          {patient.medicalNotes && (
            <div className="mt-6 rounded-2xl bg-sky-50 p-5">

              <p className="text-sm font-semibold text-sky-700">
                Medical Notes
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {patient.medicalNotes}
              </p>

            </div>
          )}

          {/* ==================================================
              ALL MEDICAL VISITS
          ================================================== */}

          {history.length === 0 ? (

            <div className="mt-7 rounded-2xl border border-dashed border-slate-200 p-10 text-center">

              <HeartPulse
                className="mx-auto text-slate-300"
                size={42}
              />

              <h3 className="mt-4 font-semibold text-slate-700">
                No medical history yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your medical records will appear here when they are added.
              </p>

            </div>

          ) : (

            <div className="mt-7 space-y-5">

              {history.map(
                (
                  record,
                  index
                ) => (

                  <div
                    key={
                      record._id ||
                      `${record.visitDate}-${index}`
                    }
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
                  >

                    {/* VISIT HEADER */}

                    <div className="flex flex-col justify-between gap-3 md:flex-row">

                      <div>

                        <p className="text-sm font-semibold text-sky-600">
                          Medical Visit{" "}
                          {history.length -
                            index}
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {
                            record.diagnosis ||
                            "Medical consultation"
                          }
                        </h3>

                      </div>

                      <div className="text-sm text-slate-500">

                        <p>
                          {formatDate(
                            record.visitDate ||
                              record.date ||
                              record.createdAt
                          )}
                        </p>

                      </div>

                    </div>

                    {/* DOCTOR */}

                    {record.doctorName && (

                      <div className="mt-4 flex items-start gap-3">

                        <Stethoscope
                          size={18}
                          className="mt-0.5 text-sky-600"
                        />

                        <p className="text-sm text-slate-600">

                          <span className="font-semibold">
                            Doctor:
                          </span>{" "}

                          {record.doctorName}

                        </p>

                      </div>

                    )}

                    {/* ENTERED BY */}

                    {record.enteredBy?.name && (

                      <p className="mt-3 text-sm text-slate-600">

                        <span className="font-semibold">
                          Recorded by:
                        </span>{" "}

                        {record.enteredBy.name}

                      </p>

                    )}

                    {/* PRESCRIPTION */}

                    {record.prescription && (

                      <div className="mt-4 rounded-xl bg-white p-4">

                        <div className="flex items-start gap-3">

                          <Pill
                            size={18}
                            className="mt-0.5 text-sky-600"
                          />

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Prescription
                            </p>

                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                              {record.prescription}
                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                    {/* TREATMENT */}

                    {record.treatment && (

                      <div className="mt-4">

                        <p className="text-sm font-semibold text-slate-700">
                          Treatment
                        </p>

                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {record.treatment}
                        </p>

                      </div>

                    )}

                    {/* NOTES */}

                    {record.notes && (

                      <div className="mt-4 rounded-xl bg-white p-4">

                        <div className="flex items-start gap-3">

                          <ClipboardList
                            size={18}
                            className="mt-0.5 text-sky-600"
                          />

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Notes
                            </p>

                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                              {record.notes}
                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

          {/* ==================================================
              MEDICAL DOCUMENT HISTORY
          ================================================== */}

          <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50 p-5">

            {/* HEADER */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600">
                  <FileText size={22} />
                </div>

                <div>

                  <p className="font-semibold text-slate-800">
                    Medical Documents
                  </p>

                  <p className="text-sm text-slate-500">
                    Your complete medical document history
                  </p>

                </div>

              </div>

              {patient.medicalPdfs &&
                patient.medicalPdfs.length >
                  0 && (

                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-600">

                  {patient.medicalPdfs.length}{" "}

                  document
                  {patient.medicalPdfs
                    .length !== 1
                    ? "s"
                    : ""}

                </span>

              )}

            </div>

            {/* ==================================================
                PDF LIST
            ================================================== */}

            {patient.medicalPdfs &&
            patient.medicalPdfs.length >
              0 ? (

              <div className="space-y-3">

                {patient.medicalPdfs.map(
                  (
                    pdf,
                    index
                  ) => {

                    // ==========================================
                    // GET ACTUAL FILE NAME
                    // ==========================================

                    const fileName =
                      getFileName(
                        pdf.path
                      );

                    // ==========================================
                    // CREATE API URL
                    // ==========================================

                    const pdfUrl =
                      getPdfUrl(
                        patient.patientId,
                        pdf.path
                      );

                    return (

                      <div
                        key={`${pdf.path || pdf.name || "pdf"}-${index}`}
                        className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        {/* PDF INFO */}

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <FileText
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="break-all text-sm font-semibold text-slate-800">
                              {pdf.name ||
                                fileName ||
                                "Medical Document"}
                            </p>

                            {pdf.uploadedAt && (

                              <p className="mt-1 text-xs text-slate-400">
                                Uploaded{" "}
                                {formatDate(
                                  pdf.uploadedAt
                                )}
                              </p>

                            )}

                            {pdf.uploadedBy?.name && (

                              <p className="mt-1 text-xs text-slate-400">
                                Uploaded by{" "}
                                {
                                  pdf
                                    .uploadedBy
                                    .name
                                }
                              </p>

                            )}

                            {/* LATEST */}

                            {index === 0 && (

                              <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                                Latest
                              </span>

                            )}

                          </div>

                        </div>

                        {/* ==================================================
                            VIEW PDF
                        ================================================== */}

                        {pdfUrl ? (

                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
                          >
                            View PDF
                          </a>

                        ) : (

                          <span className="shrink-0 rounded-xl bg-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-500">
                            PDF unavailable
                          </span>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            ) : (

              /* ==================================================
                 NO PDF
              ================================================== */

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">

                <FileText
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No medical documents available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Medical PDFs uploaded by the clinic will appear here.
                </p>

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}

// ============================================================
// PROFILE ITEM
// ============================================================

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-sky-600">

        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}
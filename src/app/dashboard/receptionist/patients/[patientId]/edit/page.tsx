"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  UserRound,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplets,
  HeartPulse,
  FileText,
  Upload,
  Save,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";

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
  _id?: string;

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

  // Old PDF
  medicalPdf?: MedicalPdf;

  // New PDF history
  medicalPdfs?: MedicalPdf[];
};

type MedicalHistoryRecord = {
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
  updatedAt?: string;

  enteredBy?: {
    userId?: string;
    name?: string;
    role?: string;
  };
};

// ============================================================
// PAGE
// ============================================================

export default function EditPatientPage() {
  const params = useParams();

  const patientId = String(params.patientId || "");

  // ============================================================
  // PATIENT
  // ============================================================

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [bloodGroup, setBloodGroup] =
    useState("");

  const [emergencyName, setEmergencyName] =
    useState("");

  const [emergencyPhone, setEmergencyPhone] =
    useState("");

  const [
    emergencyRelationship,
    setEmergencyRelationship,
  ] = useState("");

  const [medicalNotes, setMedicalNotes] =
    useState("");

  // ============================================================
  // PDF
  // ============================================================

  const [pdfUploading, setPdfUploading] =
    useState(false);

  // ============================================================
  // MEDICAL HISTORY
  // ============================================================

  const [history, setHistory] =
    useState<MedicalHistoryRecord[]>([]);

  const [doctorName, setDoctorName] =
    useState("");

  const [diagnosis, setDiagnosis] =
    useState("");

  const [prescription, setPrescription] =
    useState("");

  const [historyNotes, setHistoryNotes] =
    useState("");

  const [visitDate, setVisitDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [addingHistory, setAddingHistory] =
    useState(false);

  const [
    deletingHistoryId,
    setDeletingHistoryId,
  ] = useState<string | null>(null);

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD PATIENT
  // ============================================================

  useEffect(() => {
    if (!patientId) {
      return;
    }

    loadPatient();
    loadMedicalHistory();
    loadMedicalPdfs();
  }, [patientId]);

  // ============================================================
  // LOAD PATIENT
  // ============================================================

  async function loadPatient() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/patients/${encodeURIComponent(
          patientId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        patient?: Patient;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            "Server returned an invalid patient response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to load patient. HTTP ${response.status}.`
        );
      }

      const loadedPatient =
        data.patient;

      if (!loadedPatient) {
        throw new Error(
          "Patient data was not returned by the server."
        );
      }

      setPatient(
        loadedPatient
      );

      setFullName(
        loadedPatient.fullName || ""
      );

      setDateOfBirth(
        loadedPatient.dateOfBirth
          ? new Date(
              loadedPatient.dateOfBirth
            )
              .toISOString()
              .split("T")[0]
          : ""
      );

      setGender(
        loadedPatient.gender || ""
      );

      setPhone(
        loadedPatient.phone || ""
      );

      setEmail(
        loadedPatient.email || ""
      );

      setAddress(
        loadedPatient.address || ""
      );

      setBloodGroup(
        loadedPatient.bloodGroup || ""
      );

      setEmergencyName(
        loadedPatient
          .emergencyContact
          ?.name || ""
      );

      setEmergencyPhone(
        loadedPatient
          .emergencyContact
          ?.phone || ""
      );

      setEmergencyRelationship(
        loadedPatient
          .emergencyContact
          ?.relationship || ""
      );

      setMedicalNotes(
        loadedPatient.medicalNotes || ""
      );
    } catch (err) {
      console.error(
        "Load patient error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load patient."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD MEDICAL HISTORY
  // ============================================================

  async function loadMedicalHistory() {
    try {
      const response = await fetch(
        `/api/medical-history?patientId=${encodeURIComponent(
          patientId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        history?: MedicalHistoryRecord[];
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            "Server returned an invalid medical history response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load medical history. HTTP ${response.status}.`
        );
      }

      setHistory(
        data.history || []
      );
    } catch (err) {
      console.error(
        "Load medical history error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load medical history."
      );
    }
  }

  // ============================================================
  // LOAD ALL MEDICAL PDFs
  // ============================================================

  async function loadMedicalPdfs() {
    try {
      const response = await fetch(
        `/api/patients/${encodeURIComponent(
          patientId
        )}/pdf`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        medicalPdfs?: MedicalPdf[];
        medicalPdf?: MedicalPdf;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            "Server returned an invalid PDF response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load medical PDFs. HTTP ${response.status}.`
        );
      }

      let pdfs =
        data.medicalPdfs || [];

      // ========================================================
      // BACKWARD COMPATIBILITY
      // ========================================================

      if (
        pdfs.length === 0 &&
        data.medicalPdf?.path
      ) {
        pdfs = [
          data.medicalPdf,
        ];
      }

      // ========================================================
      // SORT NEWEST FIRST
      // ========================================================

      pdfs.sort(
        (a, b) => {
          const aTime =
            a.uploadedAt
              ? new Date(
                  a.uploadedAt
                ).getTime()
              : 0;

          const bTime =
            b.uploadedAt
              ? new Date(
                  b.uploadedAt
                ).getTime()
              : 0;

          return bTime - aTime;
        }
      );

      setPatient(
        (previous) =>
          previous
            ? {
                ...previous,
                medicalPdfs:
                  pdfs,
                medicalPdf:
                  pdfs[0] ||
                  previous.medicalPdf,
              }
            : previous
      );
    } catch (err) {
      console.error(
        "Load medical PDFs error:",
        err
      );

      // Don't destroy the whole page if
      // the PDF endpoint has a problem.
      console.warn(
        "PDF history could not be loaded."
      );
    }
  }

  // ============================================================
  // SAVE PATIENT
  // ============================================================

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/patients/${encodeURIComponent(
          patientId
        )}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            bloodGroup,

            emergencyContact: {
              name: emergencyName,
              phone: emergencyPhone,
              relationship:
                emergencyRelationship,
            },

            medicalNotes,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        patient?: Patient;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            `Server returned an invalid response. HTTP ${response.status}.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to update patient. HTTP ${response.status}.`
        );
      }

      if (data.patient) {
        setPatient(
          (previous) =>
            ({
              ...previous,
              ...data.patient,
            }) as Patient
        );
      }

      setMessage(
        "Patient details updated successfully."
      );
    } catch (err) {
      console.error(
        "Update patient error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update patient."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // ADD MEDICAL HISTORY
  // ============================================================

  async function handleAddMedicalHistory() {
    if (
      !diagnosis.trim() &&
      !prescription.trim() &&
      !historyNotes.trim()
    ) {
      setError(
        "Please enter at least a diagnosis, prescription, or visit note."
      );

      return;
    }

    try {
      setAddingHistory(true);

      setMessage("");
      setError("");

      const response = await fetch(
        "/api/medical-history",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            patientId,

            patientCode:
              patient?.patientId ||
              patientId,

            doctorName:
              doctorName.trim(),

            diagnosis:
              diagnosis.trim(),

            prescription:
              prescription.trim(),

            notes:
              historyNotes.trim(),

            visitDate,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        history?: MedicalHistoryRecord;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            `Server returned an invalid response. HTTP ${response.status}.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to add medical visit. HTTP ${response.status}.`
        );
      }

      if (data.history) {
        setHistory(
          (previous) => [
            data.history!,
            ...previous,
          ]
        );
      } else {
        await loadMedicalHistory();
      }

      setDoctorName("");
      setDiagnosis("");
      setPrescription("");
      setHistoryNotes("");

      setVisitDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      setMessage(
        "Medical visit added successfully. Previous visits were preserved."
      );
    } catch (err) {
      console.error(
        "Add medical history error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add medical visit."
      );
    } finally {
      setAddingHistory(false);
    }
  }

  // ============================================================
  // DELETE MEDICAL HISTORY
  // ============================================================

  async function handleDeleteMedicalHistory(
    historyId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this medical visit?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingHistoryId(
        historyId
      );

      setMessage("");
      setError("");

      const response = await fetch(
        `/api/medical-history?id=${encodeURIComponent(
          historyId
        )}`,
        {
          method: "DELETE",
        }
      );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            `Server returned an invalid response. HTTP ${response.status}.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to delete medical visit. HTTP ${response.status}.`
        );
      }

      setHistory(
        (previous) =>
          previous.filter(
            (record) =>
              record._id !==
              historyId
          )
      );

      setMessage(
        "Medical visit deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete medical history error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete medical visit."
      );
    } finally {
      setDeletingHistoryId(
        null
      );
    }
  }

  // ============================================================
  // PDF UPLOAD
  // ============================================================

  async function handlePdfUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      alert(
        "Only PDF files are allowed."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "PDF must be smaller than 10 MB."
      );

      event.target.value = "";

      return;
    }

    try {
      setPdfUploading(true);

      setError("");
      setMessage("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `/api/patients/${encodeURIComponent(
            patientId
          )}/pdf`,
          {
            method: "POST",
            body: formData,
          }
        );

      const responseText =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
        pdfName?: string;

        medicalPdf?: MedicalPdf;

        medicalPdfs?: MedicalPdf[];
      } = {};

      if (responseText.trim()) {
        try {
          data =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            "Server returned an invalid response while uploading the PDF."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to upload medical PDF. HTTP ${response.status}.`
        );
      }

      const uploadedPdf: MedicalPdf =
        data.medicalPdf || {
          name:
            data.pdfName ||
            file.name,
        };

      // ========================================================
      // UPDATE LOCAL PDF LIST
      // ========================================================

      setPatient(
        (previous) => {
          if (!previous) {
            return previous;
          }

          const existingPdfs =
            previous.medicalPdfs ||
            [];

          const updatedPdfs = [
            uploadedPdf,
            ...existingPdfs,
          ];

          return {
            ...previous,

            medicalPdfs:
              updatedPdfs,

            medicalPdf:
              uploadedPdf,
          };
        }
      );

      // ========================================================
      // RELOAD FROM SERVER
      // ========================================================

      await loadMedicalPdfs();

      setMessage(
        "Medical PDF uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Medical PDF upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload medical PDF."
      );
    } finally {
      setPdfUploading(false);

      event.target.value = "";
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2
            size={22}
            className="animate-spin text-sky-600"
          />

          <span className="text-sm font-medium text-slate-600">
            Loading patient...
          </span>
        </div>
      </main>
    );
  }

  // ============================================================
  // PATIENT NOT FOUND
  // ============================================================

  if (!patient) {
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
                Edit Patient
              </h1>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <p className="font-semibold text-red-600">
              {error ||
                "Patient not found."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // PDF LIST
  // ============================================================

  const medicalPdfs =
    patient.medicalPdfs ||
    [];

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-sky-50">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard/receptionist"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Clinic-Chain
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Edit Patient
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Patient ID:{" "}
              {patient.patientId}
            </p>
          </div>
        </div>
      </header>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* SUCCESS */}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* ======================================================
            MAIN FORM
        ====================================================== */}

        <form onSubmit={handleSave}>
          <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
            {/* ==================================================
                PATIENT HEADER
            ================================================== */}

            <div className="bg-sky-50 p-7">
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

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<UserRound size={19} />}
                title="Personal Information"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Date of Birth
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) =>
                        setDateOfBirth(
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(event) =>
                      setGender(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Blood Group
                  </label>

                  <div className="relative">
                    <Droplets
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={bloodGroup}
                      onChange={(event) =>
                        setBloodGroup(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="">
                        Unknown
                      </option>

                      <option value="A+">
                        A+
                      </option>

                      <option value="A-">
                        A-
                      </option>

                      <option value="B+">
                        B+
                      </option>

                      <option value="B-">
                        B-
                      </option>

                      <option value="AB+">
                        AB+
                      </option>

                      <option value="AB-">
                        AB-
                      </option>

                      <option value="O+">
                        O+
                      </option>

                      <option value="O-">
                        O-
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                CONTACT
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<Phone size={19} />}
                title="Contact Information"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  required
                  icon={<Phone size={17} />}
                />

                <InputField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  icon={<Mail size={17} />}
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    value={address}
                    onChange={setAddress}
                    required
                    icon={<MapPin size={17} />}
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                EMERGENCY
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<HeartPulse size={19} />}
                title="Emergency Contact"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <InputField
                  label="Name"
                  value={emergencyName}
                  onChange={setEmergencyName}
                />

                <InputField
                  label="Phone"
                  value={emergencyPhone}
                  onChange={setEmergencyPhone}
                />

                <InputField
                  label="Relationship"
                  value={emergencyRelationship}
                  onChange={
                    setEmergencyRelationship
                  }
                />
              </div>
            </div>

            {/* ==================================================
                MEDICAL NOTES
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<HeartPulse size={19} />}
                title="Medical Information"
              />

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Medical Notes
                </label>

                <textarea
                  value={medicalNotes}
                  onChange={(event) =>
                    setMedicalNotes(
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Enter medical notes, allergies, previous conditions, etc."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* ==================================================
                ADD MEDICAL VISIT
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<Plus size={19} />}
                title="Add Medical Visit"
              />

              <p className="mt-2 text-sm text-slate-500">
                Add a new consultation without
                deleting previous medical history.
              </p>

              <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Doctor Name"
                    value={doctorName}
                    onChange={setDoctorName}
                    placeholder="e.g. Dr. Sharma"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Visit Date
                    </label>

                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={visitDate}
                        onChange={(event) =>
                          setVisitDate(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      label="Diagnosis"
                      value={diagnosis}
                      onChange={setDiagnosis}
                      placeholder="e.g. Fever and viral infection"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Prescription / Treatment
                    </label>

                    <textarea
                      value={prescription}
                      onChange={(event) =>
                        setPrescription(
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="e.g. Paracetamol 500mg twice daily"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Visit Notes
                    </label>

                    <textarea
                      value={historyNotes}
                      onChange={(event) =>
                        setHistoryNotes(
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="e.g. Follow-up after 3 days"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={
                      handleAddMedicalHistory
                    }
                    disabled={addingHistory}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingHistory ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Adding Visit...
                      </>
                    ) : (
                      <>
                        <Plus size={17} />
                        Add Medical Visit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================
                PREVIOUS MEDICAL HISTORY
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<HeartPulse size={19} />}
                title="Previous Medical History"
              />

              <p className="mt-2 text-sm text-slate-500">
                All previous medical visits are
                preserved here.
              </p>

              {history.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <HeartPulse
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No medical visits recorded yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {history.map(
                    (record, index) => (
                      <div
                        key={
                          record._id ||
                          `${record.visitDate}-${index}`
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                              Medical Visit
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {record.diagnosis ||
                                "Medical consultation"}
                            </h3>
                          </div>

                          <div className="flex items-start gap-3">
                            <p className="text-sm text-slate-500">
                              {formatDate(
                                record.visitDate ||
                                  record.date ||
                                  record.createdAt
                              )}
                            </p>

                            {record._id && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMedicalHistory(
                                    record._id!
                                  )
                                }
                                disabled={
                                  deletingHistoryId ===
                                  record._id
                                }
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                title="Delete visit"
                              >
                                {deletingHistoryId ===
                                record._id ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={17}
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {record.doctorName && (
                          <p className="mt-4 text-sm text-slate-600">
                            <span className="font-semibold">
                              Doctor:
                            </span>{" "}
                            {record.doctorName}
                          </p>
                        )}

                        {record.prescription && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            <span className="font-semibold">
                              Prescription:
                            </span>{" "}
                            {record.prescription}
                          </p>
                        )}

                        {record.treatment && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            <span className="font-semibold">
                              Treatment:
                            </span>{" "}
                            {record.treatment}
                          </p>
                        )}

                        {record.notes && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            <span className="font-semibold">
                              Notes:
                            </span>{" "}
                            {record.notes}
                          </p>
                        )}

                        {record.enteredBy?.name && (
                          <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-400">
                            Added by{" "}
                            {record.enteredBy.name}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ==================================================
                MEDICAL DOCUMENTS
            ================================================== */}

            <div className="border-b border-slate-100 p-7">
              <SectionTitle
                icon={<FileText size={19} />}
                title="Medical Documents"
              />

              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-6">
                {/* UPLOAD */}

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                      <FileText size={23} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Medical History PDFs
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {medicalPdfs.length > 0
                          ? `${medicalPdfs.length} medical document${
                              medicalPdfs.length !==
                              1
                                ? "s"
                                : ""
                            } stored`
                          : "No medical PDFs uploaded yet."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        PDF only • Maximum 10 MB
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                    {pdfUploading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={17} />

                        Upload New PDF
                      </>
                    )}

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={
                        handlePdfUpload
                      }
                      disabled={pdfUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* ==================================================
                    PDF HISTORY
                ================================================== */}

                {medicalPdfs.length > 0 ? (
                  <div className="mt-6 space-y-3 border-t border-sky-100 pt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Document History
                      </p>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-600">
                        {medicalPdfs.length}{" "}
                        document
                        {medicalPdfs.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {medicalPdfs.map(
                      (pdf, index) => (
                        <div
                          key={`${pdf.path}-${index}`}
                          className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                              <FileText
                                size={19}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="break-all text-sm font-semibold text-slate-800">
                                {pdf.name ||
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

                              {pdf.uploadedBy
                                ?.name && (
                                <p className="mt-1 text-xs text-slate-400">
                                  Uploaded by{" "}
                                  {
                                    pdf
                                      .uploadedBy
                                      .name
                                  }
                                </p>
                              )}

                              {index === 0 && (
                                <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                                  Latest
                                </span>
                              )}
                            </div>
                          </div>

                          {pdf.path && (
                            <a
                              href={
                                pdf.path
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-7 text-center">
                    <FileText
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No medical documents
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Upload a PDF to add it to
                      the patient's medical
                      document history.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ==================================================
                SAVE
            ================================================== */}

            <div className="flex flex-col gap-3 bg-slate-50 p-7 sm:flex-row sm:justify-between">
              <Link
                href="/dashboard/receptionist"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <ArrowLeft size={17} />

                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    Save Patient Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

// ============================================================
// INPUT FIELD
// ============================================================

function InputField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  icon,
  placeholder,
}: {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  required?: boolean;

  type?: string;

  icon?: ReactNode;

  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
            icon
              ? "pl-11"
              : "pl-4"
          }`}
        />
      </div>
    </div>
  );
}
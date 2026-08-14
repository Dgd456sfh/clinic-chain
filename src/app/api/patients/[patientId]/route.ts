import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import PatientHistory from "@/models/PatientHistory";
import MedicalHistory from "@/models/MedicalHistory";

type Params = {
  params: Promise<{
    patientId: string;
  }>;
};

type TokenPayload = {
  userId: string;
  name?: string;
  role: string;
  email: string;
  patientId?: string | null;
};

// ================= GET PATIENT =================

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    const patient = await Patient.findOne({
      patientId,
    }).select("-password");

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("GET patient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch patient.",
      },
      { status: 500 }
    );
  }
}

// ================= UPDATE PATIENT =================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    const body = await request.json();

    const {
      fullName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      emergencyContact,
      medicalNotes,
    } = body;

    // ================= REQUIRED FIELDS =================

    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !phone ||
      !address
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    // ================= FIND EXISTING PATIENT =================

    const existingPatient =
      await Patient.findOne({
        patientId,
      });

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // GET LOGGED-IN USER
    // ============================================================

    let updatedByName = "Receptionist";
    let updatedByRole =
      "receptionist";

    let loggedInUserId = "";

    try {
      const cookieStore = await cookies();

      const token =
        cookieStore.get("token")?.value;

      if (token) {
        const decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET ||
              "clinic_chain_secret_2026"
          ) as TokenPayload;

        loggedInUserId =
          decoded.userId || "";

        updatedByName =
          decoded.name ||
          decoded.email ||
          "Receptionist";

        updatedByRole =
          decoded.role ||
          "receptionist";
      }
    } catch (error) {
      console.error(
        "Could not read login session:",
        error
      );
    }

    // ============================================================
    // DETECT CHANGES
    // ============================================================

    const changes: string[] = [];

    if (
      existingPatient.fullName !==
      fullName
    ) {
      changes.push(
        "Full name updated"
      );
    }

    const oldDate =
      existingPatient.dateOfBirth
        ? new Date(
            existingPatient.dateOfBirth
          )
            .toISOString()
            .split("T")[0]
        : "";

    const newDate = dateOfBirth
      ? new Date(dateOfBirth)
          .toISOString()
          .split("T")[0]
      : "";

    if (oldDate !== newDate) {
      changes.push(
        "Date of birth updated"
      );
    }

    if (
      existingPatient.gender !==
      gender
    ) {
      changes.push(
        "Gender updated"
      );
    }

    if (
      existingPatient.phone !==
      phone
    ) {
      changes.push(
        "Phone number updated"
      );
    }

    if (
      (existingPatient.email ||
        "") !==
      (email || "")
    ) {
      changes.push(
        "Email updated"
      );
    }

    if (
      existingPatient.address !==
      address
    ) {
      changes.push(
        "Address updated"
      );
    }

    if (
      existingPatient.bloodGroup !==
      (bloodGroup || "Unknown")
    ) {
      changes.push(
        "Blood group updated"
      );
    }

    // ============================================================
    // MEDICAL NOTES CHANGE
    // ============================================================

    const oldMedicalNotes =
      existingPatient.medicalNotes ||
      "";

    const newMedicalNotes =
      medicalNotes || "";

    const medicalNotesChanged =
      oldMedicalNotes !==
      newMedicalNotes;

    if (medicalNotesChanged) {
      changes.push(
        "Medical notes updated"
      );
    }

    // ============================================================
    // EMERGENCY CONTACT CHANGE
    // ============================================================

    const oldEmergencyName =
      existingPatient
        .emergencyContact?.name ||
      "";

    const oldEmergencyPhone =
      existingPatient
        .emergencyContact?.phone ||
      "";

    const oldEmergencyRelationship =
      existingPatient
        .emergencyContact
        ?.relationship || "";

    const newEmergencyName =
      emergencyContact?.name || "";

    const newEmergencyPhone =
      emergencyContact?.phone || "";

    const newEmergencyRelationship =
      emergencyContact?.relationship ||
      "";

    if (
      oldEmergencyName !==
        newEmergencyName ||
      oldEmergencyPhone !==
        newEmergencyPhone ||
      oldEmergencyRelationship !==
        newEmergencyRelationship
    ) {
      changes.push(
        "Emergency contact updated"
      );
    }

    // ============================================================
    // UPDATE PATIENT
    // ============================================================

    const patient =
      await Patient.findOneAndUpdate(
        { patientId },

        {
          fullName,
          dateOfBirth,
          gender,
          phone,
          email,
          address,

          bloodGroup:
            bloodGroup || "Unknown",

          emergencyContact: {
            name:
              emergencyContact?.name ||
              "",

            phone:
              emergencyContact?.phone ||
              "",

            relationship:
              emergencyContact?.relationship ||
              "",
          },

          medicalNotes:
            newMedicalNotes,
        },

        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Patient not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // SAVE PATIENT PROFILE HISTORY
    // ============================================================

    if (changes.length > 0) {
      await PatientHistory.create({
        patientId,

        action:
          "Patient record updated",

        changes,

        updatedBy: {
          name: updatedByName,
          role: updatedByRole,
        },
      });
    }

    // ============================================================
    // SAVE MEDICAL HISTORY
    // ============================================================
    //
    // IMPORTANT:
    // This creates a NEW document.
    //
    // It does NOT overwrite the previous medical history.
    //
    // ============================================================

    if (
      medicalNotesChanged &&
      newMedicalNotes.trim() &&
      loggedInUserId
    ) {
      await MedicalHistory.create({
        patientId:
          existingPatient._id,

        patientCode:
          existingPatient.patientId,

        enteredBy: {
          userId:
            loggedInUserId,

          name:
            updatedByName,

          role:
            updatedByRole,
        },

        doctorName:
          updatedByRole === "doctor"
            ? updatedByName
            : "",

        diagnosis: "",

        prescription: "",

        notes:
          newMedicalNotes,

        visitDate:
          new Date(),
      });
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      message:
        "Patient details updated successfully.",

      patient,

      medicalHistoryCreated:
        medicalNotesChanged &&
        newMedicalNotes.trim() !== "" &&
        loggedInUserId,
    });
  } catch (error) {
    console.error(
      "UPDATE patient error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update patient.",
      },
      { status: 500 }
    );
  }
}
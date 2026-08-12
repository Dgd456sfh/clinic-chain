import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import MedicalHistory from "@/models/MedicalHistory";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Check login
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // Verify login token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "clinic_chain_secret_2026"
    ) as {
      userId: string;
      role: string;
      email: string;
    };

    // Only doctors can access this API
    if (decoded.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only doctors can view patient history.",
        },
        { status: 403 }
      );
    }

    // Get patient ID from URL
    const { searchParams } =
      new URL(request.url);

    const patientId =
      searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    // Find patient
    const patient = await Patient.findOne({
      patientId,
    }).select(
      "-password"
    );

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    // Find patient's medical history
    const history =
      await MedicalHistory.find({
        patientId: patient._id,
      })
        .sort({
          visitDate: -1,
        })
        .populate(
          "enteredBy.userId",
          "name email role"
        );

    return NextResponse.json({
      success: true,

      patient: {
        patientId: patient.patientId,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        bloodGroup: patient.bloodGroup,
        medicalNotes: patient.medicalNotes,
      },

      history,
    });
  } catch (error) {
    console.error(
      "Doctor medical history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch patient history.",
      },
      { status: 500 }
    );
  }
}
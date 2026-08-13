import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import PatientHistory from "@/models/PatientHistory";

type Params = {
  params: Promise<{
    patientId: string;
  }>;
};

type TokenPayload = {
  userId: string;
  role: string;
  email: string;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    // ================= GET LOGIN SESSION =================

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    // ================= VERIFY TOKEN =================

    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ||
          "clinic_chain_secret_2026"
      ) as TokenPayload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired login session.",
        },
        { status: 401 }
      );
    }

    // ================= PATIENT ONLY =================

    if (decoded.role !== "patient") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only patients can view patient history.",
        },
        { status: 403 }
      );
    }

    // ================= FIND PATIENT =================

    const patient = await Patient.findOne({
      patientId,
    }).select("patientId email");

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    // ================= CHECK OWNERSHIP =================

    if (
      !patient.email ||
      patient.email.toLowerCase() !==
        decoded.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to view this history.",
        },
        { status: 403 }
      );
    }

    // ================= GET HISTORY =================

    const history = await PatientHistory.find({
      patientId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      "GET patient history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch patient history.",
      },
      { status: 500 }
    );
  }
}
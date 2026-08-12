import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const patientId = searchParams
      .get("patientId")
      ?.trim()
      .toUpperCase();

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

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
    console.error("Patient search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search patient.",
      },
      { status: 500 }
    );
  }
}
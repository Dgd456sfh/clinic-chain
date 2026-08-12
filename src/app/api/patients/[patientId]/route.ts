import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

type Params = {
  params: Promise<{
    patientId: string;
  }>;
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

    // Required fields
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
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId },

      {
        fullName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        bloodGroup: bloodGroup || "Unknown",

        emergencyContact: {
          name: emergencyContact?.name || "",
          phone: emergencyContact?.phone || "",
          relationship: emergencyContact?.relationship || "",
        },

        medicalNotes: medicalNotes || "",
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
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Patient details updated successfully.",
      patient,
    });
  } catch (error) {
    console.error("UPDATE patient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update patient.",
      },
      { status: 500 }
    );
  }
}
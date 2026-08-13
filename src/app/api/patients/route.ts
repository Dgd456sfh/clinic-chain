import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(request: Request) {
  try {
    await connectDB();

    const patients = await Patient.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch patients.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

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

    const patientId = `CC-PAT-${Date.now()
      .toString()
      .slice(-6)}`;

    const patient = await Patient.create({
      patientId,
      fullName,
      dateOfBirth,
      gender,
      phone,
      email: email ? email.toLowerCase().trim() : "",
      address,
      bloodGroup: bloodGroup || "Unknown",
      emergencyContact: {
        name: emergencyContact?.name || "",
        phone: emergencyContact?.phone || "",
        relationship:
          emergencyContact?.relationship || "",
      },
      medicalNotes: medicalNotes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient registered successfully.",
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create patient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create patient.",
      },
      { status: 500 }
    );
  }
}
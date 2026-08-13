import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

type TokenPayload = {
  userId: string;
  role: string;
  email: string;
};

export async function GET() {
  try {
    await connectDB();

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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "clinic_chain_secret_2026"
    ) as TokenPayload;

    if (decoded.role !== "patient") {
      return NextResponse.json(
        {
          success: false,
          message: "Only patients can access this.",
        },
        { status: 403 }
      );
    }

    const patient = await Patient.findOne({
      email: decoded.email.toLowerCase(),
    }).select("-password");

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient record not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(
      "Get patient by email error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to find patient.",
      },
      { status: 500 }
    );
  }
}
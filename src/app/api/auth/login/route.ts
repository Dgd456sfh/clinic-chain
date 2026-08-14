import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanEmail = String(email)
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "This account has no password configured.",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    let patient = null;

    if (user.role === "patient") {
      patient = await Patient.findOne({
        email: cleanEmail,
      }).select(
        "patientId fullName email phone dateOfBirth gender address bloodGroup medicalNotes medicalPdf emergencyContact"
      );

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Patient account exists, but no patient record is linked to this email.",
          },
          { status: 404 }
        );
      }
    }

    const secret =
      process.env.JWT_SECRET ||
      "clinic_chain_secret_2026";

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        patientId:
          patient?.patientId || null,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,

        patientId:
          patient?.patientId || null,

        patient: patient || null,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "LOGIN API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login server error.",
      },
      { status: 500 }
    );
  }
}
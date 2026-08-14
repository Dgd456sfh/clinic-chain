import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";

async function generatePatientId() {
  let patientId = "";

  while (true) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    patientId = `CC-PAT-${randomNumber}`;

    const existingPatient = await Patient.findOne({
      patientId,
    });

    if (!existingPatient) {
      return patientId;
    }
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      fullName,
      name,
      email,
      phone,
      password,
      role,
      adminCode,

      // Patient fields
      dateOfBirth,
      gender,
      address,
      bloodGroup,
    } = body;

    const finalName = fullName || name;
    const cleanEmail = email?.toLowerCase().trim();

    // ============================================================
    // REQUIRED COMMON FIELDS
    // ============================================================

    if (
      !finalName ||
      !cleanEmail ||
      !phone ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields are missing.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALID ROLES
    // ============================================================

    const validRoles = [
      "patient",
      "doctor",
      "receptionist",
      "admin",
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // PATIENT-SPECIFIC VALIDATION
    // ============================================================

    if (role === "patient") {
      if (!dateOfBirth || !gender || !address) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Date of birth, gender and address are required for patients.",
          },
          { status: 400 }
        );
      }

      if (
        !["Male", "Female", "Other"].includes(
          gender
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid gender.",
          },
          { status: 400 }
        );
      }
    }

    // ============================================================
    // ADMIN VERIFICATION
    // ============================================================

    if (role === "admin") {
      const correctAdminCode =
        process.env.ADMIN_VERIFICATION_CODE ||
        "CLINIC-ADMIN-2026";

      if (adminCode !== correctAdminCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid admin verification code.",
          },
          { status: 403 }
        );
      }
    }

    // ============================================================
    // CHECK EXISTING USER ACCOUNT
    // ============================================================

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // HASH PASSWORD
    // ============================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ============================================================
    // PATIENT REGISTRATION
    // ============================================================

    if (role === "patient") {
      const patientId =
        await generatePatientId();

      // ==========================================================
      // CREATE PATIENT RECORD
      //
      // IMPORTANT:
      // Password is NOT stored in Patient.
      // Password belongs to the User model.
      // ==========================================================

      const patient =
        await Patient.create({
          patientId,
          fullName: finalName,
          dateOfBirth: new Date(
            dateOfBirth
          ),
          gender,
          phone,
          email: cleanEmail,
          address,
          bloodGroup:
            bloodGroup || "Unknown",
        });

      try {
        // ========================================================
        // CREATE LOGIN USER ACCOUNT
        // ========================================================

        const user = await User.create({
          name: finalName,
          email: cleanEmail,
          phone,
          password: hashedPassword,
          role: "patient",
        });

        return NextResponse.json(
          {
            success: true,
            message:
              "Patient account created successfully.",

            patientId:
              patient.patientId,

            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          { status: 201 }
        );
      } catch (userError) {
        // ========================================================
        // ROLLBACK PATIENT IF USER CREATION FAILS
        // ========================================================

        await Patient.deleteOne({
          _id: patient._id,
        });

        throw userError;
      }
    }

    // ============================================================
    // OTHER ROLES
    // ============================================================

    const user = await User.create({
      name: finalName,
      email: cleanEmail,
      phone,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed.",
      },
      { status: 500 }
    );
  }
}
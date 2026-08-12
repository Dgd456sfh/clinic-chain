import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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
    } = body;

    const finalName = fullName || name;

    // Required fields
    if (!finalName || !email || !phone || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields are missing.",
        },
        { status: 400 }
      );
    }

    // Check valid role
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

    const cleanEmail = email.toLowerCase().trim();

    // Admin verification
    if (role === "admin") {
      const correctAdminCode =
        process.env.ADMIN_VERIFICATION_CODE ||
        "CLINIC-ADMIN-2026";

      if (adminCode !== correctAdminCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid admin verification code.",
          },
          { status: 403 }
        );
      }
    }

    // Check existing account
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
        message: "Account created successfully.",
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
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed.",
      },
      { status: 500 }
    );
  }
}
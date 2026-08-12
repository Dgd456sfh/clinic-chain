import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";

// ================= GET ALL USERS =================

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({
      role: {
        $in: ["doctor", "receptionist", "patient"],
      },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const doctors = users.filter(
      (user) => user.role === "doctor"
    );

    const receptionists = users.filter(
      (user) => user.role === "receptionist"
    );

    const patients = users.filter(
      (user) => user.role === "patient"
    );

    return NextResponse.json({
      success: true,
      doctors,
      receptionists,
      patients,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}

// ================= DELETE USER =================

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Never allow deleting an admin
    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin accounts cannot be removed.",
        },
        { status: 403 }
      );
    }

    // If patient, also remove patient record
    if (user.role === "patient") {
      await Patient.deleteOne({
        email: user.email,
      });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: `${user.name} removed successfully.`,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove user.",
      },
      { status: 500 }
    );
  }
}
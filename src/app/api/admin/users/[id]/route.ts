import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { id } = await params;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Admin can remove only doctor, receptionist or patient
    if (
      !["doctor", "receptionist", "patient"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This user cannot be removed.",
        },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `${user.name} removed successfully.`,
    });
  } catch (error) {
    console.error("Remove user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove user.",
      },
      { status: 500 }
    );
  }
}
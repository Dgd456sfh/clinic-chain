import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Clinic from "@/models/Clinic";

export async function GET() {
  try {
    await connectDB();

    const clinics = await Clinic.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      clinics,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clinics",
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
      name,
      address,
      phone,
      email,
    } = body;

    if (!name || !address || !phone || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const clinic = await Clinic.create({
      name,
      address,
      phone,
      email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Clinic created successfully",
        clinic,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create clinic",
      },
      { status: 500 }
    );
  }
}
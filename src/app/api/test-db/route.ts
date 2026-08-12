import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import fs from "fs/promises";
import path from "path";

type Params = {
  params: Promise<{
    patientId: string;
  }>;
};

/* ================= GET PATIENT ================= */

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    const patient = await Patient.findOne({
      patientId,
    }).lean();

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
    console.error("Get patient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch patient.",
      },
      { status: 500 }
    );
  }
}

/* ================= UPDATE PATIENT ================= */

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

    const patient = await Patient.findOne({
      patientId,
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    patient.fullName = fullName;
    patient.dateOfBirth = dateOfBirth;
    patient.gender = gender;
    patient.phone = phone;
    patient.email = email
      ? email.toLowerCase().trim()
      : "";
    patient.address = address;
    patient.bloodGroup =
      bloodGroup || "Unknown";

    patient.emergencyContact = {
      name: emergencyContact?.name || "",
      phone: emergencyContact?.phone || "",
      relationship:
        emergencyContact?.relationship || "",
    };

    patient.medicalNotes =
      medicalNotes || "";

    await patient.save();

    return NextResponse.json({
      success: true,
      message:
        "Patient details updated successfully.",
      patient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update patient.",
      },
      { status: 500 }
    );
  }
}

/* ================= UPLOAD PDF ================= */

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    const patient = await Patient.findOne({
      patientId,
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a PDF.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF must be smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "medical"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    /* Delete old PDF */

    if (patient.medicalPdf?.path) {
      const oldPath = path.join(
        process.cwd(),
        "public",
        patient.medicalPdf.path
      );

      try {
        await fs.unlink(oldPath);
      } catch {}
    }

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const fileName = `${patientId}-${Date.now()}-${safeName}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    const bytes = await file.arrayBuffer();

    await fs.writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const publicPath =
      `/uploads/medical/${fileName}`;

    patient.medicalPdf = {
      name: file.name,
      path: publicPath,
    };

    await patient.save();

    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully.",
      medicalPdf: patient.medicalPdf,
    });
  } catch (error) {
    console.error("PDF upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload PDF.",
      },
      { status: 500 }
    );
  }
}

/* ================= DELETE PDF ================= */

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await connectDB();

    const { patientId } = await params;

    const patient = await Patient.findOne({
      patientId,
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    if (patient.medicalPdf?.path) {
      const filePath = path.join(
        process.cwd(),
        "public",
        patient.medicalPdf.path
      );

      try {
        await fs.unlink(filePath);
      } catch {}
    }

    patient.medicalPdf = {
      name: "",
      path: "",
    };

    await patient.save();

    return NextResponse.json({
      success: true,
      message: "PDF removed successfully.",
    });
  } catch (error) {
    console.error("Delete PDF error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove PDF.",
      },
      { status: 500 }
    );
  }
}
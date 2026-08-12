import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { patientId } = await context.params;

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

    if (!patient.medicalPdf?.path) {
      return NextResponse.json(
        {
          success: false,
          message: "No medical PDF available.",
        },
        { status: 404 }
      );
    }

    let filePath = patient.medicalPdf.path;

    if (!path.isAbsolute(filePath)) {
      filePath = path.join(
        process.cwd(),
        filePath
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          message: "Medical PDF file not found.",
        },
        { status: 404 }
      );
    }

    const file = fs.readFileSync(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${
          patient.medicalPdf.name ||
          "medical-record.pdf"
        }"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to open medical PDF.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { patientId } = await context.params;

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
          message: "Please upload a PDF file.",
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

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "medical-records"
    );

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.pdf$/i, "");

    const fileName = `${patientId}-${Date.now()}-${safeName}.pdf`;

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    fs.writeFileSync(filePath, buffer);

    const relativePath =
      `public/uploads/medical-records/${fileName}`;

    patient.medicalPdf = {
      name: file.name,
      path: relativePath,
    };

    await patient.save();

    return NextResponse.json({
      success: true,
      message: "Medical PDF uploaded successfully.",
      medicalPdf: {
        name: file.name,
        path: relativePath,
      },
    });
  } catch (error) {
    console.error("PDF UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload medical PDF.",
      },
      { status: 500 }
    );
  }
}
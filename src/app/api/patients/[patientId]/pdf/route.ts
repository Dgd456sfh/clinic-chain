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

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

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

    if (
      !patient.medicalPdf ||
      !patient.medicalPdf.path
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No medical PDF available.",
        },
        { status: 404 }
      );
    }

    let pdfPath = patient.medicalPdf.path;

    if (!path.isAbsolute(pdfPath)) {
      pdfPath = path.join(
        process.cwd(),
        pdfPath
      );
    }

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medical PDF file was not found on the server.",
        },
        { status: 404 }
      );
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(pdfBuffer, {
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
    console.error(
      "Medical PDF error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load medical PDF.",
      },
      { status: 500 }
    );
  }
}
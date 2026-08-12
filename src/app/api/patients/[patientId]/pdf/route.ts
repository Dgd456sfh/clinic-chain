import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

// =====================================================
// GET PDF
// =====================================================

export async function GET(
  request: NextRequest,
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
        {
          status: 404,
        }
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
        {
          status: 404,
        }
      );
    }

    let pdfPath = patient.medicalPdf.path;

    /*
     * Database stores:
     *
     * /uploads/medical/filename.pdf
     *
     * Convert it into:
     *
     * <project>/public/uploads/medical/filename.pdf
     */

    if (pdfPath.startsWith("/")) {
      pdfPath = pdfPath.substring(1);
    }

    const absolutePath = path.join(
      process.cwd(),
      "public",
      pdfPath
    );

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medical PDF record exists, but the file could not be found on the server.",
        },
        {
          status: 404,
        }
      );
    }

    const pdfBuffer = fs.readFileSync(
      absolutePath
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `inline; filename="${encodeURIComponent(
          patient.medicalPdf.name ||
            "medical-record.pdf"
        )}"`,

        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "GET MEDICAL PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load medical PDF.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST / UPLOAD PDF
// =====================================================

export async function POST(
  request: NextRequest,
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
        {
          status: 404,
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a PDF file.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // Validate PDF
    // -------------------------------------------------

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // Maximum size = 10 MB
    // -------------------------------------------------

    const MAX_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PDF file must be smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // Upload directory
    // -------------------------------------------------

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "medical"
    );

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });
    }

    // -------------------------------------------------
    // Delete old PDF if one exists
    // -------------------------------------------------

    if (
      patient.medicalPdf &&
      patient.medicalPdf.path
    ) {
      let oldPath = patient.medicalPdf.path;

      if (oldPath.startsWith("/")) {
        oldPath = oldPath.substring(1);
      }

      const oldAbsolutePath = path.join(
        process.cwd(),
        "public",
        oldPath
      );

      if (fs.existsSync(oldAbsolutePath)) {
        try {
          fs.unlinkSync(oldAbsolutePath);
        } catch (error) {
          console.error(
            "Unable to delete old PDF:",
            error
          );
        }
      }
    }

    // -------------------------------------------------
    // Create safe filename
    // -------------------------------------------------

    const originalName = file.name;

    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const uniqueName = `${patientId}-${Date.now()}-${safeName}`;

    const filePath = path.join(
      uploadDirectory,
      uniqueName
    );

    // -------------------------------------------------
    // Save file
    // -------------------------------------------------

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    fs.writeFileSync(
      filePath,
      buffer
    );

    // -------------------------------------------------
    // Save PDF information in MongoDB
    // -------------------------------------------------

    const databasePath =
      `/uploads/medical/${uniqueName}`;

    patient.medicalPdf = {
      name: originalName,
      path: databasePath,
    };

    await patient.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Medical PDF uploaded successfully.",
        medicalPdf: {
          name: originalName,
          path: databasePath,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPLOAD MEDICAL PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to upload medical PDF.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE PDF
// =====================================================

export async function DELETE(
  request: NextRequest,
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
        {
          status: 404,
        }
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
        {
          status: 404,
        }
      );
    }

    let pdfPath = patient.medicalPdf.path;

    if (pdfPath.startsWith("/")) {
      pdfPath = pdfPath.substring(1);
    }

    const absolutePath = path.join(
      process.cwd(),
      "public",
      pdfPath
    );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    patient.medicalPdf = {
      name: "",
      path: "",
    };

    await patient.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Medical PDF deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE MEDICAL PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete medical PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
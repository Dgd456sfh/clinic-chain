import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mongoose from "mongoose";

import Patient from "@/models/Patient";

// ============================================================
// HELPERS
// ============================================================

function getUploadsDirectory() {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "medical"
  );
}

function getFileNameFromPath(filePath: string) {
  return path.basename(filePath);
}

// ============================================================
// GET
//
// Returns ALL medical PDFs for the patient.
//
// Optional:
// ?file=<filename>
//
// If file is provided, the actual PDF is returned.
// ============================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      patientId: string;
    }>;
  }
) {
  try {
    const { patientId } =
      await context.params;

    // ========================================================
    // CONNECT TO DATABASE
    // ========================================================

    if (
      !mongoose.connection.readyState
    ) {
      const mongoUri =
        process.env.MONGODB_URI;

      if (!mongoUri) {
        return NextResponse.json(
          {
            success: false,
            message:
              "MONGODB_URI is not configured.",
          },
          {
            status: 500,
          }
        );
      }

      await mongoose.connect(
        mongoUri
      );
    }

    // ========================================================
    // CHECK WHETHER A SPECIFIC FILE WAS REQUESTED
    // ========================================================

    const { searchParams } =
      new URL(request.url);

    const requestedFile =
      searchParams.get("file");

    // ========================================================
    // IF A SPECIFIC PDF IS REQUESTED
    // ========================================================

    if (requestedFile) {
      // ------------------------------------------------------
      // SECURITY:
      // Only allow a filename.
      // Prevent ../ path traversal.
      // ------------------------------------------------------

      const safeFileName =
        path.basename(
          requestedFile
        );

      if (
        safeFileName !==
        requestedFile
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid file name.",
          },
          {
            status: 400,
          }
        );
      }

      // ------------------------------------------------------
      // FIND PATIENT
      // ------------------------------------------------------

      const patient =
        await Patient.findOne({
          patientId,
        }).lean();

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Patient not found.",
          },
          {
            status: 404,
          }
        );
      }

      // ------------------------------------------------------
      // MAKE SURE THIS FILE BELONGS TO THIS PATIENT
      // ------------------------------------------------------

      const medicalPdfs =
        patient.medicalPdfs || [];

      const pdfExists =
        medicalPdfs.some(
          (pdf: {
            path?: string;
          }) => {
            if (!pdf.path) {
              return false;
            }

            return (
              getFileNameFromPath(
                pdf.path
              ) === safeFileName
            );
          }
        );

      // ------------------------------------------------------
      // BACKWARD COMPATIBILITY
      //
      // Also allow the old medicalPdf field.
      // ------------------------------------------------------

      const oldPdfMatches =
        patient.medicalPdf?.path
          ? getFileNameFromPath(
              patient.medicalPdf.path
            ) === safeFileName
          : false;

      if (
        !pdfExists &&
        !oldPdfMatches
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This PDF does not belong to this patient.",
          },
          {
            status: 403,
          }
        );
      }

      // ------------------------------------------------------
      // ACTUAL FILE LOCATION
      // ------------------------------------------------------

      const filePath =
        path.join(
          getUploadsDirectory(),
          safeFileName
        );

      // ------------------------------------------------------
      // CHECK FILE EXISTS
      // ------------------------------------------------------

      try {
        await fs.access(
          filePath
        );
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "PDF file could not be found on the server.",
          },
          {
            status: 404,
          }
        );
      }

      // ------------------------------------------------------
      // READ PDF
      // ------------------------------------------------------

      const fileBuffer =
        await fs.readFile(
          filePath
        );

      // ------------------------------------------------------
      // RETURN PDF
      // ------------------------------------------------------

      return new NextResponse(
        fileBuffer,
        {
          status: 200,

          headers: {
            "Content-Type":
              "application/pdf",

            "Content-Disposition":
              `inline; filename="${safeFileName}"`,

            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    // ========================================================
    // OTHERWISE RETURN ALL PDF HISTORY
    // ========================================================

    const patient =
      await Patient.findOne({
        patientId,
      }).lean();

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    let medicalPdfs =
      patient.medicalPdfs || [];

    // ========================================================
    // BACKWARD COMPATIBILITY
    //
    // If an older patient only has medicalPdf,
    // include it in medicalPdfs.
    // ========================================================

    if (
      medicalPdfs.length === 0 &&
      patient.medicalPdf?.path
    ) {
      medicalPdfs = [
        {
          name:
            patient.medicalPdf.name ||
            "Medical Document",

          path:
            patient.medicalPdf.path,

          uploadedAt:
            patient.updatedAt ||
            new Date(),
        },
      ];
    }

    // ========================================================
    // NEWEST FIRST
    // ========================================================

    medicalPdfs =
      medicalPdfs.sort(
        (
          first: {
            uploadedAt?: Date;
          },
          second: {
            uploadedAt?: Date;
          }
        ) => {
          const firstTime =
            first.uploadedAt
              ? new Date(
                  first.uploadedAt
                ).getTime()
              : 0;

          const secondTime =
            second.uploadedAt
              ? new Date(
                  second.uploadedAt
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        }
      );

    // ========================================================
    // RETURN PDF HISTORY
    // ========================================================

    return NextResponse.json({
      success: true,

      medicalPdfs,
    });
  } catch (error) {
    console.error(
      "GET medical PDF error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load medical documents.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
//
// Upload a NEW PDF.
//
// IMPORTANT:
// This does NOT replace the old PDF.
// It APPENDS the new PDF to medicalPdfs.
// ============================================================

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      patientId: string;
    }>;
  }
) {
  try {
    const { patientId } =
      await context.params;

    // ========================================================
    // CONNECT DATABASE
    // ========================================================

    if (
      !mongoose.connection.readyState
    ) {
      const mongoUri =
        process.env.MONGODB_URI;

      if (!mongoUri) {
        return NextResponse.json(
          {
            success: false,
            message:
              "MONGODB_URI is not configured.",
          },
          {
            status: 500,
          }
        );
      }

      await mongoose.connect(
        mongoUri
      );
    }

    // ========================================================
    // FIND PATIENT
    // ========================================================

    const patient =
      await Patient.findOne({
        patientId,
      });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // GET FORM DATA
    // ========================================================

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No PDF file was uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CHECK PDF
    // ========================================================

    const fileName =
      file.name || "medical-record.pdf";

    const isPdf =
      file.type ===
        "application/pdf" ||
      fileName
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PDF files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CREATE UPLOAD DIRECTORY
    // ========================================================

    const uploadDirectory =
      getUploadsDirectory();

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    // ========================================================
    // CREATE SAFE UNIQUE FILE NAME
    // ========================================================

    const safeOriginalName =
      fileName
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const uniqueFileName =
      `${patientId}-${Date.now()}-${safeOriginalName}`;

    const filePath =
      path.join(
        uploadDirectory,
        uniqueFileName
      );

    // ========================================================
    // SAVE FILE
    // ========================================================

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    await fs.writeFile(
      filePath,
      buffer
    );

    // ========================================================
    // CREATE PDF RECORD
    // ========================================================

    const newPdf = {
      name: fileName,

      path: `/uploads/medical/${uniqueFileName}`,

      uploadedAt: new Date(),
    };

    // ========================================================
    // APPEND TO HISTORY
    //
    // IMPORTANT:
    // DO NOT replace the old PDFs.
    // ========================================================

    if (
      !Array.isArray(
        patient.medicalPdfs
      )
    ) {
      patient.medicalPdfs = [];
    }

    patient.medicalPdfs.push(
      newPdf
    );

    // ========================================================
    // KEEP OLD medicalPdf FIELD UPDATED
    //
    // This keeps existing parts of your application working.
    // ========================================================

    patient.medicalPdf = {
      name: fileName,

      path: newPdf.path,
    };

    // ========================================================
    // SAVE PATIENT
    // ========================================================

    await patient.save();

    // ========================================================
    // RETURN ALL PDF HISTORY
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        medicalPdfs:
          patient.medicalPdfs,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST medical PDF error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to upload medical PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
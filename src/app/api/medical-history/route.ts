import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import MedicalHistory from "@/models/MedicalHistory";

type TokenPayload = {
  userId: string;
  role: string;
  email: string;
};

// ============================================================
// GET MEDICAL HISTORY
// ============================================================

export async function GET(request: Request) {
  try {
    await connectDB();

    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "clinic_chain_secret_2026"
    ) as TokenPayload;

    // --------------------------------------------------------
    // GET PATIENT ID FROM URL
    // --------------------------------------------------------

    const { searchParams } = new URL(
      request.url
    );

    const patientId =
      searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------------

    const patient = await Patient.findOne({
      patientId,
    }).select("-password");

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------------
    // ACCESS CONTROL
    //
    // Doctors/receptionists/admins can view history.
    //
    // Patients can view ONLY their own history.
    // --------------------------------------------------------

    if (decoded.role === "patient") {
      const loggedInUser = await User.findById(
        decoded.userId
      ).lean();

      if (!loggedInUser) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found.",
          },
          { status: 404 }
        );
      }

      /*
       * Different projects sometimes store the patient's
       * patientId in different fields.
       *
       * We check the common possibilities.
       */

      const userPatientId =
        (loggedInUser as any).patientId ||
        (loggedInUser as any).patientCode;

      if (
        userPatientId &&
        userPatientId !== patientId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not allowed to view this patient's history.",
          },
          { status: 403 }
        );
      }
    }

    // --------------------------------------------------------
    // ONLY THESE ROLES CAN ACCESS
    // --------------------------------------------------------

    const allowedRoles = [
      "doctor",
      "receptionist",
      "admin",
      "patient",
    ];

    if (
      !allowedRoles.includes(
        decoded.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not allowed to view medical history.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // GET ALL HISTORY RECORDS
    // --------------------------------------------------------
    //
    // IMPORTANT:
    //
    // find() returns ALL documents.
    //
    // We do NOT update or replace previous visits.
    //
    // --------------------------------------------------------

    const history =
      await MedicalHistory.find({
        patientId: patient._id,
      })
        .sort({
          visitDate: -1,
          createdAt: -1,
        })
        .populate(
          "enteredBy.userId",
          "name email role"
        )
        .lean();

    // --------------------------------------------------------
    // RETURN PATIENT + ALL HISTORY
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,

      patient: {
        patientId: patient.patientId,
        fullName: patient.fullName,
        dateOfBirth:
          patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        bloodGroup:
          patient.bloodGroup,
        medicalNotes:
          patient.medicalNotes,
      },

      history,
    });
  } catch (error) {
    console.error(
      "GET medical history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch patient history.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST MEDICAL HISTORY
// ============================================================

export async function POST(request: Request) {
  try {
    await connectDB();

    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "clinic_chain_secret_2026"
    ) as TokenPayload;

    // --------------------------------------------------------
    // ONLY STAFF CAN ADD MEDICAL HISTORY
    // --------------------------------------------------------

    const allowedRoles = [
      "doctor",
      "receptionist",
      "admin",
    ];

    if (
      !allowedRoles.includes(
        decoded.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not allowed to add medical history.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // READ REQUEST BODY
    // --------------------------------------------------------

    const body = await request.json();

    const {
      patientId,
      doctorName,
      diagnosis,
      prescription,
      notes,
      visitDate,
    } = body;

    // --------------------------------------------------------
    // VALIDATE PATIENT ID
    // --------------------------------------------------------

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------------

    const patient =
      await Patient.findOne({
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

    // --------------------------------------------------------
    // FIND LOGGED-IN USER
    // --------------------------------------------------------

    const user = await User.findById(
      decoded.userId
    ).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Logged-in user not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------------
    // DETERMINE NAME
    // --------------------------------------------------------

    const enteredByName =
      (user as any).name ||
      (user as any).fullName ||
      decoded.email ||
      "Clinic Staff";

    // --------------------------------------------------------
    // CREATE NEW MEDICAL HISTORY
    // --------------------------------------------------------
    //
    // IMPORTANT:
    //
    // MedicalHistory.create() creates a NEW document.
    //
    // It does NOT update an existing visit.
    //
    // Therefore:
    //
    // Visit 1 -> document 1
    // Visit 2 -> document 2
    // Visit 3 -> document 3
    //
    // All remain in MongoDB.
    // --------------------------------------------------------

    const history =
      await MedicalHistory.create({
        patientId: patient._id,

        patientCode:
          patient.patientId,

        enteredBy: {
          userId: decoded.userId,
          name: enteredByName,
          role: decoded.role,
        },

        doctorName:
          doctorName || "",

        diagnosis:
          diagnosis || "",

        prescription:
          prescription || "",

        notes:
          notes || "",

        visitDate:
          visitDate
            ? new Date(visitDate)
            : new Date(),
      });

    // --------------------------------------------------------
    // RETURN NEW RECORD
    // --------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Medical visit added successfully.",
        history,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST medical history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add medical history.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE MEDICAL HISTORY
// ============================================================

export async function DELETE(
  request: Request
) {
  try {
    await connectDB();

    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "clinic_chain_secret_2026"
    ) as TokenPayload;

    // --------------------------------------------------------
    // ONLY STAFF CAN DELETE
    // --------------------------------------------------------

    const allowedRoles = [
      "doctor",
      "receptionist",
      "admin",
    ];

    if (
      !allowedRoles.includes(
        decoded.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not allowed to delete medical history.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------------
    // GET RECORD ID
    // --------------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const historyId =
      searchParams.get("id");

    if (!historyId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medical history ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // DELETE ONLY THAT ONE VISIT
    // --------------------------------------------------------

    const deleted =
      await MedicalHistory.findByIdAndDelete(
        historyId
      );

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medical history record not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Medical visit deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE medical history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete medical history.",
      },
      { status: 500 }
    );
  }
}
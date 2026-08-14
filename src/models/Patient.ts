import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

// ============================================================
// MEDICAL PDF TYPE
// ============================================================

export interface IMedicalPdf {
  name: string;
  path: string;
  uploadedAt: Date;

  uploadedBy?: {
    userId?: string;
    name?: string;
    role?: string;
  };
}

// ============================================================
// PATIENT INTERFACE
// ============================================================

export interface IPatient extends Document {
  patientId: string;

  fullName: string;
  dateOfBirth?: Date;
  gender?: string;

  phone?: string;
  email?: string;
  address?: string;

  bloodGroup?: string;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  clinicId?: mongoose.Types.ObjectId;

  // ==========================================================
  // OLD SINGLE PDF FIELD
  //
  // Kept for backward compatibility with your existing code.
  // The newest uploaded PDF is also stored here.
  // ==========================================================

  medicalPdf?: {
    name?: string;
    path?: string;
  };

  // ==========================================================
  // NEW PDF HISTORY
  //
  // Every uploaded PDF is stored here.
  // Old PDFs are NEVER replaced.
  // ==========================================================

  medicalPdfs: IMedicalPdf[];

  // ==========================================================
  // GENERAL MEDICAL NOTES
  // ==========================================================

  medicalNotes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================
// MEDICAL PDF SCHEMA
// ============================================================

const MedicalPdfSchema =
  new Schema<IMedicalPdf>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      path: {
        type: String,
        required: true,
        trim: true,
      },

      uploadedAt: {
        type: Date,
        default: Date.now,
      },

      uploadedBy: {
        userId: {
          type: String,
          trim: true,
        },

        name: {
          type: String,
          trim: true,
        },

        role: {
          type: String,
          trim: true,
        },
      },
    },
    {
      _id: true,
    }
  );

// ============================================================
// PATIENT SCHEMA
// ============================================================

const PatientSchema =
  new Schema<IPatient>(
    {
      // ========================================================
      // PATIENT ID
      // ========================================================

      patientId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      // ========================================================
      // BASIC DETAILS
      // ========================================================

      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      dateOfBirth: {
        type: Date,
      },

      gender: {
        type: String,
        trim: true,
      },

      // ========================================================
      // CONTACT DETAILS
      // ========================================================

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      address: {
        type: String,
        trim: true,
      },

      // ========================================================
      // BLOOD GROUP
      // ========================================================

      bloodGroup: {
        type: String,
        trim: true,
      },

      // ========================================================
      // EMERGENCY CONTACT
      // ========================================================

      emergencyContact: {
        name: {
          type: String,
          trim: true,
        },

        phone: {
          type: String,
          trim: true,
        },

        relationship: {
          type: String,
          trim: true,
        },
      },

      // ========================================================
      // CLINIC
      // ========================================================

      clinicId: {
        type: Schema.Types.ObjectId,
        ref: "Clinic",
      },

      // ========================================================
      // OLD SINGLE PDF
      //
      // DO NOT REMOVE THIS.
      //
      // Existing parts of Clinic-Chain may still use:
      //
      // patient.medicalPdf.name
      // patient.medicalPdf.path
      //
      // The newest PDF will continue to be stored here.
      // ========================================================

      medicalPdf: {
        name: {
          type: String,
          trim: true,
        },

        path: {
          type: String,
          trim: true,
        },
      },

      // ========================================================
      // MEDICAL PDF HISTORY
      //
      // IMPORTANT:
      //
      // Every new PDF gets added to this array.
      //
      // Example:
      //
      // medicalPdfs: [
      //   PDF 3,
      //   PDF 2,
      //   PDF 1
      // ]
      //
      // No old PDF is overwritten.
      // ========================================================

      medicalPdfs: {
        type: [MedicalPdfSchema],
        default: [],
      },

      // ========================================================
      // MEDICAL NOTES
      // ========================================================

      medicalNotes: {
        type: String,
        trim: true,
      },
    },

    // ==========================================================
    // AUTOMATIC CREATED / UPDATED DATES
    // ==========================================================

    {
      timestamps: true,
    }
  );

// ============================================================
// PREVENT MODEL RE-COMPILATION IN NEXT.JS
// ============================================================

const Patient: Model<IPatient> =
  mongoose.models.Patient ||
  mongoose.model<IPatient>(
    "Patient",
    PatientSchema
  );

export default Patient;
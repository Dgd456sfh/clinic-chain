import mongoose, { Schema, models } from "mongoose";

const PatientSchema = new Schema(
  {
    // ================= PATIENT DETAILS =================

    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      default: "Unknown",
    },

    emergencyContact: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      relationship: {
        type: String,
        default: "",
      },
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },

    medicalNotes: {
      type: String,
      default: "",
    },

    // ================= WHO ENTERED THE PATIENT =================

    createdBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      name: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        enum: [
          "admin",
          "doctor",
          "patient",
          "receptionist",
          "",
        ],
        default: "",
      },
    },

    // ================= ASSIGNED DOCTOR =================

    doctor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      name: {
        type: String,
        default: "",
      },
    },

    // ================= MEDICAL PDF =================

    medicalPdf: {
      name: {
        type: String,
        default: "",
      },

      path: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Patient =
  models.Patient ||
  mongoose.model("Patient", PatientSchema);

export default Patient;
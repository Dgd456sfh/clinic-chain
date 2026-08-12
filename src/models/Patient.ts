import mongoose, { Schema, models } from "mongoose";

const PatientSchema = new Schema(
  {
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

    enteredBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      name: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        default: "",
      },
    },

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
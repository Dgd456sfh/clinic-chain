import mongoose, { Schema, models } from "mongoose";

const MedicalHistorySchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    patientCode: {
      type: String,
      required: true,
      index: true,
    },

    enteredBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          "doctor",
          "receptionist",
          "admin",
          "patient",
        ],
        required: true,
      },
    },

    doctorName: {
      type: String,
      default: "",
    },

    diagnosis: {
      type: String,
      default: "",
    },

    prescription: {
      type: String,
      default: "",
    },

    treatment: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalHistory =
  models.MedicalHistory ||
  mongoose.model(
    "MedicalHistory",
    MedicalHistorySchema
  );

export default MedicalHistory;
import mongoose, { Schema, models } from "mongoose";

const PatientHistorySchema = new Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
    },

    changes: {
      type: [String],
      default: [],
    },

    updatedBy: {
      name: {
        type: String,
        default: "Receptionist",
      },

      role: {
        type: String,
        default: "receptionist",
      },
    },
  },
  {
    timestamps: true,
  }
);

const PatientHistory =
  models.PatientHistory ||
  mongoose.model("PatientHistory", PatientHistorySchema);

export default PatientHistory;
import mongoose, { Schema, models } from "mongoose";

const ClinicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    totalDoctors: {
      type: Number,
      default: 0,
    },

    totalPatients: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Clinic =
  models.Clinic || mongoose.model("Clinic", ClinicSchema);

export default Clinic;
import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "doctor",
        "receptionist",
        "patient",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  models.User ||
  mongoose.model("User", UserSchema);

export default User;
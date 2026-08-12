import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/clinicchain";

let cached = (globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}).mongoose;

if (!cached) {
  cached = {
    conn: null,
    promise: null,
  };

  (globalThis as typeof globalThis & {
    mongoose?: typeof cached;
  }).mongoose = cached;
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI);
  }

  cached!.conn = await cached!.promise;

  console.log("MongoDB connected successfully");

  return cached!.conn;
}
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import User from "../models/User";

async function seedUsers() {
  try {
    await connectDB();

    console.log("MongoDB connected");

    // Remove existing users
    await User.deleteMany({});

    // Hash passwords
    const adminPassword = await bcrypt.hash(
      "Admin@CC2026",
      10
    );

    const doctorPassword = await bcrypt.hash(
      "Doctor@CC2026",
      10
    );

    const patientPassword = await bcrypt.hash(
      "Patient@CC2026",
      10
    );

    // Create Admin
    await User.create({
      name: "Sarah Admin",
      email: "sarah.admin@clinicchain.health",
      password: adminPassword,
      role: "admin",
    });

    // Create Doctor
    await User.create({
      name: "Dr. Rajesh Mehta",
      email: "dr.mehta@clinicchain.health",
      password: doctorPassword,
      role: "doctor",
    });

    // Create Patient
    await User.create({
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      password: patientPassword,
      role: "patient",
    });

    console.log("✅ Users created successfully!");

    console.log(`
--------------------------------
ADMIN
Email: sarah.admin@clinicchain.health
Password: Admin@CC2026

DOCTOR
Email: dr.mehta@clinicchain.health
Password: Doctor@CC2026

PATIENT
Email: priya.sharma@gmail.com
Password: Patient@CC2026
--------------------------------
`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
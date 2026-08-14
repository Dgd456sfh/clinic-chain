"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error(
          "Login API returned invalid JSON:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        setError(
          data.message ||
            `Login failed (${response.status}).`
        );
        return;
      }

      if (!data.success || !data.user) {
        setError(
          data.message ||
            "Login response was incomplete."
        );
        return;
      }

      /*
       * Save complete login information.
       * Patient dashboard uses patientId from here.
       */
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      /*
       * Keep token only if API ever returns one.
       * The actual authentication token is stored
       * securely in the HTTP-only cookie.
       */
      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      const role = data.user.role;

      if (role === "admin") {
        router.replace("/dashboard/admin");
        return;
      }

      if (role === "doctor") {
        router.replace("/dashboard/doctor");
        return;
      }

      if (role === "receptionist") {
        router.replace("/dashboard/receptionist");
        return;
      }

      if (role === "patient") {
        if (!data.user.patientId) {
          setError(
            "Patient account is missing a Patient ID. Please contact the receptionist."
          );
          return;
        }

        router.replace("/dashboard/patient");
        return;
      }

      setError(
        "Invalid user role. Please contact the administrator."
      );
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
            Clinic-Chain
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-3 text-slate-500">
            Login to your Clinic-Chain account.
          </p>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-xl md:p-9">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3.5 font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <div className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:underline"
            >
              Register
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
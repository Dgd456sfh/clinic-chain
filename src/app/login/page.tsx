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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed."
        );
        return;
      }

      /* ROLE BASED REDIRECT */

      const role = data.user.role;

      if (role === "admin") {
        router.push("/dashboard/admin");
      }

      else if (role === "doctor") {
        router.push("/dashboard/doctor");
      }

      else if (role === "receptionist") {
        router.push("/dashboard/receptionist");
      }

      else if (role === "patient") {
        router.push("/dashboard/patient");
      }

      else {
        setError("Invalid user role.");
      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">

      <div className="mx-auto max-w-md">

        {/* HEADER */}

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


        {/* LOGIN CARD */}

        <div className="rounded-3xl border border-sky-100 bg-white p-7 shadow-xl md:p-9">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

            </div>


            {/* PASSWORD */}

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>

            )}


            {/* LOGIN BUTTON */}

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


          {/* REGISTER LINK */}

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
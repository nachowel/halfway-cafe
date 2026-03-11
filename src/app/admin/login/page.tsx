/* Admin Login — email/password auth via Supabase */

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClientComponentClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] px-4">
      <div className="w-full max-w-md rounded-sm border border-neutral-800 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🍳</span>
          <h1 className="mt-3 font-playfair text-2xl font-bold text-neutral-900">
            Halfway Cafe
          </h1>
          <p className="mt-1 font-lora text-sm text-neutral-500">
            Admin Panel
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-lora text-xs font-medium uppercase tracking-wide text-neutral-600"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@halfway.cafe"
              autoComplete="email"
              className="w-full rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-lora text-xs font-medium uppercase tracking-wide text-neutral-600"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 bg-red-600 px-4 py-3 font-baskerville text-xs uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

type Message = { type: "success" | "error"; text: string } | null;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  function isValidEmail(value: string) {
    // super simple check for demo purposes
    return /\S+@\S+\.\S+/.test(value);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    // client-only validation (no backend yet)
    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);

    // For this first step we DO NOT call the backend.
    // We only simulate a successful login to test UI flow.
    // We'll wire the Fastify API in the next step.
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: "success", text: "Form submitted (demo). Backend wiring comes next." });
      // Reset fields for demo
      setEmail("");
      setPassword("");
    }, 500);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign in</h1>

          {message && (
            <div
              className={`mb-4 rounded-md border p-3 text-sm ${
                message.type === "success"
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-red-300 bg-red-50 text-red-800"
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 text-white font-medium px-4 py-2.5 hover:bg-black disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500">
            This is a UI-only demo. Next step: connect to your Fastify backend.
          </p>
        </div>
      </div>
    </main>
  );
}

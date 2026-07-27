"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function passwordChecks(pw: string) {
  return [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "A lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
  ];
}

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const passwordOk = checks.every((c) => c.ok);
  const canSubmit = username && email && passwordOk && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!passwordOk) {
      setError("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    try {
      await signup(username, email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Trade<span className="text-brand">Flow</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Create your trading journal account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="trader_jane"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-center gap-2 text-xs ${
                      c.ok ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <span>{c.ok ? "✓" : "○"}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={!canSubmit}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
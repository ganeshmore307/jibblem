"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("kiran@upscaledemo.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Login failed.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-white font-extrabold text-xl">T</div>
          <span className="text-2xl font-extrabold text-ink">TrackDeck</span>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-xl font-extrabold mb-1">Sign in to your workspace</h1>
          <p className="text-sm text-muted mb-6">Track time, attendance and timesheets.</p>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>
          )}
          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="you@company.com"
          />
          <label className="block text-sm font-bold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand hover:bg-brand-dark text-white font-bold py-2.5 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="mt-6 rounded-lg bg-brand-faint border border-brand-light px-3 py-2 text-xs text-ink/80">
            <div className="font-bold mb-1">Demo credentials</div>
            <div>Email: <code>kiran@upscaledemo.com</code> (owner) — or any member email</div>
            <div>Password: <code>demo1234</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}

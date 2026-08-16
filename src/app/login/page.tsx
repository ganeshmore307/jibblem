"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const GOOGLE_ERRORS: Record<string, string> = {
  config: "Google sign-in is not configured yet.",
  cancelled: "Google sign-in was cancelled.",
  state: "Google sign-in session expired. Please try again.",
  token: "Google sign-in could not be completed. Please try again.",
  profile: "We could not read your Google account email.",
  unverified: "Your Google account email is not verified.",
  not_registered: "This Google email is not registered in this workspace.",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("kiran@upscaledemo.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("google_error");
    if (!googleError) return;
    setError(GOOGLE_ERRORS[googleError] ?? "Google sign-in failed. Please try again.");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

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

          <a
            href="/api/auth/google"
            className="w-full rounded-lg border border-line bg-white hover:bg-gray-50 text-ink font-bold py-2.5 px-4 flex items-center justify-center gap-3 transition-colors"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.703-1.568 2.684-3.878 2.684-6.615Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.91-2.258c-.805.54-1.835.859-3.046.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.168.282-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.039l3.007-2.332Z" />
              <path fill="#EA4335" d="M9 3.579c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z" />
            </svg>
            Continue with Google
          </a>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

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

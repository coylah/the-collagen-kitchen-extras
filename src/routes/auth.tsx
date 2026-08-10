// auth.tsx
// Login page for Collagen Kitchen.
// Uses magic link (no password) — user enters email, receives a one-click login link.
// Only users created via the Systeme.io purchase webhook can log in.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, go straight to the app
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  const send = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (err) {
      console.error("[Auth] Magic link error:", err.message);
      setError("Something went wrong. Please try again or contact support.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="font-script text-3xl text-secondary mb-4">Love Coylah</p>
        <h2 className="font-serif text-2xl font-light text-foreground mb-3">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-2">
          We've sent a login link to <strong>{email}</strong>
        </p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Click the link in that email and you'll be straight into Collagen Kitchen. No password needed.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="mt-6 text-xs text-muted-foreground underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-script text-3xl text-secondary mb-1">Love Coylah</p>
          <h1 className="font-serif text-xl font-light text-foreground mb-2">Collagen Kitchen</h1>
          <p className="text-xs text-muted-foreground">Enter your email to access your recipes</p>
        </div>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-secondary mb-3"
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={send}
          disabled={loading || !email.trim()}
          className="w-full rounded-full bg-secondary py-4 text-sm font-semibold text-white disabled:opacity-40 hover:bg-secondary/90"
        >
          {loading ? "Sending…" : "Send me a login link →"}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
          Access is for Collagen Kitchen subscribers only.{" "}
          <a href="https://lovecoylah.com" className="text-secondary underline">Get access here.</a>
        </p>
      </div>
    </div>
  );
}

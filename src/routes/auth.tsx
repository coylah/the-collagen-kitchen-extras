import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin/import" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/admin/import" });
        } else {
          // Not auto-confirmed — try signing in directly (auto-confirm may be on server-side)
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            setMsg("Account created. Check your email to confirm, then sign in.");
            setMode("signin");
          } else {
            navigate({ to: "/admin/import" });
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin/import" });
      }
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-3xl mb-6">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-secondary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-secondary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-secondary py-3 text-sm font-medium text-secondary-foreground disabled:opacity-40 hover:bg-secondary/90"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>


        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
          className="mt-6 text-xs text-muted-foreground hover:text-foreground underline block mx-auto"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>

        {msg && <p className="mt-4 text-sm text-center">{msg}</p>}
      </div>
    </AppShell>
  );
}

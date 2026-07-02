import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { importRecipes } from "@/lib/recipes.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/import")({
  component: ImportPage,
});

function ImportPage() {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setEmail(userRes.user?.email ?? null);
      if (!userRes.user) return setIsAdmin(false);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setStatus(null);
    try {
      const data = JSON.parse(json);
      const result = await importRecipes({ data: { recipes: data } });
      setStatus(`Done — ${result.imported} recipe${result.imported === 1 ? "" : "s"} imported.`);
      setJson("");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-3xl">Import recipes</h1>
          {email && (
            <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground underline">
              Sign out ({email})
            </button>
          )}
        </div>

        {isAdmin === false && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            Your account doesn't have the <strong>admin</strong> role, so imports will be rejected by the database.
            Ask a project owner to grant you admin, then reload this page.
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6 mt-4">
          Paste a JSON array of recipes matching the cookbook schema. Existing recipes with the same slug will be updated.
        </p>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-64 rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs outline-none focus:border-secondary"
          placeholder='[{ "name": "...", "meal_type": "...", ... }]'
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !json.trim() || isAdmin === false}
          className="mt-4 w-full rounded-xl bg-secondary py-3 text-sm font-medium text-secondary-foreground disabled:opacity-40 hover:bg-secondary/90"
        >
          {loading ? "Importing…" : "Import recipes"}
        </button>
        {status && (
          <p className={`mt-4 text-sm ${status.startsWith("Error") ? "text-destructive" : "text-secondary"}`}>
            {status}
          </p>
        )}
      </div>
    </AppShell>
  );
}

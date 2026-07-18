import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Search, Filter, Salad, BookOpen, Soup } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { RecipeCard } from "@/components/recipe-card";
import { Input } from "@/components/ui/input";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "The Collagen Kitchen — Love Coylah" },
      {
        name: "description",
        content: "Skin-food recipes to help you age slow and reclaim your glow.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: Cookbook,
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="mx-auto max-w-6xl p-8 text-destructive">{error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p className="mx-auto max-w-6xl p-8">No recipes yet.</p>
    </AppShell>
  ),
}));

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "dessert", "smoothie"];
const EXCLUDED_MEAL_TYPES = new Set(["bone broth"]);

function Cookbook() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const [search, setSearch] = useState("");
  const [meal, setMeal] = useState<string>("all");
  const [maxTime, setMaxTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("ck.lastFilter");
    if (saved) setMeal(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ck.lastFilter", meal);
  }, [meal]);

  const visibleRecipes = useMemo(
    () => recipes.filter(r => !EXCLUDED_MEAL_TYPES.has(r.meal_type)),
    [recipes]
  );

  const mealTypes = useMemo(
    () =>
      Array.from(new Set(visibleRecipes.map((r) => r.meal_type))).sort(
        (a, b) => (MEAL_ORDER.indexOf(a) + 99) - (MEAL_ORDER.indexOf(b) + 99),
      ),
    [visibleRecipes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleRecipes
      .filter((r) => {
        if (meal !== "all" && r.meal_type !== meal) return false;
        if (maxTime > 0 && r.prep_min + r.cook_min > maxTime) return false;
        if (q) {
          const hay =
            r.name.toLowerCase() +
            " " +
            r.tags.join(" ").toLowerCase() +
            " " +
            r.ingredients.map((i) => i.item).join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ma = MEAL_ORDER.indexOf(a.meal_type);
        const mb = MEAL_ORDER.indexOf(b.meal_type);
        const oa = ma === -1 ? 99 : ma;
        const ob = mb === -1 ? 99 : mb;
        if (oa !== ob) return oa - ob;
        return a.name.localeCompare(b.name);
      });
  }, [visibleRecipes, search, meal, maxTime]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    for (const r of filtered) (g[r.meal_type] ??= []).push(r);
    return g;
  }, [filtered]);

  if (visibleRecipes.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl">Recipes coming soon</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="relative overflow-hidden" style={{ height: "clamp(200px, 30vh, 300px)" }}>
          {/* Hero photo: Sticky Harissa Chicken with Mint Yoghurt & Pomegranate Salad */}
          <img
            src="/images/hero-harissa-chicken.jpg"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          />
          <p className="font-script text-lg text-white absolute top-3 left-4 drop-shadow">
            Love Coylah
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-5 pt-2 pb-4 text-center">
          <h1 className="font-serif text-3xl font-light leading-tight text-foreground mb-1.5">
            The Collagen Kitchen
          </h1>
          <div className="w-7 h-px bg-secondary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground leading-snug mb-3 font-light max-w-xs mx-auto">
            Real food. Real results. Built from the inside out.
          </p>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Browse recipes
            </Link>
            <Link
              to="/build/glow-bowl"
              className="flex items-center gap-2.5 rounded-full bg-secondary/10 px-4 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/15 transition-colors"
            >
              <Salad className="h-4 w-4 shrink-0" />
              Glow Bowl Builder
            </Link>
            <Link
              to="/build/yoghurt-bowl"
              className="flex items-center gap-2.5 rounded-full bg-secondary/10 px-4 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/15 transition-colors"
            >
              <span className="shrink-0">🥣</span>
              Yoghurt Bowl Builder
            </Link>
            <Link
              to="/bone-broth"
              className="flex items-center gap-2.5 rounded-full border border-secondary px-4 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/5 transition-colors"
            >
              <Soup className="h-4 w-4 shrink-0" />
              Bone Broth Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-[63px] z-30 border-b border-border bg-white/98 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 space-y-2.5">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes or ingredients…"
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
              Meal type:
            </span>
            <FilterChip label="All" active={meal === "all"} onClick={() => setMeal("all")} />
            {mealTypes.map((m) => (
              <FilterChip key={m} label={m} active={meal === m} onClick={() => setMeal(m)} />
            ))}
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="h-8 rounded-full border border-border bg-background px-3 text-xs text-foreground shrink-0"
            >
              <option value={0}>Time: any</option>
              <option value={15}>Under 15 min</option>
              <option value={30}>Under 30 min</option>
              <option value={45}>Under 45 min</option>
              <option value={60}>Under 60 min</option>
            </select>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Filter className="h-3 w-3" /> {filtered.length} of {visibleRecipes.length}
            </span>
          </div>
        </div>
      </section>

      {/* Recipe grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No recipes match those filters yet.
          </p>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([mealType, items]) => (
              <div key={mealType}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="font-serif text-2xl sm:text-3xl font-light capitalize">{mealType}</h2>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                    {items.length} {items.length === 1 ? "recipe" : "recipes"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => (
                    <RecipeCard key={r.id} recipe={r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs capitalize transition-colors shrink-0 " +
        (active
          ? "border-secondary bg-secondary text-secondary-foreground font-medium"
          : "border-border bg-background text-foreground/60 hover:border-secondary/40 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

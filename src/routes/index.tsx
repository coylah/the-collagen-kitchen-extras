import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Filter, BookOpen, Coffee, Sun, Moon, Apple, Cookie } from "lucide-react";
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

const HERO_MEAL_TYPES: { key: string; label: string; icon: typeof Coffee }[] = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sun },
  { key: "dinner", label: "Dinner", icon: Moon },
  { key: "snack", label: "Snack", icon: Apple },
  { key: "dessert", label: "Dessert", icon: Cookie },
];

function Cookbook() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [maxTime, setMaxTime] = useState<number>(0);

  const visibleRecipes = useMemo(
    () => recipes.filter(r => !EXCLUDED_MEAL_TYPES.has(r.meal_type)),
    [recipes]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return visibleRecipes
      .filter((r) => {
        if (maxTime > 0 && r.prep_min + r.cook_min > maxTime) return false;
        const hay =
          r.name.toLowerCase() +
          " " +
          r.tags.join(" ").toLowerCase() +
          " " +
          r.ingredients.map((i) => i.item).join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const ma = MEAL_ORDER.indexOf(a.meal_type);
        const mb = MEAL_ORDER.indexOf(b.meal_type);
        const oa = ma === -1 ? 99 : ma;
        const ob = mb === -1 ? 99 : mb;
        if (oa !== ob) return oa - ob;
        return a.name.localeCompare(b.name);
      });
  }, [visibleRecipes, search, maxTime]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    for (const r of filtered) (g[r.meal_type] ??= []).push(r);
    return g;
  }, [filtered]);

  const showResults = search.trim().length > 0;

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
    <AppShell hideFooter>
      {/* Hero — sized to fill the viewport between the header and the bottom
          ribbon so the resting state never scrolls on a phone screen. The
          leftover slack (if any) is absorbed by justify-center rather than
          pooling as dead space at the bottom. */}
      <section
        className="flex flex-col justify-center border-b border-border bg-white"
        style={{ minHeight: "calc(100dvh - 164px)" }}
      >
        <div className="relative overflow-hidden shrink-0" style={{ height: "clamp(90px, 14vh, 130px)" }}>
          {/* Hero photo: Sticky Harissa Chicken with Mint Yoghurt & Pomegranate Salad */}
          <img
            src="/images/hero-harissa-chicken.jpg"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          />
          <p className="font-script text-lg text-white absolute top-3 left-4 drop-shadow">
            Love Coylah
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-5 pt-1 pb-2.5 text-center">
          <h1 className="font-serif text-xl font-light leading-tight text-foreground mb-0.5">
            The Collagen Kitchen
          </h1>
          <div className="w-7 h-px bg-secondary mx-auto mb-1" />
          <p className="text-[11px] text-muted-foreground leading-snug mb-2.5 font-light max-w-xs mx-auto">
            Real food. Real results. Built from the inside out.
          </p>

          {/* 3x2 tile grid: 5 meal types + search, filled/shaded for a more
              premium feel than a plain outlined pill */}
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {HERO_MEAL_TYPES.map(({ key, label, icon: MealIcon }) => (
              <Link
                key={key}
                to="/meal/$type"
                params={{ type: key }}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-secondary/15 bg-gradient-to-b from-secondary/[0.06] to-secondary/[0.02] px-1.5 py-3 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md active:scale-[0.97]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white shadow-sm transition-transform group-hover:scale-105">
                  <MealIcon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-[11.5px] font-medium leading-none text-foreground/85">{label}</span>
              </Link>
            ))}

            <button
              onClick={() => setSearchOpen(true)}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-secondary/15 bg-gradient-to-b from-secondary/[0.06] to-secondary/[0.02] px-1.5 py-3 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md active:scale-[0.97]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white shadow-sm transition-transform group-hover:scale-105">
                <Search className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="text-[11.5px] font-medium leading-none text-foreground/85">Search</span>
            </button>
          </div>

          {searchOpen && (
            <div className="relative mt-2.5 max-w-sm mx-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => { if (!search.trim()) setSearchOpen(false); }}
                placeholder="Search recipes or ingredients…"
                className="pl-10 pr-9 w-full rounded-full border-secondary"
              />
              <button
                onClick={() => { setSearch(""); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Search results — only shown once the person actually searches */}
      {showResults && (
        <>
          <div className="sticky top-[63px] z-30 border-b border-border bg-white/98 backdrop-blur shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-2">
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

          <section className="mx-auto max-w-6xl px-4 py-8">
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No recipes match that search.
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
        </>
      )}
    </AppShell>
  );
}

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
    <AppShell>
      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="relative overflow-hidden" style={{ height: "clamp(160px, 22vh, 230px)" }}>
          {/* Hero photo: Sticky Harissa Chicken with Mint Yoghurt & Pomegranate Salad */}
          <img
            src="/images/hero-harissa-chicken.jpg"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          />
          <p className="font-script text-lg text-white absolute top-3 left-4 drop-shadow">
            Love Coylah
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-5 pt-1.5 pb-3 text-center">
          <h1 className="font-serif text-2xl font-light leading-tight text-foreground mb-1">
            The Collagen Kitchen
          </h1>
          <div className="w-7 h-px bg-secondary mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground leading-snug mb-2.5 font-light max-w-xs mx-auto">
            Real food. Real results. Built from the inside out.
          </p>

          {/* First 4 meal types as a 2x2 grid, Dessert + search span both columns below */}
          <div className="grid grid-cols-2 gap-1.5 max-w-sm mx-auto">
            {HERO_MEAL_TYPES.slice(0, 4).map(({ key, label, icon: MealIcon }) => (
              <Link
                key={key}
                to="/meal/$type"
                params={{ type: key }}
                className="flex items-center justify-center gap-1.5 rounded-full border border-secondary bg-white px-2 py-2.5 text-[13px] font-medium text-secondary hover:bg-secondary/5 transition-colors"
              >
                <MealIcon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            ))}

            {HERO_MEAL_TYPES.slice(4).map(({ key, label, icon: MealIcon }) => (
              <Link
                key={key}
                to="/meal/$type"
                params={{ type: key }}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-full border border-secondary bg-white px-2 py-2.5 text-[13px] font-medium text-secondary hover:bg-secondary/5 transition-colors"
              >
                <MealIcon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            ))}

            {searchOpen ? (
              <div className="relative col-span-2">
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
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-full border border-secondary bg-white px-4 py-2.5 text-[13px] font-medium text-secondary hover:bg-secondary/5 transition-colors"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                Search recipes
              </button>
            )}
          </div>
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

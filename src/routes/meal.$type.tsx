import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Heart, Search } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { RecipeCard } from "@/components/recipe-card";
import { Input } from "@/components/ui/input";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

const TAGLINES: Record<string, string> = {
  breakfast: "Nourishing, collagen-rich recipes to start your day.",
  lunch: "Nourishing, collagen-rich recipes to fuel your day.",
  dinner: "Collagen-supporting recipes to wind your day down.",
  snack: "Quick, skin-loving bites between meals.",
  dessert: "Sweet treats that still work for your glow.",
};

export const Route = createFileRoute("/meal/$type")(({
  head: ({ params }) => ({
    meta: [{ title: `${capitalize(params.type)} — The Collagen Kitchen` }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: MealTypePage,
}));

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function MealTypePage() {
  const { type } = Route.useParams();
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes
      .filter((r) => r.meal_type === type)
      .filter((r) => {
        if (!q) return true;
        const hay =
          r.name.toLowerCase() +
          " " +
          r.tags.join(" ").toLowerCase() +
          " " +
          r.ingredients.map((i) => i.item).join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes, type, search]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link
            to="/favourites"
            className="flex items-center justify-center h-8 w-8 rounded-full text-secondary hover:bg-secondary/5 transition-colors"
            aria-label="Your saved recipes"
            title="Your saved recipes"
          >
            <Heart className="h-5 w-5" />
          </Link>
        </div>

        <span className="mt-4 inline-block rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-secondary">
          {type}
        </span>
        <h1 className="mt-2 font-serif text-3xl font-light leading-tight text-foreground">
          {capitalize(type)}
        </h1>
        <div className="w-8 h-[2px] bg-secondary mt-2 mb-2.5" />
        <p className="text-sm text-muted-foreground max-w-sm">
          {TAGLINES[type] ?? "Collagen-rich recipes for you."}
        </p>

        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type} recipes…`}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-6">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No {type} recipes match that search yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

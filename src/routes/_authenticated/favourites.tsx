import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Heart, BookOpen } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { RecipeCard } from "@/components/recipe-card";
import { useFavourites } from "@/lib/user-state";
import { Button } from "@/components/ui/button";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/favourites")({
  head: () => ({
    meta: [{ title: "Saved recipes — The Collagen Kitchen" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: FavouritesPage,
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="mx-auto max-w-6xl p-8 text-destructive">{error.message}</p>
    </AppShell>
  ),
});

function FavouritesPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const { favs, clearFavs } = useFavourites();

  const saved = recipes.filter((r) => favs.includes(r.slug));

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl">Saved recipes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {saved.length === 0
                ? "Nothing saved yet — tap the heart on any recipe to save it."
                : `${saved.length} recipe${saved.length === 1 ? "" : "s"} saved.`}
            </p>
          </div>
          {saved.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFavs}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear all saved
            </Button>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any recipe to save it here.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-secondary underline underline-offset-2"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

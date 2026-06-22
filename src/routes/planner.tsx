import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Trash2, X, ShoppingBasket } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/recipe-types";
import { DAYS, SLOTS, planKey, useMealPlan } from "@/lib/user-state";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Weekly meal planner — The Collagen Kitchen" },
      {
        name: "description",
        content: "Plan your week of collagen-supporting meals.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: PlannerPage,
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="mx-auto max-w-6xl p-8 text-destructive">{error.message}</p>
    </AppShell>
  ),
});

function PlannerPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const { plan, set, clear } = useMealPlan();

  const totalMeals = Object.values(plan).filter(Boolean).length;

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl">Weekly meal planner</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalMeals === 0
                ? "Add recipes to plan your week — your shopping list builds automatically."
                : `${totalMeals} meal${totalMeals === 1 ? "" : "s"} planned this week.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" /> Clear week
            </Button>
            <Link to="/shopping">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <ShoppingBasket className="h-4 w-4" /> View shopping list
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="relative overflow-x-auto pb-4">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
          <div className="grid min-w-[680px] grid-cols-[72px_repeat(4,1fr)] gap-2">
            {/* Header row */}
            <div />
            {SLOTS.map((s) => (
              <div
                key={s}
                className="px-2 py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {s}
              </div>
            ))}

            {/* Day rows */}
            {DAYS.map((d) => (
              <DayRow
                key={d}
                day={d}
                plan={plan}
                bySlug={bySlug}
                onSet={set}
                recipes={recipes}
              />
            ))}
          </div>
        </div>

        {/* Help text */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Tap a slot to add a recipe. Change servings inside each recipe page. Your shopping list updates automatically.
        </p>
      </section>
    </AppShell>
  );
}

function DayRow({
  day,
  plan,
  bySlug,
  onSet,
  recipes,
}: {
  day: string;
  plan: ReturnType<typeof useMealPlan>["plan"];
  bySlug: Map<string, Recipe>;
  onSet: ReturnType<typeof useMealPlan>["set"];
  recipes: Recipe[];
}) {
  return (
    <>
      <div className="flex items-center px-1 py-2 font-serif text-sm text-muted-foreground">
        {day}
      </div>
      {SLOTS.map((s) => {
        const entry = plan[planKey(day, s)];
        const r = entry ? bySlug.get(entry.slug) : null;
        const isFilled = !!r;

        return (
          <div
            key={s}
            className={`min-h-[80px] rounded-lg border text-xs transition-colors ${
              isFilled
                ? "border-secondary/40 bg-secondary/5"
                : "border-border bg-card hover:border-secondary/30"
            }`}
          >
            {r ? (
              <div className="flex h-full flex-col justify-between p-2">
                <Link
                  to="/recipes/$slug"
                  params={{ slug: r.slug }}
                  className="line-clamp-3 font-medium text-foreground hover:text-secondary leading-snug"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.name}
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-secondary capitalize">{r.meal_type}</span>
                  <button
                    onClick={() => onSet(day, s, null)}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <select
                className="h-full w-full cursor-pointer bg-transparent text-muted-foreground outline-none px-2 py-2 text-xs"
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    onSet(day, s, { slug: e.target.value, servings: 2 });
                }}
              >
                <option value="">+ add</option>
                {recipes.map((rc) => (
                  <option key={rc.id} value={rc.slug}>
                    {rc.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </>
  );
}

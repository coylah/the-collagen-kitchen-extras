import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Trash2, X, ShoppingBasket, CalendarDays } from "lucide-react";
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

const SLOT_COLOURS: Record<string, string> = {
  breakfast: "bg-amber-50 border-amber-100",
  lunch: "bg-emerald-50 border-emerald-100",
  dinner: "bg-blue-50 border-blue-100",
  snack: "bg-rose-50 border-rose-100",
};

const SLOT_FILLED_COLOURS: Record<string, string> = {
  breakfast: "bg-amber-100/60 border-amber-200",
  lunch: "bg-emerald-100/60 border-emerald-200",
  dinner: "bg-blue-100/60 border-blue-200",
  snack: "bg-rose-100/60 border-rose-200",
};

function PlannerPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const { plan, set, clear } = useMealPlan();

  const totalMeals = Object.values(plan).filter(Boolean).length;

  return (
    <AppShell>
      {/* Header */}
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-script text-xl text-secondary mb-1">Plan your week</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-light">
                Weekly planner
              </h1>
              <p className="mt-2 text-sm text-background/60">
                {totalMeals === 0
                  ? "Tap any slot to add a recipe. Your shopping list builds automatically."
                  : `${totalMeals} meal${totalMeals === 1 ? "" : "s"} planned — your shopping list is ready.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-background/20 text-background/60 hover:bg-background/10 hover:text-background"
              >
                <Trash2 className="h-4 w-4" /> Clear week
              </Button>
              <Link to="/shopping">
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <ShoppingBasket className="h-4 w-4" /> Shopping list
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">

        {/* Slot legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {SLOTS.map((s) => (
            <div key={s} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${SLOT_COLOURS[s]}`}>
              <CalendarDays className="h-3 w-3" />
              {s}
            </div>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-2">Tap a slot to add a recipe. Tap × to remove.</span>
        </div>

        {/* Grid */}
        <div className="relative overflow-x-auto pb-4">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
          <div className="grid min-w-[720px] grid-cols-[72px_repeat(4,1fr)] gap-2">

            {/* Header row */}
            <div />
            {SLOTS.map((s) => (
              <div
                key={s}
                className={`rounded-xl border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider capitalize ${SLOT_COLOURS[s]}`}
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

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Change serving quantities inside each recipe page. Your shopping list updates automatically.
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
      <div className="flex items-center px-2 py-2 font-serif text-base font-light text-foreground">
        {day}
      </div>
      {SLOTS.map((s) => {
        const entry = plan[planKey(day, s)];
        const r = entry ? bySlug.get(entry.slug) : null;
        const isFilled = !!r;
        const colourClass = isFilled ? SLOT_FILLED_COLOURS[s] : "border-border bg-card hover:border-secondary/30 hover:bg-muted/30";

        return (
          <div
            key={s}
            className={`min-h-[90px] rounded-xl border text-xs transition-all duration-150 ${colourClass}`}
          >
            {r ? (
              <div className="flex h-full flex-col justify-between p-3">
                <Link
                  to="/recipes/$slug"
                  params={{ slug: r.slug }}
                  className="line-clamp-3 font-serif text-sm leading-snug text-foreground hover:text-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.name}
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground capitalize">{r.meal_type}</span>
                  <button
                    onClick={() => onSet(day, s, null)}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <select
                className="h-full w-full cursor-pointer bg-transparent text-muted-foreground outline-none px-3 py-2 text-xs"
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    onSet(day, s, { slug: e.target.value, servings: 2 });
                }}
              >
                <option value="">+ add recipe</option>
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

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

// Brand palette slot colours — warm, editorial, not Easter egg
const SLOT_EMPTY: Record<string, string> = {
  breakfast: "border-border bg-[#FDFAF8] hover:border-secondary/40",
  lunch:     "border-border bg-[#FBF8F9] hover:border-secondary/40",
  dinner:    "border-border bg-[#F8F8FA] hover:border-secondary/40",
  snack:     "border-border bg-[#FAF9F8] hover:border-secondary/40",
};

const SLOT_FILLED: Record<string, string> = {
  breakfast: "border-secondary/30 bg-[#FEF5F0]",
  lunch:     "border-secondary/40 bg-[#FEF0F2]",
  dinner:    "border-secondary/20 bg-[#F5F0FE]",
  snack:     "border-secondary/35 bg-[#F0FEF5]",
};

const SLOT_HEADER: Record<string, string> = {
  breakfast: "bg-[#FEF3ED] border-[#F5D5C0] text-[#8B5040]",
  lunch:     "bg-[#FEF0F2] border-[#F2C5CC] text-[#8B3A48]",
  dinner:    "bg-[#F0EFFE] border-[#D0CCED] text-[#4A4680]",
  snack:     "bg-[#EDFEF5] border-[#B8EDD0] text-[#2D6B4A]",
};

function PlannerPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const { plan, set, clear } = useMealPlan();

  const totalMeals = Object.values(plan).filter(Boolean).length;

  return (
    <AppShell>
      {/* Header — light, not dark */}
      <section className="border-b border-border bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6 bg-secondary" />
                <p className="text-[9px] uppercase tracking-[0.32em] text-secondary">Plan your week</p>
              </div>
              <p className="font-script text-2xl text-secondary -mb-1">Love Coylah</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-light text-foreground">
                Weekly planner
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {totalMeals === 0
                  ? "Tap any slot to add a recipe. Your shopping list builds automatically."
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
                  <ShoppingBasket className="h-4 w-4" /> Shopping list
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {/* Grid */}
        <div className="relative overflow-x-auto pb-4">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
          <div className="grid min-w-[680px] grid-cols-[64px_repeat(4,1fr)] gap-2">

            {/* Header row */}
            <div />
            {SLOTS.map((s) => (
              <div
                key={s}
                className={`rounded-xl border px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider ${SLOT_HEADER[s]}`}
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

        <p className="mt-5 text-xs text-muted-foreground text-center">
          Tap any slot to add a recipe · Tap × to remove · Change servings inside each recipe page
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
      <div className="flex items-center px-1 py-2 font-serif text-sm font-light text-muted-foreground">
        {day}
      </div>
      {SLOTS.map((s) => {
        const entry = plan[planKey(day, s)];
        const r = entry ? bySlug.get(entry.slug) : null;
        const isFilled = !!r;
        const cls = isFilled ? SLOT_FILLED[s] : SLOT_EMPTY[s];

        return (
          <div
            key={s}
            className={`min-h-[88px] rounded-xl border text-xs transition-all duration-150 ${cls}`}
          >
            {r ? (
              <div className="flex h-full flex-col justify-between p-3 min-h-[88px]">
                <Link
                  to="/recipes/$slug"
                  params={{ slug: r.slug }}
                  className="line-clamp-3 font-serif text-sm leading-snug text-foreground hover:text-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.name}
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-secondary">{r.meal_type}</span>
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
                className="h-full w-full min-h-[88px] cursor-pointer bg-transparent text-muted-foreground outline-none px-3 py-2 text-xs rounded-xl"
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

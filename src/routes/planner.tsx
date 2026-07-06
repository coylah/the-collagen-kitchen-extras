import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, X, ShoppingBasket } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/recipe-types";
import { DAYS, SLOTS, planKey, useMealPlan, useShoppingExtras, useManualItems, type PlanEntry } from "@/lib/user-state";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Weekly meal planner — The Collagen Kitchen" },
      { name: "description", content: "Plan your week of collagen-supporting meals." },
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

const SLOT_STYLE: Record<string, string> = {
  breakfast: "border-border bg-white hover:border-secondary/40",
  lunch: "border-border bg-white hover:border-secondary/40",
  dinner: "border-border bg-white hover:border-secondary/40",
  snack: "border-border bg-white hover:border-secondary/40",
  dessert: "border-border bg-white hover:border-secondary/40",
};

const SLOT_FILLED: Record<string, string> = {
  breakfast: "border-secondary/40 bg-[#fef2f4]",
  lunch: "border-secondary/40 bg-[#fef2f4]",
  dinner: "border-secondary/40 bg-[#fef2f4]",
  snack: "border-secondary/40 bg-[#fef2f4]",
  dessert: "border-secondary/40 bg-[#fef2f4]",
};

const SLOT_HEADER: Record<string, string> = {
  breakfast: "bg-white border-border text-muted-foreground",
  lunch: "bg-white border-border text-muted-foreground",
  dinner: "bg-white border-border text-muted-foreground",
  snack: "bg-white border-border text-muted-foreground",
  dessert: "bg-white border-border text-muted-foreground",
};

function PlannerPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const { plan, set, clear } = useMealPlan();
  const { clear: clearExtras } = useShoppingExtras();
  const { clearAll: clearManual } = useManualItems();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalMeals = Object.values(plan).filter(Boolean).length;

  function handleClearWeek() {
    clear();
    clearExtras();
    clearManual();
    setShowClearConfirm(false);
  }

  return (
    <AppShell>
      {/* Confirm dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">Clear your week?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will remove all meals from your planner, clear your bowl extras and any items you've added manually to your shopping list. Your saved favourites will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleClearWeek}
                className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, clear everything
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-6 bg-secondary" />
                <p className="text-[9px] uppercase tracking-[0.32em] text-secondary">Plan your week</p>
              </div>
              <p className="font-script text-2xl text-secondary -mb-1">Love Coylah</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground">
                Weekly planner
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalMeals === 0
                  ? "Tap any slot to add a recipe or bowl. Your shopping list builds automatically."
                  : `${totalMeals} meal${totalMeals === 1 ? "" : "s"} planned this week.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
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

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-[56px_repeat(5,1fr)] gap-1.5">
            <div />
            {SLOTS.map((s) => (
              <div key={s} className={`rounded-lg border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider capitalize ${SLOT_HEADER[s] ?? "bg-white border-border text-muted-foreground"}`}>
                {s}
              </div>
            ))}

            {DAYS.map((d) => (
              <DayRow key={d} day={d} plan={plan} bySlug={bySlug} onSet={set} recipes={recipes} />
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Tap any slot to add a recipe · Tap × to remove
        </p>
      </section>
    </AppShell>
  );
}

function DayRow({ day, plan, bySlug, onSet, recipes }: {
  day: string;
  plan: ReturnType<typeof useMealPlan>["plan"];
  bySlug: Map<string, Recipe>;
  onSet: ReturnType<typeof useMealPlan>["set"];
  recipes: Recipe[];
}) {
  const [confirmSlot, setConfirmSlot] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center px-1 py-2 font-serif text-sm font-light text-muted-foreground">
        {day}
      </div>
      {SLOTS.map((s) => {
        const entry = plan[planKey(day, s)];
        const isCustom = entry?.isCustomBowl;
        const r = entry && !isCustom ? bySlug.get(entry.slug) : null;
        const isFilled = !!entry && (isCustom || !!r);
        const cls = isFilled
          ? (SLOT_FILLED[s] ?? "border-secondary/40 bg-[#fef2f4]")
          : (SLOT_STYLE[s] ?? "border-border bg-white hover:border-secondary/40");
        const slotKey = `${day}-${s}`;

        return (
          <div key={s} className={`min-h-[80px] rounded-lg border text-xs transition-all duration-150 ${cls} relative`}>
            {/* Confirm remove dialog */}
            {confirmSlot === slotKey && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/95 p-2 text-center">
                <p className="text-[11px] text-foreground font-medium">Remove this meal?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setConfirmSlot(null)}
                    className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onSet(day, s, null); setConfirmSlot(null); }}
                    className="rounded-md bg-destructive px-2 py-1 text-[10px] font-medium text-destructive-foreground"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {isCustom && entry ? (
              <div className="flex h-full flex-col justify-between p-2 min-h-[80px]">
                <p className="line-clamp-3 font-serif text-sm leading-snug text-foreground">
                  {entry.bowlName}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-secondary">Custom bowl</span>
                  <button
                    onClick={() => setConfirmSlot(slotKey)}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : r ? (
              <div className="flex h-full flex-col justify-between p-2 min-h-[80px]">
                <Link
                  to="/recipes/$slug"
                  params={{ slug: r.slug }}
                  className="line-clamp-3 font-serif text-sm leading-snug text-foreground hover:text-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.name}
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-secondary">{r.meal_type}</span>
                  <button
                    onClick={() => setConfirmSlot(slotKey)}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <select
                className="h-full w-full min-h-[80px] cursor-pointer bg-transparent text-muted-foreground outline-none px-2 py-2 text-xs rounded-lg"
                value=""
                onChange={(e) => {
                  if (e.target.value) onSet(day, s, { slug: e.target.value, servings: 2 });
                }}
              >
                <option value="">+ add</option>
                {recipes.map((rc) => (
                  <option key={rc.id} value={rc.slug}>{rc.name}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </>
  );
}

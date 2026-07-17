import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Trash2, X, ShoppingBasket } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/recipe-types";
import { DAYS, SLOTS, planKey, useMealPlan, useShoppingExtras, useManualItems, type Slot, type Week } from "@/lib/user-state";
import { cn } from "@/lib/utils";

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

const SLOT_MEAL_TYPES: Record<string, string[]> = {
  breakfast: ["breakfast"],
  lunch: ["lunch"],
  dinner: ["dinner"],
  snack: ["snack"],
  dessert: ["dessert"],
};

type PendingEntry =
  | { type: "recipe"; slug: string; servings: number; name: string }
  | { type: "bowl"; bowlName: string; bowlIngredients: { item: string; category: string }[] };

function PlannerPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const [activeWeek, setActiveWeek] = useState<Week>(() => {
    return (localStorage.getItem("ck.activeWeek") as Week) ?? "1";
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pending, setPending] = useState<PendingEntry | null>(null);

  const week1 = useMealPlan("1");
  const week2 = useMealPlan("2");
  const extras1 = useShoppingExtras("1");
  const extras2 = useShoppingExtras("2");
  const manual1 = useManualItems("1");
  const manual2 = useManualItems("2");

  const { plan, set, clear } = activeWeek === "1" ? week1 : week2;
  const { clear: clearExtras } = activeWeek === "1" ? extras1 : extras2;
  const { clearAll: clearManual } = activeWeek === "1" ? manual1 : manual2;

  useEffect(() => {
    localStorage.setItem("ck.activeWeek", activeWeek);
  }, [activeWeek]);

  useEffect(() => {
    const stored = localStorage.getItem("ck.pendingPlanRecipe");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localStorage.removeItem("ck.pendingPlanRecipe");
        if (parsed.isCustomBowl) {
          setPending({
            type: "bowl",
            bowlName: parsed.bowlName ?? "Custom Bowl",
            bowlIngredients: parsed.bowlIngredients ?? [],
          });
        } else {
          const recipe = recipes.find(r => r.slug === parsed.slug);
          if (recipe) {
            setPending({ type: "recipe", slug: parsed.slug, servings: parsed.servings ?? recipe.servings, name: recipe.name });
          }
        }
      } catch (e) {}
    }
  }, [recipes]);

  const totalMeals = Object.values(plan).filter(Boolean).length;

  function handleClearWeek() {
    clear();
    clearExtras();
    clearManual();
    setShowClearConfirm(false);
  }

  function addPendingToSlot(day: string, slot: Slot) {
    if (!pending) return;
    if (pending.type === "bowl") {
      set(day, slot, {
        slug: "",
        servings: 1,
        isCustomBowl: true,
        bowlName: pending.bowlName,
        bowlIngredients: pending.bowlIngredients,
      });
    } else {
      set(day, slot, { slug: pending.slug, servings: pending.servings });
    }
    setPending(null);
  }

  const pendingName = pending?.type === "bowl" ? pending.bowlName : pending?.type === "recipe" ? pending.name : null;

  return (
    <AppShell>
      {/* Confirm clear */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">Clear Week {activeWeek}?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {activeWeek === "1"
                ? "This will clear your Week 1 plan, bowl extras and manual items. Week 2 is safe and won't be touched."
                : "This will clear your Week 2 plan, bowl extras and manual items. Week 1 is safe and won't be touched."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={handleClearWeek} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Yes, clear Week {activeWeek}</button>
            </div>
          </div>
        </div>
      )}

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-secondary" />
                <p className="text-[9px] uppercase tracking-[0.32em] text-secondary">Plan your week</p>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground">Weekly planner</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {totalMeals === 0 ? "Tap any slot to add a recipe." : `${totalMeals} meal${totalMeals === 1 ? "" : "s"} planned.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)} className="text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
              <Link to="/shopping">
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <ShoppingBasket className="h-3.5 w-3.5" /> Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Week tabs */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveWeek("1")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeWeek === "1"
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              )}
            >
              Week 1
            </button>
            <button
              onClick={() => setActiveWeek("2")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeWeek === "2"
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              )}
            >
              Week 2
            </button>
            <p className="text-xs text-muted-foreground ml-1">
              {activeWeek === "1"
                ? "Your current week. Build Week 2 ahead while you're still cooking through this one."
                : "Plan ahead. Week 1 is safe — nothing here touches it."}
            </p>
          </div>
        </div>
      </section>

      {/* Pending banner */}
      {pending && (
        <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-3">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-secondary mb-1">
              Adding to Week {activeWeek}: <span className="font-serif">{pendingName}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-2">Tap any empty slot below to add it.</p>
            <button onClick={() => setPending(null)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile */}
      <section className="lg:hidden mx-auto max-w-6xl px-4 py-4">
        <div className="space-y-6">
          {SLOTS.map((slot) => (
            <div key={slot}>
              <h2 className="font-serif text-lg capitalize mb-2 text-foreground">{slot}</h2>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day) => {
                  const entry = plan[planKey(day, slot)];
                  const isCustom = entry?.isCustomBowl;
                  const r = entry && !isCustom ? bySlug.get(entry.slug) : null;
                  const isFilled = !!entry && (isCustom || !!r);
                  const isPending = !!pending;
                  const slotRecipes = recipes.filter(rc => SLOT_MEAL_TYPES[slot]?.includes(rc.meal_type));

                  return (
                    <div
                      key={day}
                      className={cn(
                        "rounded-lg border text-[10px] transition-all",
                        isFilled ? "border-secondary/40 bg-[#fef2f4]" : "border-border bg-white",
                        isPending && !isFilled && "border-secondary/40 bg-secondary/5 cursor-pointer"
                      )}
                      onClick={() => isPending && !isFilled ? addPendingToSlot(day, slot) : undefined}
                    >
                      <div className="px-1 pt-1 text-center text-muted-foreground font-medium">{day}</div>
                      {isPending && !isFilled ? (
                        <div className="p-1 text-center text-secondary text-[9px]">+ tap</div>
                      ) : isCustom && entry ? (
                        <div className="p-1 flex flex-col gap-1">
                          <p className="line-clamp-2 text-[9px] leading-tight text-foreground">{entry.bowlName}</p>
                          <button onClick={(e) => { e.stopPropagation(); set(day, slot, null); }} className="text-destructive text-[9px]">✕</button>
                        </div>
                      ) : r ? (
                        <div className="p-1 flex flex-col gap-1">
                          <Link to="/recipes/$slug" params={{ slug: r.slug }} className="line-clamp-2 text-[9px] leading-tight text-foreground hover:text-secondary">
                            {r.name}
                          </Link>
                          <button onClick={(e) => { e.stopPropagation(); set(day, slot, null); }} className="text-destructive text-[9px]">✕</button>
                        </div>
                      ) : (
                        <select
                          className="w-full bg-transparent text-muted-foreground outline-none px-0.5 py-1 text-[9px] rounded-lg"
                          value=""
                          onChange={(e) => { if (e.target.value) set(day, slot, { slug: e.target.value, servings: 2 }); }}
                        >
                          <option value="">+</option>
                          {slotRecipes.map((rc) => (
                            <option key={rc.id} value={rc.slug}>{rc.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Desktop */}
      <section className="hidden lg:block mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-[56px_repeat(5,1fr)] gap-1.5">
            <div />
            {SLOTS.map((s) => (
              <div key={s} className="rounded-lg border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider capitalize bg-white border-border text-muted-foreground">
                {s}
              </div>
            ))}
            {DAYS.map((d) => (
              <DayRow
                key={d}
                day={d}
                plan={plan}
                bySlug={bySlug}
                onSet={set}
                recipes={recipes}
                pending={pending}
                onAddPending={addPendingToSlot}
              />
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

function DayRow({ day, plan, bySlug, onSet, recipes, pending, onAddPending }: {
  day: string;
  plan: ReturnType<typeof useMealPlan>["plan"];
  bySlug: Map<string, Recipe>;
  onSet: ReturnType<typeof useMealPlan>["set"];
  recipes: Recipe[];
  pending: PendingEntry | null;
  onAddPending: (day: string, slot: Slot) => void;
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
        const slotKey = `${day}-${s}`;
        const isPending = !!pending;
        const slotRecipes = recipes.filter(rc => SLOT_MEAL_TYPES[s]?.includes(rc.meal_type));

        return (
          <div
            key={s}
            className={cn(
              "min-h-[80px] rounded-lg border text-xs transition-all duration-150 relative",
              isFilled ? "border-secondary/40 bg-[#fef2f4]" : "border-border bg-white hover:border-secondary/40",
              isPending && !isFilled && "border-secondary border-dashed bg-secondary/5 cursor-pointer"
            )}
            onClick={() => isPending && !isFilled ? onAddPending(day, s) : undefined}
          >
            {confirmSlot === slotKey && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/95 p-2 text-center">
                <p className="text-[11px] text-foreground font-medium">Remove?</p>
                <div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setConfirmSlot(null); }} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">Cancel</button>
                  <button onClick={(e) => { e.stopPropagation(); onSet(day, s, null); setConfirmSlot(null); }} className="rounded-md bg-destructive px-2 py-1 text-[10px] font-medium text-destructive-foreground">Remove</button>
                </div>
              </div>
            )}

            {isPending && !isFilled ? (
              <div className="flex h-full min-h-[80px] items-center justify-center">
                <span className="text-secondary text-xs font-medium">+ Add here</span>
              </div>
            ) : isCustom && entry ? (
              <div className="flex h-full flex-col justify-between p-2 min-h-[80px]">
                <p className="line-clamp-3 font-serif text-sm leading-snug text-foreground">{entry.bowlName}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-secondary">Custom bowl</span>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmSlot(slotKey); }} className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : r ? (
              <div className="flex h-full flex-col justify-between p-2 min-h-[80px]">
                <Link to="/recipes/$slug" params={{ slug: r.slug }} className="line-clamp-3 font-serif text-sm leading-snug text-foreground hover:text-secondary transition-colors" onClick={(e) => e.stopPropagation()}>
                  {r.name}
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-secondary">{r.meal_type}</span>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmSlot(slotKey); }} className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <select
                className="h-full w-full min-h-[80px] cursor-pointer bg-transparent text-muted-foreground outline-none px-2 py-2 text-xs rounded-lg"
                value=""
                onChange={(e) => { if (e.target.value) onSet(day, s, { slug: e.target.value, servings: 2 }); }}
              >
                <option value="">+ add</option>
                {slotRecipes.map((rc) => (
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

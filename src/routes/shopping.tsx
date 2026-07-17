import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useRef } from "react";
import { Printer, ShoppingBasket, RotateCcw, Check, X, Trash2, Plus, ShoppingCart } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useMealPlan, useHaveList, useShoppingExtras, useManualItems, type ExtraItem, type Week } from "@/lib/user-state";
import { buildShoppingList, type ShoppingItem } from "@/lib/recipe-math";
import { cn } from "@/lib/utils";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Shopping list — The Collagen Kitchen" },
      { name: "description", content: "Your ingredients, grouped and ready to shop." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: ShoppingPage,
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="mx-auto max-w-6xl p-8 text-destructive">{error.message}</p>
    </AppShell>
  ),
});

const CATEGORY_LABEL: Record<string, string> = {
  produce: "Fruit & veg",
  protein: "Protein",
  dairy: "Dairy & chilled",
  grains: "Grains",
  cupboard: "Cupboard staples",
  pantry: "Cupboard staples",
  spices: "Cupboard staples",
  herbs: "Cupboard staples",
  fats: "Cupboard staples",
  nuts_seeds: "Cupboard staples",
  other: "Other",
};

const CATEGORY_ORDER = [
  "produce", "protein", "dairy", "grains",
  "cupboard", "pantry", "fats", "spices", "herbs", "nuts_seeds", "other",
];

const EXCLUDED_ITEMS = new Set([
  "water", "boiling water", "cold water", "warm water", "ice water",
  "salt and pepper", "salt & pepper", "black pepper", "white pepper",
]);

function isExcluded(item: string): boolean {
  const lower = item.toLowerCase().trim();
  return EXCLUDED_ITEMS.has(lower) || lower === "water";
}

const GRANOLA_INGREDIENTS = [
  { item: "rolled oats", category: "grains" },
  { item: "coconut oil", category: "fats" },
  { item: "honey", category: "cupboard" },
  { item: "vanilla extract", category: "cupboard" },
  { item: "cinnamon", category: "cupboard" },
  { item: "walnuts", category: "cupboard" },
  { item: "almonds", category: "cupboard" },
  { item: "pumpkin seeds", category: "cupboard" },
  { item: "ground flaxseed", category: "cupboard" },
  { item: "coconut flakes", category: "cupboard" },
];

function isGranola(item: string) {
  return item.toLowerCase().includes("granola");
}

type ViewMode = "week1" | "week2" | "bigshop";

function ShoppingPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("ck.activeWeek");
    return saved === "2" ? "week2" : "week1";
  });
  const [showBigShopConfirm, setShowBigShopConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const week1Plan = useMealPlan("1");
  const week2Plan = useMealPlan("2");
  const have1 = useHaveList("1");
  const have2 = useHaveList("2");
  const extras1 = useShoppingExtras("1");
  const extras2 = useShoppingExtras("2");
  const manual1 = useManualItems("1");
  const manual2 = useManualItems("2");

  const activeWeek: Week = viewMode === "week2" ? "2" : "1";
  const { isHad, toggle: toggleHave, reset } = viewMode === "week2" ? have2 : have1;
  const { extras, remove: removeExtra, clear: clearExtras } = viewMode === "week2" ? extras2 : extras1;
  const { items: manualItems, addItem, toggleItem, removeItem, clearAll: clearManual } = viewMode === "week2" ? manual2 : manual1;

  const [bought, setBought] = useState<Record<string, boolean>>({});
  const [boughtExtras, setBoughtExtras] = useState<Record<string, boolean>>({});
  const [hadExtras, setHadExtras] = useState<Record<string, boolean>>({});
  const [boughtBowls, setBoughtBowls] = useState<Record<string, boolean>>({});
  const [manualInput, setManualInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset bought state when switching weeks
  function switchView(mode: ViewMode) {
    setViewMode(mode);
    setBought({});
    setBoughtExtras({});
    setHadExtras({});
    setBoughtBowls({});
  }

  function buildEntries(plan: ReturnType<typeof useMealPlan>["plan"]) {
    return Object.values(plan)
      .filter((e): e is { slug: string; servings: number } => !!e && !("isCustomBowl" in e && (e as any).isCustomBowl))
      .map((e) => {
        const r = bySlug.get(e.slug);
        return r ? { recipe: r, servings: e.servings } : null;
      })
      .filter((x): x is { recipe: (typeof recipes)[number]; servings: number } => !!x);
  }

  function buildBowlEntries(plan: ReturnType<typeof useMealPlan>["plan"]) {
    const bowlMap = new Map<string, { bowlName: string; ingredients: { item: string; category: string }[] }>();
    for (const entry of Object.values(plan)) {
      if (!entry || !("isCustomBowl" in entry) || !entry.isCustomBowl) continue;
      const e = entry as any;
      const name = e.bowlName ?? "Custom Bowl";
      if (!bowlMap.has(name)) {
        bowlMap.set(name, { bowlName: name, ingredients: e.bowlIngredients ?? [] });
      }
    }
    return Array.from(bowlMap.values());
  }

  const entries1 = useMemo(() => buildEntries(week1Plan.plan), [week1Plan.plan, bySlug]);
  const entries2 = useMemo(() => buildEntries(week2Plan.plan), [week2Plan.plan, bySlug]);
  const bowls1 = useMemo(() => buildBowlEntries(week1Plan.plan), [week1Plan.plan]);
  const bowls2 = useMemo(() => buildBowlEntries(week2Plan.plan), [week2Plan.plan]);

  const activeEntries = viewMode === "week2" ? entries2 : viewMode === "bigshop" ? [...entries1, ...entries2] : entries1;
  const activeBowls = viewMode === "week2" ? bowls2 : viewMode === "bigshop" ? [...bowls1, ...bowls2] : bowls1;
  const activeExtras = viewMode === "bigshop" ? [...extras1.extras, ...extras2.extras] : extras;

  const fullList = useMemo(() => buildShoppingList(activeEntries), [activeEntries]);

  const filteredList = useMemo(() =>
    fullList.filter(i => !isExcluded(i.item)),
    [fullList]
  );

  const active = viewMode === "bigshop" ? filteredList : filteredList.filter((i) => !isHad(i.key));
  const had = viewMode === "bigshop" ? [] : filteredList.filter((i) => isHad(i.key));

  const filteredExtras = useMemo(() =>
    activeExtras.filter(e => !isExcluded(e.item) && (viewMode === "bigshop" || !hadExtras[e.item])),
    [activeExtras, hadExtras, viewMode]
  );

  const hadExtrasItems = useMemo(() =>
    viewMode === "bigshop" ? [] : extras.filter(e => hadExtras[e.item]),
    [extras, hadExtras, viewMode]
  );

  const grouped = useMemo(() => {
    const g: Record<string, ShoppingItem[]> = {};
    for (const item of active) {
      const rawCat = item.category || "other";
      const mergedCat = ["pantry", "spices", "herbs", "fats", "nuts_seeds"].includes(rawCat)
        ? "cupboard" : rawCat;
      (g[mergedCat] ??= []).push(item);
    }
    const seen = new Set<string>();
    return CATEGORY_ORDER.filter((c) => {
      const mc = ["pantry", "spices", "herbs", "fats", "nuts_seeds"].includes(c) ? "cupboard" : c;
      if (seen.has(mc)) return false;
      seen.add(mc);
      return !!g[mc];
    }).map((c) => {
      const mc = ["pantry", "spices", "herbs", "fats", "nuts_seeds"].includes(c) ? "cupboard" : c;
      return [mc, g[mc]] as const;
    });
  }, [active]);

  const extrasByCategory = useMemo(() => {
    const g: Record<string, ExtraItem[]> = {};
    for (const e of filteredExtras) (g[e.category] ??= []).push(e);
    return g;
  }, [filteredExtras]);

  const week1HasContent = entries1.length > 0 || bowls1.length > 0 || extras1.extras.length > 0 || manual1.items.length > 0;
  const week2HasContent = entries2.length > 0 || bowls2.length > 0 || extras2.extras.length > 0 || manual2.items.length > 0;
  const bothWeeksHaveContent = week1HasContent && week2HasContent;

  const hasContent = viewMode === "bigshop"
    ? bothWeeksHaveContent
    : viewMode === "week2"
    ? week2HasContent
    : week1HasContent;

  function clearAll() {
    clearExtras();
    reset();
    clearManual();
    setBought({});
    setBoughtExtras({});
    setHadExtras({});
    setBoughtBowls({});
    setShowClearConfirm(false);
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    addItem(manualInput);
    setManualInput("");
    inputRef.current?.focus();
  }

  const weekLabel = viewMode === "week1" ? "Week 1" : viewMode === "week2" ? "Week 2" : "The Big Shop";

  return (
    <AppShell>
      {/* Big Shop confirm */}
      {showBigShopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowBigShopConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">The Big Shop 🛒</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This combines both weeks into one list — brilliant if you're doing one big shop for the fortnight. Ingredients are deduplicated so you won't see duplicates. Check quantities before you go though — some things might need doubling up.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBigShopConfirm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={() => { switchView("bigshop"); setShowBigShopConfirm(false); }} className="flex-1 rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90">Let's do it</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm clear */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">Clear {weekLabel}?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {viewMode === "week1"
                ? "This will remove your Week 1 bowl extras, manual items and reset your I have list. Your Week 2 list is safe."
                : "This will remove your Week 2 bowl extras, manual items and reset your I have list. Your Week 1 list is safe."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={clearAll} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Yes, clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">Reset "I have"?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will bring back all items you've marked as already in your cupboard.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={() => { reset(); setHadExtras({}); setShowResetConfirm(false); }} className="flex-1 rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90">Yes, reset</button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="font-serif text-3xl">Shopping list</h1>
          </div>
          {hasContent && viewMode !== "bigshop" && (
            <div className="flex items-center gap-2">
              {(had.length > 0 || hadExtrasItems.length > 0) && (
                <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(true)}>
                  <RotateCcw className="h-4 w-4" /> Reset "I have"
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          )}
          {viewMode === "bigshop" && (
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          )}
        </div>

        {/* Week toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => switchView("week1")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              viewMode === "week1"
                ? "bg-secondary text-secondary-foreground"
                : "border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
            )}
          >
            Week 1
          </button>
          <button
            onClick={() => switchView("week2")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              viewMode === "week2"
                ? "bg-secondary text-secondary-foreground"
                : "border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
            )}
          >
            Week 2
          </button>
          {bothWeeksHaveContent && (
            <button
              onClick={() => viewMode !== "bigshop" ? setShowBigShopConfirm(true) : switchView("week1")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all inline-flex items-center gap-1.5",
                viewMode === "bigshop"
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              )}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {viewMode === "bigshop" ? "The Big Shop ✓" : "The Big Shop"}
            </button>
          )}
          {viewMode === "bigshop" && (
            <p className="text-xs text-muted-foreground w-full mt-1">
              Both weeks combined into one list. Ingredients are deduplicated — check quantities before you shop.
            </p>
          )}
        </div>

        {!hasContent ? (
          <div className="mt-8 rounded-2xl border bg-card p-12 text-center">
            <ShoppingBasket className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg">
              {viewMode === "week2" ? "Week 2 is empty" : "Your list is empty"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewMode === "week2"
                ? "Head to the planner, switch to Week 2 and start building your next week."
                : "Add recipes to your planner or build a bowl to get started."}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/planner" className="text-sm text-secondary underline underline-offset-2">Go to planner</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/build/glow-bowl" className="text-sm text-secondary underline underline-offset-2">Build a Glow Bowl</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Recipe items */}
            {grouped.map(([cat, items]) => (
              <div key={cat} className="rounded-2xl border bg-card p-5">
                <h2 className="font-serif text-lg mb-3">{CATEGORY_LABEL[cat] ?? cat}</h2>
                <ul className="divide-y divide-border/60">
                  {items.map((item) => (
                    <ShoppingRow
                      key={item.key}
                      item={item}
                      checked={!!bought[item.key]}
                      onCheck={() => setBought((b) => ({ ...b, [item.key]: !b[item.key] }))}
                      onHave={viewMode === "bigshop" ? undefined : () => toggleHave(item.key)}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {/* Custom bowls */}
            {activeBowls.map((bowl) => {
              const filteredIngredients = bowl.ingredients.filter(i => !isExcluded(i.item));
              if (filteredIngredients.length === 0) return null;
              return (
                <div key={bowl.bowlName} className="rounded-2xl border border-secondary/30 bg-card p-5">
                  <h2 className="font-serif text-lg mb-1">{bowl.bowlName}</h2>
                  <p className="text-xs text-muted-foreground mb-3">From your meal plan</p>
                  <ul className="divide-y divide-border/60">
                    {filteredIngredients.map((ing) => (
                      <li key={ing.item} className="flex items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-secondary"
                          checked={!!boughtBowls[`${bowl.bowlName}|${ing.item}`]}
                          onChange={() => setBoughtBowls(b => ({ ...b, [`${bowl.bowlName}|${ing.item}`]: !b[`${bowl.bowlName}|${ing.item}`] }))}
                        />
                        <span className={cn("flex-1 text-sm capitalize", boughtBowls[`${bowl.bowlName}|${ing.item}`] && "text-muted-foreground line-through")}>
                          {ing.item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Bowl extras */}
            {filteredExtras.length > 0 && (
              <div className="rounded-2xl border border-secondary/30 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif text-lg">Bowl extras</h2>
                  {viewMode !== "bigshop" && (
                    <button onClick={clearExtras} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
                  )}
                </div>
                {Object.entries(extrasByCategory).map(([cat, items]) => (
                  <div key={cat} className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </p>
                    <ul className="divide-y divide-border/60">
                      {items.map((e) => (
                        <li key={e.item}>
                          {isGranola(e.item) ? (
                            <GranolaRow
                              checked={!!boughtExtras[e.item]}
                              onCheck={() => setBoughtExtras(b => ({ ...b, [e.item]: !b[e.item] }))}
                              onHave={viewMode === "bigshop" ? undefined : () => setHadExtras(h => ({ ...h, [e.item]: true }))}
                              onRemove={viewMode === "bigshop" ? undefined : () => removeExtra(e.item)}
                            />
                          ) : (
                            <li className="flex items-center gap-3 py-2.5">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-secondary"
                                checked={!!boughtExtras[e.item]}
                                onChange={() => setBoughtExtras(b => ({ ...b, [e.item]: !b[e.item] }))}
                              />
                              <span className={cn("flex-1 text-sm", boughtExtras[e.item] && "text-muted-foreground line-through")}>
                                {e.item}
                              </span>
                              {viewMode !== "bigshop" && (
                                <>
                                  <button
                                    onClick={() => setHadExtras(h => ({ ...h, [e.item]: true }))}
                                    className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
                                  >
                                    <Check className="h-3 w-3" /> I have
                                  </button>
                                  <button onClick={() => removeExtra(e.item)} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Remove">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </li>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Already in cupboard */}
            {(had.length > 0 || hadExtrasItems.length > 0) && viewMode !== "bigshop" && (
              <details className="rounded-2xl border bg-muted/30 p-5">
                <summary className="cursor-pointer font-serif text-base">
                  Already in my cupboard ({had.length + hadExtrasItems.length})
                </summary>
                <ul className="mt-3 divide-y divide-border/40">
                  {had.map((item) => (
                    <li key={item.key} className="flex items-center justify-between py-2 text-sm text-muted-foreground">
                      <span>
                        {item.qtyText && <strong className="text-foreground/70">{item.qtyText} </strong>}
                        {item.unit && !item.staple && <span>{item.unit} </span>}
                        {item.item}
                      </span>
                      <button onClick={() => toggleHave(item.key)} className="text-xs text-secondary hover:underline">
                        Bring back
                      </button>
                    </li>
                  ))}
                  {hadExtrasItems.map((e) => (
                    <li key={e.item} className="flex items-center justify-between py-2 text-sm text-muted-foreground">
                      <span>{e.item}</span>
                      <button onClick={() => setHadExtras(h => { const n = { ...h }; delete n[e.item]; return n; })} className="text-xs text-secondary hover:underline">
                        Bring back
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Manual add — not in Big Shop mode */}
            {viewMode !== "bigshop" && (
              <div className="rounded-2xl border bg-card p-5">
                <h2 className="font-serif text-lg mb-4">Add anything else</h2>
                <form onSubmit={handleAddManual} className="flex gap-2 mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. coffee, washing up liquid, milk…"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-secondary"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-40 hover:bg-secondary/90"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </form>
                {manualItems.length > 0 ? (
                  <ul className="divide-y divide-border/60">
                    {manualItems.map((item) => (
                      <li key={item.addedAt} className="flex items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-secondary"
                          checked={item.checked}
                          onChange={() => toggleItem(item.addedAt)}
                        />
                        <span className={cn("flex-1 text-sm", item.checked && "text-muted-foreground line-through")}>
                          {item.text}
                        </span>
                        <button onClick={() => removeItem(item.addedAt)} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add coffee, toiletries or anything else you need this week.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function GranolaRow({ checked, onCheck, onHave, onRemove }: {
  checked: boolean;
  onCheck: () => void;
  onHave?: () => void;
  onRemove?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <input type="checkbox" className="h-4 w-4 accent-secondary" checked={checked} onChange={onCheck} />
        <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>
          Homemade granola
        </span>
        <button onClick={() => setExpanded(v => !v)} className="text-[11px] text-secondary underline underline-offset-2 shrink-0">
          {expanded ? "Hide" : "Ingredients"}
        </button>
        {onHave && (
          <button onClick={onHave} className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
            <Check className="h-3 w-3" /> I have
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {expanded && (
        <div className="mt-2 ml-7 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-secondary mb-2">Ingredients to make granola</p>
          <ul className="space-y-1">
            {GRANOLA_INGREDIENTS.map((ing) => (
              <li key={ing.item} className="text-sm text-muted-foreground">· {ing.item}</li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground border-t border-border/60 pt-2">
            Most shop-bought granola contains more sugar per 100g than a chocolate digestive. This homemade version has none of that.
          </p>
        </div>
      )}
    </li>
  );
}

function ShoppingRow({ item, checked, onCheck, onHave }: {
  item: ShoppingItem;
  checked: boolean;
  onCheck: () => void;
  onHave?: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-secondary" checked={checked} onChange={onCheck} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", checked && "text-muted-foreground line-through")}>
          {item.qtyText && <strong>{item.qtyText} </strong>}
          {item.unit && !item.staple && <span className="text-muted-foreground">{item.unit} </span>}
          {item.item}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.fromRecipes.join(", ")}
        </p>
      </div>
      {onHave && (
        <button
          onClick={onHave}
          className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
        >
          <Check className="h-3 w-3" /> I have
        </button>
      )}
    </li>
  );
}

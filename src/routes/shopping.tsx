import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useRef } from "react";
import { Printer, ShoppingBasket, RotateCcw, Check, X, Trash2, Plus } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useMealPlan, useHaveList, useShoppingExtras, useManualItems, type ExtraItem } from "@/lib/user-state";
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

// Items that should never appear on a shopping list
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

function ShoppingPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const { plan } = useMealPlan();
  const { isHad, toggle: toggleHave, reset } = useHaveList();
  const { extras, remove: removeExtra, clear: clearExtras } = useShoppingExtras();
  const { items: manualItems, addItem, toggleItem, removeItem, clearAll: clearManual } = useManualItems();
  const [bought, setBought] = useState<Record<string, boolean>>({});
  const [boughtExtras, setBoughtExtras] = useState<Record<string, boolean>>({});
  const [hadExtras, setHadExtras] = useState<Record<string, boolean>>({});
  const [manualInput, setManualInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => {
    return Object.values(plan)
      .filter((e): e is { slug: string; servings: number } => !!e && !("isCustomBowl" in e && (e as any).isCustomBowl))
      .map((e) => {
        const r = bySlug.get(e.slug);
        return r ? { recipe: r, servings: e.servings } : null;
      })
      .filter((x): x is { recipe: (typeof recipes)[number]; servings: number } => !!x);
  }, [plan, bySlug, recipes]);

  const fullList = useMemo(() => buildShoppingList(entries), [entries]);

  // Filter out water and other excluded items
  const filteredList = useMemo(() =>
    fullList.filter(i => !isExcluded(i.item)),
    [fullList]
  );

  const active = filteredList.filter((i) => !isHad(i.key));
  const had = filteredList.filter((i) => isHad(i.key));

  // Filter extras too
  const filteredExtras = useMemo(() =>
    extras.filter(e => !isExcluded(e.item) && !hadExtras[e.item]),
    [extras, hadExtras]
  );

  const hadExtrasItems = useMemo(() =>
    extras.filter(e => hadExtras[e.item]),
    [extras, hadExtras]
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

  const hasContent = entries.length > 0 || extras.length > 0 || manualItems.length > 0;

  function clearAll() {
    clearExtras();
    reset();
    clearManual();
    setBought({});
    setBoughtExtras({});
    setHadExtras({});
    setShowClearConfirm(false);
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    addItem(manualInput);
    setManualInput("");
    inputRef.current?.focus();
  }

  return (
    <AppShell>
      {/* Confirm clear */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="font-serif text-xl mb-2">Clear your shopping list?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will remove bowl extras, anything you've added manually and reset your "I have" list. Ingredients from your meal plan stay until you clear your planner.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={clearAll} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Yes, clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm reset I have */}
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Shopping list</h1>
          </div>
          {hasContent && (
            <div className="flex items-center gap-2">
              {(had.length > 0 || hadExtrasItems.length > 0) && (
                <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(true)}>
                  <RotateCcw className="h-4 w-4" /> Reset "I have"
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Clear list
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
            Ingredients from your meal plan clear automatically when you remove recipes from your planner.
          </p>
        )}

        {!hasContent ? (
          <div className="mt-12 rounded-2xl border bg-card p-12 text-center">
            <ShoppingBasket className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg">Your list is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add recipes to your planner or build a bowl to get started.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/planner" className="text-sm text-secondary underline underline-offset-2">Plan your week</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/build/glow-bowl" className="text-sm text-secondary underline underline-offset-2">Build a Glow Bowl</Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">

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
                      onHave={() => toggleHave(item.key)}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {/* Bowl extras */}
            {(filteredExtras.length > 0 || hadExtrasItems.length > 0) && (
              <div className="rounded-2xl border border-secondary/30 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif text-lg">Bowl extras</h2>
                  <button onClick={clearExtras} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
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
                              onHave={() => setHadExtras(h => ({ ...h, [e.item]: true }))}
                              onRemove={() => removeExtra(e.item)}
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
                              <button
                                onClick={() => setHadExtras(h => ({ ...h, [e.item]: true }))}
                                className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
                              >
                                <Check className="h-3 w-3" /> I have
                              </button>
                              <button onClick={() => removeExtra(e.item)} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Remove">
                                <X className="h-3.5 w-3.5" />
                              </button>
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
            {(had.length > 0 || hadExtrasItems.length > 0) && (
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

            {/* Manual add */}
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
          </div>
        )}
      </section>
    </AppShell>
  );
}

function GranolaRow({ checked, onCheck, onHave, onRemove }: {
  checked: boolean;
  onCheck: () => void;
  onHave: () => void;
  onRemove: () => void;
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
        <button onClick={onHave} className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
          <Check className="h-3 w-3" /> I have
        </button>
        <button onClick={onRemove} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
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
  onHave: () => void;
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
      <button
        onClick={onHave}
        className="no-print inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
      >
        <Check className="h-3 w-3" /> I have
      </button>
    </li>
  );
}

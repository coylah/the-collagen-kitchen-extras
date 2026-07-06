import { useState } from "react";
import { Check, ShoppingBasket } from "lucide-react";
import { useShoppingExtras } from "@/lib/user-state";
import { cn } from "@/lib/utils";

type Addition = {
  label: string;
  note: string;
  category: string;
};

const ADDITIONS: Addition[] = [
  { label: "Mushrooms", note: "Rich in copper — one of the best plant sources for collagen cross-linking", category: "produce" },
  { label: "Leftover roast chicken", note: "Glycine and proline directly — the amino acids collagen is built from", category: "protein" },
  { label: "Wilted spinach", note: "Vitamin A and manganese — supports skin cell turnover and collagen cofactors", category: "produce" },
  { label: "Cherry tomatoes", note: "Lycopene and vitamin C — protects and activates collagen synthesis", category: "produce" },
  { label: "Red pepper", note: "Highest vitamin C of any vegetable — activates collagen synthesis directly", category: "produce" },
  { label: "Feta", note: "Calcium and protein — a classic pairing that also adds healthy fats", category: "dairy" },
  { label: "Smoked salmon", note: "Omega-3 and complete protein — brilliant for your skin barrier", category: "protein" },
  { label: "Avocado slices", note: "Vitamin E and healthy fats — protects collagen from oxidative damage", category: "produce" },
  { label: "Sun dried tomatoes", note: "Concentrated lycopene — protects skin from UV-related collagen breakdown", category: "cupboard" },
  { label: "Red onion", note: "Quercetin — a powerful antioxidant that helps protect existing collagen", category: "produce" },
  { label: "Cottage cheese", note: "High protein, mild flavour — adds creaminess and a serious protein boost", category: "dairy" },
  { label: "Tenderstem broccoli", note: "Vitamin C and vitamin K — activates collagen synthesis and supports bone health", category: "produce" },
];

export function OmeletteAdditions() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);
  const { add } = useShoppingExtras();

  function toggle(label: string) {
    setAdded(false);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function addToShopping() {
    const items = ADDITIONS
      .filter(a => selected.has(a.label))
      .map(a => ({ item: a.label, category: a.category }));
    if (items.length === 0) return;
    add(items);
    setAdded(true);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-8 py-6 sm:px-12">
        <p className="text-[9px] uppercase tracking-[0.22em] text-secondary font-medium mb-2">Build your filling</p>
        <h2 className="font-serif text-2xl font-light">Choose your additions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any additions you want — each one is mapped to the collagen matrix. Always finish with the chia and flaxseed scatter.
        </p>
      </div>

      <div className="px-8 py-6 sm:px-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {ADDITIONS.map((a) => {
            const active = selected.has(a.label);
            return (
              <button
                key={a.label}
                onClick={() => toggle(a.label)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary/40 hover:bg-muted/30"
                )}
              >
                <span className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition-colors",
                  active
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border text-muted-foreground"
                )}>
                  {active && <Check className="h-3 w-3" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{a.note}</p>
                </div>
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={addToShopping}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              <ShoppingBasket className="h-4 w-4" />
              {added ? "Added to your shopping list!" : `Add ${selected.size} addition${selected.size === 1 ? "" : "s"} to shopping list`}
            </button>
            {added && (
              <p className="text-center text-xs text-muted-foreground">
                Check your shopping list — your additions are in there.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

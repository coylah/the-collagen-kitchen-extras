import { useState } from "react";
import { Check, ShoppingBasket } from "lucide-react";
import { useShoppingExtras } from "@/lib/user-state";
import { cn } from "@/lib/utils";

type Addition = {
  label: string;
  phase: "BUILD" | "ACTIVATE" | "SUPPORT" | "PROTECT";
  note: string;
  category: string;
};

const ADDITIONS: Addition[] = [
  // BUILD
  { label: "Shredded roast chicken", phase: "BUILD", note: "Glycine and proline directly — the amino acids collagen is built from", category: "protein" },
  { label: "Smoked salmon", phase: "BUILD", note: "Complete protein and omega-3 — brilliant for both Build and Protect", category: "protein" },
  { label: "Mackerel flakes", phase: "BUILD", note: "One of the richest omega-3 sources going, plus complete protein", category: "protein" },
  { label: "Prawns", phase: "BUILD", note: "High protein, selenium for antioxidant defence", category: "protein" },
  { label: "Cottage cheese", phase: "BUILD", note: "High protein, mild flavour — adds creaminess and a serious protein boost", category: "dairy" },
  { label: "Cooked turkey mince", phase: "BUILD", note: "Lean, high in glycine — one of the best collagen amino acid sources", category: "protein" },
  // ACTIVATE
  { label: "Cherry tomatoes", phase: "ACTIVATE", note: "Vitamin C and lycopene — activates synthesis and protects against UV breakdown", category: "produce" },
  { label: "Red pepper", phase: "ACTIVATE", note: "Highest vitamin C of any vegetable — activates collagen synthesis directly", category: "produce" },
  { label: "Spinach", phase: "ACTIVATE", note: "Vitamin A, vitamin C and iron — three separate collagen cofactors in one handful", category: "produce" },
  { label: "Watercress", phase: "ACTIVATE", note: "Rich in vitamin C and vitamin A — one of the most underrated collagen vegetables", category: "produce" },
  { label: "Fresh herbs", phase: "ACTIVATE", note: "Parsley is surprisingly high in vitamin C — scatter generously", category: "produce" },
  // SUPPORT
  { label: "Mushrooms", phase: "SUPPORT", note: "Rich in copper — one of the best everyday sources for collagen cross-linking", category: "produce" },
  { label: "Pumpkin seeds", phase: "SUPPORT", note: "Zinc and copper in one scatter — the most useful thing you can add to any meal", category: "cupboard" },
  { label: "Sesame seeds", phase: "SUPPORT", note: "Copper, zinc and calcium — small but doing serious work", category: "cupboard" },
  // PROTECT
  { label: "Avocado slices", phase: "PROTECT", note: "Vitamin E and healthy fats — protects collagen from oxidative damage", category: "produce" },
  { label: "Sun dried tomatoes", phase: "PROTECT", note: "Concentrated lycopene — protects skin from UV-related collagen breakdown", category: "cupboard" },
  { label: "Feta", phase: "PROTECT", note: "Calcium and protein — a classic pairing that also adds healthy fats", category: "dairy" },
  { label: "Roasted red pepper", phase: "PROTECT", note: "Lycopene and vitamin C — protects and activates in one ingredient", category: "produce" },
  { label: "Olives", phase: "PROTECT", note: "Healthy fats and vitamin E — protect the collagen you've already built", category: "cupboard" },
  { label: "Kimchi", phase: "PROTECT", note: "Fermented and anti-inflammatory — gut health is directly linked to skin health", category: "cupboard" },
];

const PHASE_COLOURS = {
  BUILD: "bg-rose-50 border-rose-200 text-rose-700",
  ACTIVATE: "bg-orange-50 border-orange-200 text-orange-700",
  SUPPORT: "bg-amber-50 border-amber-200 text-amber-700",
  PROTECT: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const PHASES = ["BUILD", "ACTIVATE", "SUPPORT", "PROTECT"] as const;

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
          Pick 2-3 fillings across the phases. Each one is mapped to the collagen matrix — tap to select, then add to your shopping list.
        </p>
      </div>

      <div className="px-8 py-6 sm:px-12 space-y-6">
        {PHASES.map(phase => {
          const phaseAdditions = ADDITIONS.filter(a => a.phase === phase);
          return (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PHASE_COLOURS[phase]}`}>
                  {phase}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {phaseAdditions.map((a) => {
                  const active = selected.has(a.label);
                  return (
                    <button
                      key={a.label}
                      onClick={() => toggle(a.label)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        active
                          ? "border-secondary bg-secondary/5"
                          : "border-border hover:border-secondary/40 hover:bg-muted/30"
                      )}
                    >
                      <span className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
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
            </div>
          );
        })}

        {selected.size > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={addToShopping}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              <ShoppingBasket className="h-4 w-4" />
              {added ? "Added to your shopping list!" : `Add ${selected.size} filling${selected.size === 1 ? "" : "s"} to shopping list`}
            </button>
            {added && (
              <p className="text-center text-xs text-muted-foreground">
                Your fillings are in the shopping list under Bowl extras.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

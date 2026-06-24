import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Check, Salad, ShoppingBasket, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useShoppingExtras } from "@/lib/user-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/build/glow-bowl")({
  head: () => ({
    meta: [
      { title: "Build Your Own Glow Bowl — The Collagen Kitchen" },
      {
        name: "description",
        content: "Mix and match a collagen-supporting lunch bowl in six steps.",
      },
    ],
  }),
  component: GlowBowlBuilder,
});

type Step = {
  key: string;
  title: string;
  subtitle: string;
  intro: string;
  category: string;
  colour: string;
  options: { label: string; ingredients?: string }[];
};

const STEPS: Step[] = [
  {
    key: "base",
    title: "1 · Base",
    subtitle: "The foundation",
    intro: "Pick one or two.",
    category: "grains",
    colour: "bg-amber-50 border-amber-100",
    options: [
      { label: "Brown rice" },
      { label: "Quinoa" },
      { label: "Couscous" },
      { label: "Giant couscous" },
      { label: "Pearl barley" },
      { label: "Sweet potato cubes" },
      { label: "Baby potatoes" },
      { label: "Sourdough croutons" },
      { label: "Mixed leaves" },
      { label: "Spinach" },
      { label: "Kale" },
      { label: "Rocket" },
      { label: "Lentils" },
      { label: "Chickpeas" },
      { label: "Butter beans" },
    ],
  },
  {
    key: "protein",
    title: "2 · Protein",
    subtitle: "The collagen builder",
    intro: "Pick one.",
    category: "protein",
    colour: "bg-rose-50 border-rose-100",
    options: [
      { label: "Grilled chicken" },
      { label: "Roast chicken thighs" },
      { label: "Turkey mince" },
      { label: "Turkey meatballs" },
      { label: "Tuna" },
      { label: "Salmon" },
      { label: "Mackerel" },
      { label: "Prawns" },
      { label: "Boiled eggs" },
      { label: "Beef strips" },
      { label: "Leftover slow-cooked beef" },
      { label: "Pork slices" },
      { label: "Halloumi" },
      { label: "Cottage cheese" },
    ],
  },
  {
    key: "colour",
    title: "3 · Colour",
    subtitle: "Vitamin C & antioxidants",
    intro: "Pick two or three — the more colour the better.",
    category: "produce",
    colour: "bg-emerald-50 border-emerald-100",
    options: [
      { label: "Red pepper" },
      { label: "Yellow pepper" },
      { label: "Cherry tomatoes" },
      { label: "Cucumber" },
      { label: "Red onion" },
      { label: "Carrot ribbons" },
      { label: "Roasted butternut squash" },
      { label: "Roasted sweet potato" },
      { label: "Broccoli" },
      { label: "Tenderstem broccoli" },
      { label: "Spinach" },
      { label: "Kale" },
      { label: "Rocket" },
      { label: "Beetroot" },
      { label: "Mango" },
      { label: "Strawberries" },
      { label: "Kiwi" },
      { label: "Orange segments" },
      { label: "Pomegranate seeds" },
      { label: "Fresh herbs" },
    ],
  },
  {
    key: "fats",
    title: "4 · Healthy fats",
    subtitle: "Skin barrier support",
    intro: "Pick one.",
    category: "fats",
    colour: "bg-green-50 border-green-100",
    options: [
      { label: "Avocado" },
      { label: "Olive oil" },
      { label: "Olives" },
      { label: "Feta" },
      { label: "Nuts" },
      { label: "Seeds" },
    ],
  },
  {
    key: "crunch",
    title: "5 · Crunch",
    subtitle: "Minerals & texture",
    intro: "Pick one.",
    category: "cupboard",
    colour: "bg-orange-50 border-orange-100",
    options: [
      { label: "Pumpkin seeds" },
      { label: "Sunflower seeds" },
      { label: "Sesame seeds" },
      { label: "Chia seeds" },
      { label: "Flaxseed" },
      { label: "Crushed almonds" },
      { label: "Cashews" },
      { label: "Walnuts" },
      { label: "Toasted chickpeas" },
      { label: "Sourdough croutons" },
      { label: "Crispy chicken skin" },
    ],
  },
  {
    key: "dressing",
    title: "6 · Dressing",
    subtitle: "The finishing touch",
    intro: "Pick one — just mix all the ingredients together.",
    category: "cupboard",
    colour: "bg-purple-50 border-purple-100",
    options: [
      {
        label: "Lemon Yogurt",
        ingredients: "Greek yogurt, lemon juice, garlic, salt, pepper, parsley",
      },
      {
        label: "Honey Mustard",
        ingredients: "Olive oil, apple cider vinegar, Dijon mustard, honey, salt, pepper",
      },
      {
        label: "Tahini Lemon",
        ingredients: "Tahini, lemon juice, garlic, water, salt, pepper",
      },
      {
        label: "Satay Style",
        ingredients: "Peanut butter, lime juice, soy sauce or tamari, ginger, water",
      },
      {
        label: "Balsamic Glow",
        ingredients: "Olive oil, balsamic vinegar, Dijon mustard, salt, pepper",
      },
      {
        label: "Apple Cider Vinegar Glow",
        ingredients: "Olive oil, apple cider vinegar, lemon juice, garlic, salt, pepper",
      },
    ],
  },
];

type Preset = { name: string; pick: Partial<Record<string, string[]>> };

const PRESETS: Preset[] = [
  { name: "Chicken Sweet Potato Glow", pick: { base: ["Sweet potato cubes"], protein: ["Grilled chicken"], colour: ["Spinach", "Red pepper"], fats: ["Avocado"], crunch: ["Pumpkin seeds"], dressing: ["Lemon Yogurt"] } },
  { name: "Tuna Crunch Glow", pick: { base: ["Mixed leaves"], protein: ["Tuna"], colour: ["Cucumber", "Cherry tomatoes", "Red onion"], fats: ["Olive oil"], crunch: ["Sunflower seeds"], dressing: ["Apple Cider Vinegar Glow"] } },
  { name: "Salmon Skin Glow", pick: { base: ["Brown rice"], protein: ["Salmon"], colour: ["Broccoli", "Cucumber"], fats: ["Avocado"], crunch: ["Sesame seeds"], dressing: ["Tahini Lemon"] } },
  { name: "Turkey Taco Glow", pick: { base: ["Brown rice"], protein: ["Turkey mince"], colour: ["Red pepper", "Cherry tomatoes"], fats: ["Avocado"], crunch: ["Pumpkin seeds"], dressing: ["Lemon Yogurt"] } },
  { name: "Prawn Mango Glow", pick: { base: ["Quinoa"], protein: ["Prawns"], colour: ["Mango", "Cucumber", "Red pepper"], fats: ["Avocado"], crunch: ["Sesame seeds"], dressing: ["Apple Cider Vinegar Glow"] } },
  { name: "Chicken Caesar-ish", pick: { base: ["Mixed leaves"], protein: ["Grilled chicken"], colour: ["Cucumber"], fats: ["Olive oil"], crunch: ["Sourdough croutons"], dressing: ["Lemon Yogurt"] } },
  { name: "Mackerel Beetroot Glow", pick: { base: ["Lentils"], protein: ["Mackerel"], colour: ["Beetroot", "Rocket", "Cucumber"], fats: ["Olive oil"], crunch: ["Walnuts"], dressing: ["Balsamic Glow"] } },
  { name: "Halloumi Chickpea Glow", pick: { base: ["Chickpeas"], protein: ["Halloumi"], colour: ["Spinach", "Cherry tomatoes"], fats: ["Olive oil"], crunch: ["Pumpkin seeds"], dressing: ["Tahini Lemon"] } },
  { name: "Beef Protein Glow", pick: { base: ["Brown rice"], protein: ["Beef strips"], colour: ["Broccoli", "Red pepper"], fats: ["Olive oil"], crunch: ["Sesame seeds"], dressing: ["Satay Style"] } },
  { name: "Egg & Avocado Lunch", pick: { base: ["Mixed leaves"], protein: ["Boiled eggs"], colour: ["Cherry tomatoes", "Cucumber"], fats: ["Avocado"], crunch: ["Pumpkin seeds"], dressing: ["Honey Mustard"] } },
];

type Picks = Record<string, string[]>;

function GlowBowlBuilder() {
  const [picks, setPicks] = useState<Picks>({});
  const [added, setAdded] = useState(false);
  const { add } = useShoppingExtras();

  useEffect(() => { setAdded(false); }, []);

  function togglePick(stepKey: string, optionLabel: string) {
    setAdded(false);
    setPicks((prev) => {
      const cur = prev[stepKey] ?? [];
      if (cur.includes(optionLabel)) return { ...prev, [stepKey]: cur.filter((o) => o !== optionLabel) };
      return { ...prev, [stepKey]: [...cur, optionLabel] };
    });
  }

  function applyPreset(p: Preset) {
    setAdded(false);
    setPicks(p.pick as Picks);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() { setPicks({}); setAdded(false); }

  const allPicked = useMemo(() => {
    const out: { item: string; category: string }[] = [];
    for (const step of STEPS) {
      for (const label of picks[step.key] ?? []) {
        const opt = step.options.find((o) => o.label === label);
        if (opt?.ingredients) {
          out.push({ item: `${opt.label} dressing ingredients`, category: step.category });
        } else {
          out.push({ item: label, category: step.category });
        }
      }
    }
    return out;
  }, [picks]);

  function addToShopping() {
    if (allPicked.length === 0) return;
    add(allPicked);
    setAdded(true);
  }

  const totalPicked = Object.values(picks).flat().length;
  const stepsComplete = STEPS.filter(s => (picks[s.key]?.length ?? 0) > 0).length;

  function getDressingIngredients(label: string): string | undefined {
    const step = STEPS.find((s) => s.key === "dressing");
    return step?.options.find((o) => o.label === label)?.ingredients;
  }

  return (
    <AppShell>
      {/* Hero */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <p className="font-script text-xl text-secondary mb-1">Build your lunch</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-light leading-tight mb-4">
            Glow Bowl Builder
          </h1>
          <p className="max-w-2xl text-base text-background/70 leading-relaxed">
            Six steps to a collagen-supporting lunch built from whatever's in your fridge. Pick your ingredients, add them to your shopping list, and you're done. Ten ready-made combinations below if you want a head start.
          </p>
          {stepsComplete > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-1">
                {STEPS.map((s, i) => (
                  <div
                    key={s.key}
                    className={`h-1.5 w-6 rounded-full transition-all ${(picks[s.key]?.length ?? 0) > 0 ? "bg-secondary" : "bg-background/20"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-background/50">{stepsComplete} of 6 steps done</span>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">

          {/* Presets */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl mb-1">Start from a preset</h2>
            <p className="text-sm text-muted-foreground mb-4">Tap to pre-fill your bowl, then tweak to your taste.</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm transition-all hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          {/* Steps */}
          {STEPS.map((step) => {
            const sel = picks[step.key] ?? [];
            const isDone = sel.length > 0;
            return (
              <section
                key={step.key}
                className={`rounded-2xl border p-6 transition-all ${isDone ? step.colour : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className="font-serif text-xl">{step.title}</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{step.subtitle}</p>
                  </div>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground">
                      <Check className="h-3 w-3" /> {sel.length} selected
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{step.intro}</p>
                <div className="flex flex-wrap gap-2">
                  {step.options.map((opt) => {
                    const active = sel.includes(opt.label);
                    return (
                      <div key={opt.label} className="flex flex-col gap-0.5">
                        <button
                          onClick={() => togglePick(step.key, opt.label)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-sm transition-all",
                            active
                              ? "border-secondary bg-secondary text-secondary-foreground font-medium shadow-sm"
                              : "border-border bg-background text-foreground/70 hover:border-secondary/50 hover:bg-secondary/5",
                          )}
                        >
                          {active && <Check className="mr-1 inline h-3 w-3" />}
                          {opt.label}
                        </button>
                        {opt.ingredients && active && (
                          <p className="px-3.5 text-[11px] text-muted-foreground">{opt.ingredients}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary/10">
                <Salad className="h-4 w-4 text-secondary" />
              </span>
              <div>
                <p className="font-serif text-lg">Your bowl</p>
                <p className="text-xs text-muted-foreground">
                  {totalPicked === 0 ? "Nothing picked yet" : `${totalPicked} ingredient${totalPicked === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            {totalPicked === 0 ? (
              <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-4 text-center">
                Start picking from the steps on the left and your bowl will appear here.
              </p>
            ) : (
              <ul className="space-y-3 mb-4">
                {STEPS.map((s) => {
                  const items = picks[s.key] ?? [];
                  if (!items.length) return null;
                  return (
                    <li key={s.key}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {s.subtitle}
                      </p>
                      <ul className="space-y-1">
                        {items.map((label) => (
                          <li key={label} className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">{label}</span>
                              <button
                                onClick={() => togglePick(s.key, label)}
                                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                                aria-label="Remove"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            {s.key === "dressing" && getDressingIngredients(label) && (
                              <p className="text-[11px] text-muted-foreground pl-0.5">
                                {getDressingIngredients(label)}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={addToShopping}
                disabled={totalPicked === 0}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <ShoppingBasket className="h-4 w-4" />
                {added ? "Added to your list!" : "Add bowl to shopping list"}
              </Button>
              {added && (
                <Link to="/shopping" className="text-center text-xs text-secondary underline underline-offset-2">
                  View shopping list →
                </Link>
              )}
              {totalPicked > 0 && (
                <button onClick={reset} className="text-center text-xs text-muted-foreground hover:text-foreground">
                  Start over
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  CalendarPlus,
  Lightbulb,
} from "lucide-react";
import { getRecipeBySlug } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useFavourites, useMealPlan } from "@/lib/user-state";
import { scaleRecipe } from "@/lib/recipe-math";
import { cn } from "@/lib/utils";
import { BuildYourBeautyOats } from "@/components/build-your-beauty-oats";
import { OmeletteAdditions } from "@/components/omelette-additions";

const PHASE_KEYWORDS = {
  build: [
    "chicken", "turkey", "beef", "salmon", "mackerel", "sardine", "tuna", "prawn",
    "egg", "eggs", "cottage cheese", "halloumi", "skyr", "greek yoghurt", "yoghurt",
    "bone broth", "gelatine", "milk", "cream cheese", "pork", "lamb", "mince",
    "meatball", "steak", "fish", "seafood", "smoked salmon", "trout", "protein",
    "mussel", "clam", "anchovy", "herring", "cod", "haddock", "feta", "parmesan",
    "cream", "single cream", "double cream",
  ],
  activate: [
    "red pepper", "yellow pepper", "green pepper", "pepper", "kiwi", "broccoli",
    "strawberr", "blackcurrant", "guava", "lemon", "lime", "orange", "grapefruit",
    "kale", "spinach", "watercress", "tomato", "mango", "pineapple", "papaya",
    "brussels sprout", "berries", "berry", "citrus", "vitamin c", "raspberr",
    "blueberr", "blackberr", "mixed berries", "pomegranate", "passion fruit",
    "cherry", "peach", "apricot", "watermelon", "goji", "tenderstem",
    "sugar snap", "courgette", "sweetcorn", "corn", "red cabbage",
  ],
  support: [
    "pumpkin seed", "sesame seed", "sesame", "tahini", "cashew", "oat", "oats",
    "brown rice", "dark chocolate", "walnut", "sunflower seed", "hemp seed",
    "chia seed", "flaxseed", "flax", "almond", "hazelnut", "pecan", "pine nut",
    "chickpea", "lentil", "cacao", "cocoa", "oatcake", "coconut", "peanut butter",
    "almond butter", "cashew butter", "dark choc", "70%", "seed", "nut", "quinoa",
    "butter bean", "peanut", "edamame", "wholewheat", "wholegrain",
  ],
  protect: [
    "avocado", "sweet potato", "carrot", "butternut", "squash", "salmon",
    "mackerel", "sardine", "olive oil", "blueberr", "raspberr", "pomegranate",
    "dark chocolate", "walnut", "leafy green", "rocket", "kale", "spinach",
    "mixed berries", "antioxidant", "omega", "vitamin a", "vitamin e",
    "blackberr", "cherry", "grape", "strawberr", "apple", "banana", "honey",
    "date", "dried apricot", "coconut oil", "extra virgin", "avocado oil",
    "beetroot", "red cabbage", "turmeric", "ginger", "cinnamon",
    "sun-dried tomato", "sun dried tomato", "harissa", "miso", "soy sauce",
  ],
};

function detectPhases(ingredients: { item: string }[]): string[] {
  const text = ingredients.map(i => i.item.toLowerCase()).join(" ");
  const phases: string[] = [];
  for (const [phase, keywords] of Object.entries(PHASE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      phases.push(phase.charAt(0).toUpperCase() + phase.slice(1));
    }
  }
  return phases;
}

const NO_PLAN_TYPES = new Set<string>();
const ALL_PHASES = ["Build", "Activate", "Support", "Protect"];

const recipeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["recipe", slug],
    queryFn: () => getRecipeBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params, context }) => {
    const r = await context.queryClient.ensureQueryData(recipeQuery(params.slug));
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — The Collagen Kitchen` },
          {
            name: "description",
            content:
              loaderData.notes?.slice(0, 160) ??
              `${loaderData.name} — a collagen-supporting recipe.`,
          },
        ]
      : [],
  }),
  component: RecipePage,
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="mx-auto max-w-3xl p-8 text-destructive">{error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Link to="/" className="mt-4 inline-block text-secondary underline">
          Back to cookbook
        </Link>
      </div>
    </AppShell>
  ),
});

function RecipePage() {
  const recipe = Route.useLoaderData() as import("@/lib/recipe-types").Recipe;
  const { isFav, toggle } = useFavourites();
  const { set: setPlan } = useMealPlan();
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIng, setCheckedIng] = useState<Record<number, boolean>>({});
  const [checkedStep, setCheckedStep] = useState<Record<number, boolean>>({});

  const canPlan = !NO_PLAN_TYPES.has(recipe.meal_type);

  useEffect(() => {
    setCheckedIng({});
    setCheckedStep({});
    setServings(recipe.servings);
  }, [recipe.slug, recipe.servings]);

  const scaledIngredients = useMemo(
    () => scaleRecipe(recipe, servings),
    [recipe, servings],
  );

  const phases = useMemo(
    () => detectPhases(recipe.ingredients),
    [recipe.ingredients],
  );

  const missingPhases = ALL_PHASES.filter(p => !phases.includes(p));
  const total = recipe.prep_min + recipe.cook_min;

  const hasOatsBuilder =
    recipe.tags.includes("beauty-oats-builder") ||
    recipe.slug === "overnight-beauty-oats";

  const hasOmeletteBuilder = recipe.slug === "build-your-own-glow-omelette";

  const glowFactorIsDuplicate =
    recipe.collagen_tip &&
    recipe.name &&
    recipe.collagen_tip.toLowerCase().startsWith(
      recipe.name.toLowerCase().slice(0, 20),
    );

  return (
    <AppShell>
      <article className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={() => window.history.back()}
          className="no-print mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">

          {/* Header */}
          <div className="relative bg-white px-8 py-10 sm:px-12 border-b border-border">
            <div className="absolute right-8 top-8 opacity-30 no-print">
              <RecipeStamp mealType={recipe.meal_type} />
            </div>

            <p className="text-[9px] uppercase tracking-[0.22em] text-secondary mb-2">
              {recipe.meal_type}
            </p>
            <h1 className="font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">
              {recipe.name}
            </h1>
            <div className="mt-4 h-px w-7 bg-secondary" />

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {total} min
                {recipe.prep_min > 0 && ` (${recipe.prep_min} prep`}
                {recipe.cook_min > 0 && ` · ${recipe.cook_min} cook)`}
              </span>
              <span>· Serves {servings}</span>
            </div>

            {/* Phase badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {ALL_PHASES.map(phase => (
                <span
                  key={phase}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    phases.includes(phase)
                      ? "bg-secondary/10 text-secondary border border-secondary/20"
                      : "bg-muted text-muted-foreground border border-border opacity-40"
                  )}
                >
                  {phase}
                </span>
              ))}
            </div>

            <div className="no-print mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={isFav(recipe.slug) ? "default" : "outline"}
                onClick={() => toggle(recipe.slug)}
                className={isFav(recipe.slug) ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "border-secondary/40 hover:border-secondary hover:text-secondary"}
              >
                <Heart className={cn("h-3.5 w-3.5", isFav(recipe.slug) && "fill-secondary-foreground")} />
                {isFav(recipe.slug) ? "Saved" : "Save recipe"}
              </Button>

              {canPlan && (
                <Link to="/planner">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-secondary/40 hover:border-secondary hover:text-secondary"
                    onClick={() => localStorage.setItem("ck.pendingPlanRecipe", JSON.stringify({ slug: recipe.slug, servings }))}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Add to meal plan
                  </Button>
                </Link>
              )}

              <Button size="sm" variant="ghost" onClick={() => window.print()} className="hover:text-secondary">
                Print
              </Button>
            </div>

            {hasOatsBuilder && (
              <p className="mt-5 text-xs text-muted-foreground border-l-2 border-secondary/40 pl-3">
                This is the base recipe — scroll down to build your own version with toppings and flavour combos.
              </p>
            )}

            {hasOmeletteBuilder && (
              <p className="mt-5 text-xs text-muted-foreground border-l-2 border-secondary/40 pl-3">
                Scroll down to pick your fillings — each one is mapped to the collagen matrix and adds straight to your shopping list.
              </p>
            )}
          </div>

          {/* Coylah's Tips */}
          {recipe.notes && (
            <div className="border-b border-border bg-[#fef2f4] px-8 py-6 sm:px-12">
              <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">
                <Lightbulb className="h-3 w-3" />
                Coylah's tips
              </p>
              <p className="text-sm font-light leading-relaxed text-foreground/80">
                {recipe.notes}
              </p>
            </div>
          )}

          {/* Ingredients + Method */}
          <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr]">
            <section className="border-b border-border px-8 py-8 lg:border-b-0 lg:border-r lg:px-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-xl font-light">Ingredients</h2>
                <div className="no-print flex items-center gap-1.5">
                  <button
                    onClick={() => setServings(s => Math.max(1, s - 1))}
                    className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground">
                    Serves {servings}
                  </span>
                  <button
                    onClick={() => setServings(s => s + 1)}
                    className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-secondary hover:text-secondary"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <ul className="space-y-1">
                {scaledIngredients.map((ing, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-2 hover:bg-muted/40">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-3.5 w-3.5 accent-secondary"
                        checked={!!checkedIng[i]}
                        onChange={() => setCheckedIng(c => ({ ...c, [i]: !c[i] }))}
                      />
                      <span className={cn(
                        "text-sm font-light leading-relaxed",
                        checkedIng[i] && "text-muted-foreground line-through"
                      )}>
                        {ing.qty && <span className="text-muted-foreground">{ing.qty} </span>}
                        {ing.unit && <span className="text-muted-foreground">{ing.unit} </span>}
                        {ing.item}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            <section className="px-8 py-8 lg:px-10">
              <h2 className="mb-5 font-serif text-xl font-light">Method</h2>
              <ol className="space-y-4">
                {recipe.method.map((step, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-1 hover:bg-muted/40">
                      <span
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] cursor-pointer",
                          checkedStep[i]
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                        onClick={e => {
                          e.preventDefault();
                          setCheckedStep(c => ({ ...c, [i]: !c[i] }));
                        }}
                      >
                        {i + 1}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!checkedStep[i]}
                        onChange={() => setCheckedStep(c => ({ ...c, [i]: !c[i] }))}
                      />
                      <span className={cn(
                        "text-sm font-light leading-relaxed",
                        checkedStep[i] && "text-muted-foreground line-through"
                      )}>
                        {step}
                      </span>
                    </label>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Glow Factor */}
          {recipe.collagen_tip && !glowFactorIsDuplicate && (
            <div className="border-t border-border bg-[#fef2f4] px-8 py-8 sm:px-12">
              <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">
                ✦ The glow factor
              </p>
              <p className="font-serif text-xl font-light leading-relaxed text-foreground/80">
                {recipe.collagen_tip}
              </p>
              {missingPhases.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
                  This recipe covers <span className="text-secondary font-medium">{phases.join(" · ")}</span>. For a complete collagen week, make sure your other meals are covering <span className="font-medium text-foreground/60">{missingPhases.join(" · ")}</span> too.
                </p>
              )}
            </div>
          )}
        </div>

        {hasOatsBuilder && <BuildYourBeautyOats />}
        {hasOmeletteBuilder && <OmeletteAdditions />}
      </article>
    </AppShell>
  );
}

function RecipeStamp({ mealType }: { mealType: string }) {
  const t = mealType.toLowerCase();
  if (t === "smoothie") return (
    <svg width="48" height="56" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <path d="M16 14 L20 60 Q20 64 32 64 Q44 64 44 60 L48 14 Z" stroke="#1C1917" strokeWidth="0.7" fill="none" strokeLinejoin="round"/>
      <path d="M16 14 L48 14" stroke="#1C1917" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M18 26 L46 26" stroke="#EDE5DC" strokeWidth="0.6" strokeLinecap="round"/>
      <path d="M32 14 L43 5" stroke="#1C1917" strokeWidth="0.65" strokeLinecap="round"/>
      <circle cx="43.5" cy="4.5" r="1.8" fill="#C9485B"/>
      <path d="M18 64 L18 70 Q18 72 32 72 Q46 72 46 70 L46 64" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (t === "breakfast") return (
    <svg width="48" height="56" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <path d="M8 36 Q8 60 32 60 Q56 60 56 36" stroke="#1C1917" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
      <path d="M8 36 L56 36" stroke="#1C1917" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M20 36 Q20 50 32 50 Q44 50 44 36" stroke="#EDE5DC" strokeWidth="0.6" fill="none"/>
      <path d="M24 36 Q22 28 26 24 Q30 21 32 26 Q34 21 38 24 Q42 28 40 36" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="25" r="1.8" fill="#C9485B"/>
      <path d="M16 60 L16 68 Q16 70 32 70 Q48 70 48 68 L48 60" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (t === "lunch") return (
    <svg width="48" height="56" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <path d="M8 40 Q8 64 32 64 Q56 64 56 40" stroke="#1C1917" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
      <path d="M8 40 L56 40" stroke="#1C1917" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M14 40 Q12 30 20 26 Q26 23 28 30" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
      <path d="M28 30 Q30 24 36 26 Q42 28 40 36" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
      <path d="M40 36 Q46 28 52 34 Q55 38 54 40" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
      <circle cx="32" cy="29" r="1.8" fill="#C9485B"/>
      <path d="M16 64 L16 72 Q16 74 32 74 Q48 74 48 72 L48 64" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (t === "snack") return (
    <svg width="48" height="56" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <ellipse cx="32" cy="60" rx="22" ry="5" stroke="#1C1917" strokeWidth="0.7" fill="none"/>
      <circle cx="24" cy="50" r="6" stroke="#1C1917" strokeWidth="0.65" fill="none"/>
      <circle cx="40" cy="52" r="5" stroke="#1C1917" strokeWidth="0.65" fill="none"/>
      <circle cx="32" cy="46" r="4" stroke="#1C1917" strokeWidth="0.65" fill="none"/>
      <circle cx="32" cy="46" r="1.5" fill="#C9485B" opacity="0.5"/>
    </svg>
  );
  return (
    <svg width="48" height="56" viewBox="0 0 72 76" fill="none" aria-hidden="true">
      <ellipse cx="38" cy="54" rx="24" ry="8" stroke="#1C1917" strokeWidth="0.7" fill="none"/>
      <ellipse cx="38" cy="52" rx="18" ry="5.5" stroke="#EDE5DC" strokeWidth="0.6" fill="none"/>
      <path d="M14 54 L6 46" stroke="#1C1917" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M14 50 Q14 38 38 36 Q62 38 62 50" stroke="#1C1917" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
      <path d="M24 46 Q30 40 38 42 Q46 44 52 40" stroke="#1C1917" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
      <circle cx="38" cy="38" r="1.8" fill="#C9485B"/>
      <path d="M30 30 Q30 24 32 22" stroke="#1C1917" strokeWidth="0.55" fill="none" strokeLinecap="round"/>
      <path d="M38 28 Q38 22 38 18" stroke="#1C1917" strokeWidth="0.55" fill="none" strokeLinecap="round"/>
      <path d="M46 30 Q46 24 44 22" stroke="#1C1917" strokeWidth="0.55" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

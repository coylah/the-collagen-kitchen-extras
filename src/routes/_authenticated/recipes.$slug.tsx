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
  Leaf,
  List,
  Sparkles,
  Bookmark,
  Printer,
  User,
  X,
} from "lucide-react";
import { getRecipeBySlug } from "@/lib/recipes.functions";
import { AppShell } from "@/components/app-shell";
import { useFavourites, useMealPlan } from "@/lib/user-state";
import { scaleRecipe } from "@/lib/recipe-math";
import { recipeImageSrc } from "@/lib/slugify";
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

// Foods per phase — ordered by realistic portion amount
const PHASE_FOODS: Record<string, { label: string; amount: string }[]> = {
  Build: [
    { label: "Tuna (1 tin)", amount: "43g protein" },
    { label: "Turkey (150g)", amount: "43g protein" },
    { label: "Chicken (150g)", amount: "40g protein" },
    { label: "Beef (150g)", amount: "39g protein" },
    { label: "Salmon (1 fillet)", amount: "38g protein" },
    { label: "Sardines (1 tin)", amount: "24g protein" },
    { label: "Prawns (100g)", amount: "24g protein" },
    { label: "Halloumi (80g)", amount: "17g protein" },
    { label: "Eggs (2)", amount: "16g protein" },
    { label: "Skyr (150g)", amount: "16g protein" },
    { label: "Cottage cheese (150g)", amount: "21g protein" },
    { label: "Greek yoghurt (150g)", amount: "15g protein" },
    { label: "Bone broth", amount: "Direct collagen amino acids" },
  ],
  Activate: [
    { label: "Blackcurrants (1 cup)", amount: "272mg vitamin C" },
    { label: "Yellow pepper (½)", amount: "147mg vitamin C" },
    { label: "Guava (1)", amount: "125mg vitamin C" },
    { label: "Red pepper (½)", amount: "102mg vitamin C" },
    { label: "Broccoli (1 head)", amount: "89mg vitamin C" },
    { label: "Strawberries (1 cup)", amount: "89mg vitamin C" },
    { label: "Papaya (1 cup)", amount: "87mg vitamin C" },
    { label: "Pineapple (1 cup)", amount: "79mg vitamin C" },
    { label: "Brussels sprouts (6)", amount: "77mg vitamin C" },
    { label: "Kiwi (1)", amount: "70mg vitamin C" },
    { label: "Orange (1)", amount: "69mg vitamin C" },
    { label: "Lentils (1 cup cooked)", amount: "6.6mg iron" },
    { label: "Spinach cooked (1 cup)", amount: "6.5mg iron" },
    { label: "Beef (150g)", amount: "4.2mg iron" },
    { label: "Chickpeas (½ tin)", amount: "3.5mg iron" },
    { label: "Sardines (1 tin)", amount: "2.8mg iron" },
    { label: "Eggs (2)", amount: "2.2mg iron" },
  ],
  Support: [
    { label: "Oysters (6)", amount: "14-81mg zinc" },
    { label: "Beef (150g)", amount: "6-12mg zinc" },
    { label: "Sesame seeds / tahini (1 tbsp)", amount: "Copper, zinc, iron" },
    { label: "Cashews (small handful)", amount: "Copper, zinc" },
    { label: "Mussels (100g)", amount: "6-7mg manganese" },
    { label: "Oats (1 cup)", amount: "Silica, manganese, zinc" },
    { label: "Dark chocolate 70%+ (2 squares)", amount: "Copper, zinc" },
    { label: "Walnuts (small handful)", amount: "Copper, manganese" },
    { label: "Hazelnuts (small handful)", amount: "Copper, manganese" },
    { label: "Brown rice (1 cup cooked)", amount: "Silica, manganese" },
    { label: "Lentils (1 cup cooked)", amount: "Iron, zinc, manganese" },
    { label: "Hemp seeds (2 tbsp)", amount: "Zinc, iron" },
  ],
  Protect: [
    { label: "Mackerel (1 fillet)", amount: "3.3-6.5g omega-3" },
    { label: "Salmon (1 fillet)", amount: "2.3-3.8g omega-3" },
    { label: "Sardines (1 tin)", amount: "1.3-1.9g omega-3" },
    { label: "Sweet potato (1 medium)", amount: "Vitamin A, silica" },
    { label: "Carrots (1 large)", amount: "835mcg vitamin A" },
    { label: "Butternut squash (1 cup)", amount: "798mcg vitamin A" },
    { label: "Avocado (½)", amount: "Vitamin E, healthy fats" },
    { label: "Spinach (1 handful)", amount: "Vitamin A, vitamin C" },
    { label: "Pomegranate seeds (3 tbsp)", amount: "118mg ellagic acid" },
    { label: "Berries (1 cup)", amount: "Antioxidants, vitamin C" },
    { label: "Walnuts (small handful)", amount: "Omega-3, vitamin E" },
    { label: "Sunflower seeds (2 tbsp)", amount: "7mg vitamin E" },
    { label: "Cooked tomatoes (½ tin)", amount: "32mg lycopene" },
    { label: "Dark chocolate 70%+ (2 squares)", amount: "Antioxidants, copper" },
  ],
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  Build: "Protein — glycine, proline and lysine. The raw material your body uses to make collagen.",
  Activate: "Vitamin C and iron — trigger the enzymes that turn protein into stable collagen fibres.",
  Support: "Zinc, copper, manganese and silica — activate and stabilise the building process.",
  Protect: "Vitamin A, omega-3, antioxidants and blood sugar stability — defend the collagen you've already built.",
};

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

type TabKey = "ingredients" | "method" | "tips" | "glow";

function RecipePage() {
  const recipe = Route.useLoaderData() as import("@/lib/recipe-types").Recipe;
  const { isFav, toggle } = useFavourites();
  const { set: setPlan } = useMealPlan();
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIng, setCheckedIng] = useState<Record<number, boolean>>({});
  const [checkedStep, setCheckedStep] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabKey>(recipe.notes ? "tips" : "ingredients");
  const [imgFailed, setImgFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const canPlan = !NO_PLAN_TYPES.has(recipe.meal_type);
  const fav = isFav(recipe.slug);

  useEffect(() => {
    setCheckedIng({});
    setCheckedStep({});
    setServings(recipe.servings);
    setActiveTab(recipe.notes ? "tips" : "ingredients");
    setImgFailed(false);
    setLightboxOpen(false);
    setSelectedPhase(null);
  }, [recipe.slug, recipe.servings]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

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

  const photoSrc = recipe.image_url || recipeImageSrc(recipe.name);

  const tabs: { key: TabKey; label: string; icon: typeof Leaf }[] = [
    { key: "ingredients", label: "Ingredients", icon: Leaf },
    { key: "method", label: "Method", icon: List },
    ...(recipe.notes ? [{ key: "tips" as TabKey, label: "Coylah's tips", icon: Lightbulb }] : []),
    ...(recipe.collagen_tip && !glowFactorIsDuplicate
      ? [{ key: "glow" as TabKey, label: "Glow factor", icon: Sparkles }]
      : []),
  ];

  return (
    <AppShell>
      {/* Phase food list popup */}
      {selectedPhase && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSelectedPhase(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-background px-5 pt-5 pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    {selectedPhase}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {PHASE_DESCRIPTIONS[selectedPhase]}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ul className="px-5 py-4 space-y-3">
              {PHASE_FOODS[selectedPhase]?.map((food) => (
                <li key={food.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">{food.label}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{food.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-2xl px-4 py-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">

          {/* Photo + title */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-muted/30">
            {!imgFailed ? (
              <img
                src={photoSrc}
                alt={recipe.name}
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                onError={() => setImgFailed(true)}
              />
            ) : null}
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, white 65%)" }}
            />

            <div className="no-print absolute top-3 left-3 right-3 flex items-center justify-between">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-black/25 backdrop-blur px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => toggle(recipe.slug)}
                aria-label={fav ? "Remove from saved" : "Save recipe"}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/25 backdrop-blur text-white"
              >
                <Heart className={cn("h-4 w-4", fav && "fill-white")} />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
              <p className="text-[9px] uppercase tracking-[0.22em] text-secondary mb-1.5 inline-block rounded-full border border-secondary/30 bg-white/90 backdrop-blur px-2.5 py-0.5">
                {recipe.meal_type}
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-light leading-tight text-foreground">
                {recipe.name}
              </h1>
              <div className="mt-2 h-px w-7 bg-secondary" />
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {total} min
                  {recipe.prep_min > 0 && ` (${recipe.prep_min} prep`}
                  {recipe.cook_min > 0 && ` · ${recipe.cook_min} cook)`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Serves {servings}
                </span>
              </div>
            </div>
          </div>

          {/* Phase badges + action buttons */}
          <div className="px-5 pt-3 pb-1">
            <div className="flex flex-wrap items-center gap-1.5">
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

            <div className="no-print mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => toggle(recipe.slug)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl border py-2 text-[11px] font-medium transition-colors",
                  fav
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-secondary/40 text-secondary hover:border-secondary hover:bg-secondary/5"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", fav && "fill-secondary")} />
                {fav ? "Saved" : "Save"}
              </button>

              {canPlan ? (
                <Link
                  to="/planner"
                  onClick={() => localStorage.setItem("ck.pendingPlanRecipe", JSON.stringify({ slug: recipe.slug, servings }))}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-secondary/40 py-2 text-[11px] font-medium text-secondary text-center leading-tight hover:border-secondary hover:bg-secondary/5 transition-colors"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Add to meal plan
                </Link>
              ) : (
                <div />
              )}

              <button
                onClick={() => window.print()}
                className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-secondary/40 py-2 text-[11px] font-medium text-secondary hover:border-secondary hover:bg-secondary/5 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>

            {hasOatsBuilder && (
              <p className="mt-3 text-xs text-muted-foreground border-l-2 border-secondary/40 pl-3">
                This is the base recipe — scroll down to build your own version with toppings and flavour combos.
              </p>
            )}

            {hasOmeletteBuilder && (
              <p className="mt-3 text-xs text-muted-foreground border-l-2 border-secondary/40 pl-3">
                Scroll down to pick your fillings — each one is mapped to the collagen matrix and adds straight to your shopping list.
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="no-print flex border-t border-b border-border mt-4">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] transition-colors",
                  activeTab === key
                    ? "bg-secondary/10 text-secondary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Ingredients */}
          <section className={cn("px-5 py-5", activeTab === "ingredients" ? "block" : "hidden print:block")}>
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

          {/* Method */}
          <section className={cn("px-5 py-5 border-t border-border", activeTab === "method" ? "block" : "hidden print:block")}>
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

          {/* Coylah's Tips */}
          {recipe.notes && (
            <div className={cn("border-t border-border bg-[#fef2f4] px-5 py-5", activeTab === "tips" ? "block" : "hidden print:block")}>
              <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">
                <Lightbulb className="h-3 w-3" />
                Coylah's tips
              </p>
              <p className="text-sm font-light leading-relaxed text-foreground/80">
                {recipe.notes}
              </p>
            </div>
          )}

          {/* Glow Factor */}
          {recipe.collagen_tip && !glowFactorIsDuplicate && (
            <div className={cn("border-t border-border bg-[#fef2f4] px-5 py-5", activeTab === "glow" ? "block" : "hidden print:block")}>
              <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">
                ✦ The glow factor
              </p>
              <p className="font-serif text-xl font-light leading-relaxed text-foreground/80">
                {recipe.collagen_tip}
              </p>
              {missingPhases.length > 0 && (
                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    This recipe covers <span className="text-secondary font-medium">{phases.join(" · ")}</span>. Not covered:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingPhases.map(phase => (
                      <button
                        key={phase}
                        onClick={() => setSelectedPhase(phase)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
                      >
                        <span className="text-secondary">+</span> {phase} — see key foods
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasOatsBuilder && <BuildYourBeautyOats />}
        {hasOmeletteBuilder && <OmeletteAdditions />}
      </article>

      {/* Fullscreen photo lightbox */}
      {lightboxOpen && !imgFailed && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={photoSrc}
            alt={recipe.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </div>
      )}
    </AppShell>
  );
}

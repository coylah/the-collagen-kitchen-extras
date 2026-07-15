import type { Ingredient, Recipe } from "./recipe-types";

export function parseQty(qty: string): number | null {
  if (!qty) return null;
  const s = qty.trim();
  if (!s) return null;

  // Handle unicode fractions directly
  const unicodeFracs: Record<string, number> = {
    "½": 0.5, "¼": 0.25, "¾": 0.75,
    "⅓": 0.333, "⅔": 0.667,
    "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
  };

  // Check for whole number + unicode fraction e.g. "1½"
  for (const [frac, val] of Object.entries(unicodeFracs)) {
    if (s.endsWith(frac)) {
      const whole = s.slice(0, -frac.length).trim();
      const wholeNum = whole ? parseFloat(whole) : 0;
      if (!isNaN(wholeNum)) return wholeNum + val;
    }
    if (s === frac) return val;
  }

  // Handle slash fractions e.g. "1/2"
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length === 2) {
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      if (!isNaN(a) && !isNaN(b) && b !== 0) return a / b;
    }
    return null;
  }

  // Handle ranges e.g. "1-2" — take the lower
  if (s.includes("-")) {
    const [a] = s.split("-").map((x) => parseFloat(x));
    if (!isNaN(a)) return a;
  }

  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

export function formatQty(n: number): string {
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
  const fracs: [number, string][] = [
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.66, "⅔"],
    [0.75, "¾"],
  ];
  const whole = Math.floor(n);
  const rem = n - whole;
  const f = fracs.find(([v]) => Math.abs(rem - v) < 0.05);
  if (f) return whole ? `${whole} ${f[1]}` : f[1];
  return n.toFixed(1);
}

export function scaleIngredient(ing: Ingredient, factor: number): Ingredient {
  const n = parseQty(ing.qty);
  if (n == null) return ing;
  return { ...ing, qty: formatQty(n * factor) };
}

export function scaleRecipe(r: Recipe, newServings: number) {
  const factor = newServings / r.servings;
  return r.ingredients.map((i) => scaleIngredient(i, factor));
}

// --- Shopping list aggregation ---

export type ShoppingItem = {
  item: string;
  unit: string;
  qty: number | null;
  qtyText: string;
  category: string;
  fromRecipes: string[];
  staple: boolean;
  key: string;
};

const PREP_WORDS = [
  "chopped", "diced", "sliced", "minced", "crushed", "grated",
  "peeled", "shredded", "cubed", "halved", "quartered", "julienned",
  "finely chopped", "roughly chopped", "thinly sliced",
  "to taste", "for serving", "for garnish", "optional",
  "fresh", "dried", "frozen", "tinned", "canned", "raw", "cooked",
  "small", "medium", "large", "whole", "ripe",
];

const ITEM_ALIASES: Record<string, string> = {
  "chicken breast": "chicken breast",
  "chicken breasts": "chicken breast",
  "chicken thighs": "chicken thigh",
  "chicken thigh": "chicken thigh",
  "chicken fillets": "chicken breast",
  "chicken fillet": "chicken breast",
  "roast chicken thighs": "chicken thigh",
  "grilled chicken": "chicken breast",
  "shredded chicken": "chicken breast",
  "shredded chicken breast": "chicken breast",
  "greek yogurt": "greek yoghurt",
  "greek yoghurt": "greek yoghurt",
  "full fat greek yogurt": "greek yoghurt",
  "full-fat greek yoghurt": "greek yoghurt",
  "natural yoghurt": "greek yoghurt",
  "salmon fillet": "salmon",
  "salmon fillets": "salmon",
  "beef mince": "beef mince",
  "lean beef mince": "beef mince",
  "spring onions": "spring onion",
  "spring onion": "spring onion",
  "cherry tomatoes": "tomatoes",
  "tomatoes": "tomatoes",
  "tomato": "tomatoes",
  "olive oil": "olive oil",
  "extra virgin olive oil": "olive oil",
  "garlic granules": "garlic granules",
  "garlic powder": "garlic granules",
  "avocado": "avocado",
  "avocados": "avocado",
  "egg": "eggs",
  "eggs": "eggs",
};

function stripPrepWords(s: string): string {
  let result = s.toLowerCase();
  for (const word of PREP_WORDS) {
    result = result.replace(new RegExp(`\\b${word}\\b`, "g"), "");
  }
  result = result
    .replace(/,/g, " ")
    .replace(/\ba\b/g, " ")
    .replace(/\ban\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return result;
}

function normItem(s: string): string {
  const stripped = stripPrepWords(s).replace(/[^a-z0-9 ]/g, "").trim();
  return ITEM_ALIASES[stripped] ?? stripped;
}

const UNIT_ALIASES: Record<string, string> = {
  grams: "g",
  gram: "g",
  kilograms: "kg",
  kilogram: "kg",
  millilitres: "ml",
  milliliters: "ml",
  millilitre: "ml",
  milliliter: "ml",
  litres: "l",
  liters: "l",
  litre: "l",
  liter: "l",
  tablespoons: "tbsp",
  tablespoon: "tbsp",
  teaspoons: "tsp",
  teaspoon: "tsp",
  ounces: "oz",
  ounce: "oz",
  pounds: "lb",
  pound: "lb",
  pinches: "pinch",
  pinch: "pinch",
  handfuls: "handful",
  handful: "handful",
  cups: "cup",
  cup: "cup",
};

const CUP_TO_GRAMS: Record<string, number> = {
  "greek yoghurt": 245,
  "flour": 120,
  "oats": 90,
  "rice": 185,
  "spinach": 30,
  "berries": 150,
  "mixed berries": 150,
};

function normUnit(u: string): string {
  const lower = u.toLowerCase().trim();
  return UNIT_ALIASES[lower] ?? lower;
}

const STAPLE_CATEGORIES = new Set(["cupboard", "pantry", "herbs", "spices", "fats"]);
const STAPLE_UNITS = new Set([
  "tsp", "tbsp", "teaspoon", "tablespoon",
  "pinch", "pinches", "dash", "splash", "drizzle",
]);
const PRODUCE_CATEGORIES = new Set(["produce"]);

function isStaple(ing: { category: string; unit: string }): boolean {
  if (STAPLE_CATEGORIES.has(ing.category.toLowerCase())) return true;
  if (STAPLE_UNITS.has(normUnit(ing.unit))) return true;
  return false;
}

export function shoppingItemKey(item: string, unit: string, staple: boolean) {
  return staple
    ? `staple|${normItem(item)}`
    : `${normItem(item)}|${normItem(item) === "" ? normUnit(unit) : "unified"}`;
}

function shoppingDisplayName(item: string): string {
  const normed = normItem(item);
  if (!normed) return item;
  return normed.charAt(0).toUpperCase() + normed.slice(1);
}

const WHOLE_ITEM_NAMES = new Set([
  "avocado", "banana", "onion", "lemon", "lime", "orange",
  "apple", "cucumber", "pepper", "carrot", "egg", "eggs",
  "tomatoes", "potato", "sweet potato", "courgette",
]);

export function buildShoppingList(
  entries: { recipe: Recipe; servings: number }[],
): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();

  for (const { recipe, servings } of entries) {
    const factor = servings / recipe.servings;
    for (const ing of recipe.ingredients) {
      const staple = isStaple(ing);
      const itemName = normItem(ing.item);
      const key = staple ? `staple|${itemName}` : `${itemName}`;

      let n = parseQty(ing.qty);
      let unit = normUnit(ing.unit);

      if (unit === "cup" && CUP_TO_GRAMS[itemName] && n != null) {
        n = n * CUP_TO_GRAMS[itemName];
        unit = "g";
      }

      const scaled = n != null ? n * factor : null;
      const existing = map.get(key);

      if (existing) {
        if (!staple && existing.qty != null && scaled != null && existing.unit === unit) {
          existing.qty += scaled;
        } else if (!staple && existing.qty == null && scaled != null) {
          existing.qty = scaled;
          existing.unit = unit;
        }
        if (!existing.fromRecipes.includes(recipe.name))
          existing.fromRecipes.push(recipe.name);
      } else {
        map.set(key, {
          item: shoppingDisplayName(ing.item),
          unit,
          qty: scaled,
          qtyText: "",
          category: ing.category || "other",
          fromRecipes: [recipe.name],
          staple,
          key,
        });
      }
    }
  }

  for (const item of map.values()) {
    if (item.staple) {
      item.qtyText = "";
      continue;
    }
    if (item.qty == null) {
      item.qtyText = "";
      continue;
    }

    const lowerName = item.item.toLowerCase();
    const isWholeItem = WHOLE_ITEM_NAMES.has(lowerName) ||
      (PRODUCE_CATEGORIES.has(item.category.toLowerCase()) && !item.unit);

    if (isWholeItem) {
      item.qty = Math.ceil(item.qty);
      item.qtyText = String(item.qty);
      item.unit = "";
      continue;
    }

    item.qtyText = formatQty(item.qty);
  }

  return Array.from(map.values())
    .filter((item) => item.qtyText !== "0" || item.staple)
    .sort((a, b) =>
      a.category.localeCompare(b.category) || a.item.localeCompare(b.item),
    );
}

import { useLocalStorage } from "@/hooks/use-local-storage";

export function useFavourites() {
  const [favs, setFavs] = useLocalStorage<string[]>("ck.favs", []);
  const toggle = (slug: string) =>
    setFavs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  const isFav = (slug: string) => favs.includes(slug);
  const clearFavs = () => setFavs([]);
  return { favs, toggle, isFav, clearFavs };
}

export type Slot = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const SLOTS: Slot[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];

// PlanEntry is now either a recipe (slug) or a custom bowl (name + ingredient list)
export type PlanEntry = {
  slug: string;
  servings: number;
  isCustomBowl?: boolean;
  bowlName?: string;
  bowlIngredients?: { item: string; category: string }[];
};

export type MealPlan = Record<string, PlanEntry | null>;

export function planKey(day: string, slot: Slot) {
  return `${day}-${slot}`;
}

export function useMealPlan() {
  const [plan, setPlan] = useLocalStorage<MealPlan>("ck.plan", {});
  const set = (day: string, slot: Slot, entry: PlanEntry | null) =>
    setPlan((p) => ({ ...p, [planKey(day, slot)]: entry }));
  const clear = () => setPlan({});
  return { plan, setPlan, set, clear };
}

export function useHaveList() {
  const [have, setHave] = useLocalStorage<string[]>("ck.have", []);
  const isHad = (key: string) => have.includes(key);
  const toggle = (key: string) =>
    setHave((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  const reset = () => setHave([]);
  return { have, isHad, toggle, reset };
}

export type ExtraItem = { item: string; category: string; addedAt: number };

export function useShoppingExtras() {
  const [extras, setExtras] = useLocalStorage<ExtraItem[]>("ck.extras", []);
  const add = (items: { item: string; category: string }[]) =>
    setExtras((prev) => {
      const existing = new Set(prev.map((e) => e.item.toLowerCase()));
      const additions = items
        .filter((i) => !existing.has(i.item.toLowerCase()))
        .map((i) => ({ ...i, addedAt: Date.now() }));
      return [...prev, ...additions];
    });
  const remove = (item: string) =>
    setExtras((prev) =>
      prev.filter((e) => e.item.toLowerCase() !== item.toLowerCase()),
    );
  const clear = () => setExtras([]);
  return { extras, add, remove, clear };
}

export type ManualItem = { text: string; checked: boolean; addedAt: number };

export function useManualItems() {
  const [items, setItems] = useLocalStorage<ManualItem[]>("ck.manual", []);
  const addItem = (text: string) => {
    if (!text.trim()) return;
    setItems((prev) => [
      ...prev,
      { text: text.trim(), checked: false, addedAt: Date.now() },
    ]);
  };
  const toggleItem = (addedAt: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.addedAt === addedAt ? { ...i, checked: !i.checked } : i,
      ),
    );
  const removeItem = (addedAt: number) =>
    setItems((prev) => prev.filter((i) => i.addedAt !== addedAt));
  const clearAll = () => setItems([]);
  return { items, addItem, toggleItem, removeItem, clearAll };
}

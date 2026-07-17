import { useLocalStorage } from "@/hooks/use-local-storage";

// Week context — "1" or "2"
export type Week = "1" | "2";

function weekKey(base: string, week: Week): string {
  return week === "1" ? base : `${base}.next`;
}

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

export function useMealPlan(week: Week = "1") {
  const key = weekKey("ck.plan", week);
  const [plan, setPlan] = useLocalStorage<MealPlan>(key, {});
  const set = (day: string, slot: Slot, entry: PlanEntry | null) =>
    setPlan((p) => ({ ...p, [planKey(day, slot)]: entry }));
  const clear = () => setPlan({});
  return { plan, setPlan, set, clear };
}

export function useHaveList(week: Week = "1") {
  const key = weekKey("ck.have", week);
  const [have, setHave] = useLocalStorage<string[]>(key, []);
  const isHad = (k: string) => have.includes(k);
  const toggle = (k: string) =>
    setHave((prev) =>
      prev.includes(k) ? prev.filter((h) => h !== k) : [...prev, k],
    );
  const reset = () => setHave([]);
  return { have, isHad, toggle, reset };
}

export type ExtraItem = { item: string; category: string; addedAt: number };

export function useShoppingExtras(week: Week = "1") {
  const key = weekKey("ck.extras", week);
  const [extras, setExtras] = useLocalStorage<ExtraItem[]>(key, []);
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

export function useManualItems(week: Week = "1") {
  const key = weekKey("ck.manual", week);
  const [items, setItems] = useLocalStorage<ManualItem[]>(key, []);
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

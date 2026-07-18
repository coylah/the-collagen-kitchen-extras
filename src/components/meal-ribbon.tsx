import { Link } from "@tanstack/react-router";
import { Coffee, Sun, Moon, Apple, Cookie } from "lucide-react";

export const MEAL_TYPES: { key: string; label: string; icon: typeof Coffee }[] = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sun },
  { key: "dinner", label: "Dinner", icon: Moon },
  { key: "snack", label: "Snack", icon: Apple },
  { key: "dessert", label: "Dessert", icon: Cookie },
];

/**
 * Fixed bottom ribbon — always visible, same on every page. Rendered once
 * by AppShell so Home and every /meal/$type page share the exact same bar
 * rather than each page building its own copy.
 */
export function MealRibbon() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/98 backdrop-blur shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-6xl grid grid-cols-5">
        {MEAL_TYPES.map(({ key, label, icon: MealIcon }) => (
          <Link
            key={key}
            to="/meal/$type"
            params={{ type: key }}
            className="flex flex-col items-center gap-0.5 py-2.5 text-foreground/50 transition-colors hover:text-foreground"
            activeProps={{ className: "flex flex-col items-center gap-0.5 py-2.5 text-secondary" }}
          >
            <MealIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

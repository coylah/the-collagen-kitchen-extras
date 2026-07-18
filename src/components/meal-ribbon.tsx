import { Link } from "@tanstack/react-router";
import { Salad, Milk, Soup, BookOpen } from "lucide-react";

export const RIBBON_LINKS: { key: string; label: string; icon: typeof Salad; to: string }[] = [
  { key: "glow-bowl", label: "Glow Bowl", icon: Salad, to: "/build/glow-bowl" },
  { key: "yoghurt-bowl", label: "Yoghurt Bowl", icon: Milk, to: "/build/yoghurt-bowl" },
  { key: "bone-broth", label: "Bone Broth", icon: Soup, to: "/bone-broth" },
  { key: "browse", label: "Browse Recipes", icon: BookOpen, to: "/" },
];

/**
 * Fixed bottom ribbon — always visible, same on every page. Rendered once
 * by AppShell so Home and every /meal/$type page share the exact same bar
 * rather than each page building its own copy.
 */
export function MealRibbon() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/98 backdrop-blur shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-6xl grid grid-cols-4">
        {RIBBON_LINKS.map(({ key, label, icon: RibbonIcon, to }) => (
          <Link
            key={key}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-0.5 py-2.5 text-foreground/50 transition-colors hover:text-foreground"
            activeProps={{ className: "flex flex-col items-center gap-0.5 py-2.5 text-secondary" }}
          >
            <RibbonIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

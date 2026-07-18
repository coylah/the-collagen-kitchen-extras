import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Clock, ChevronRight } from "lucide-react";
import type { Recipe } from "@/lib/recipe-types";
import { useFavourites } from "@/lib/user-state";
import { slugifyName } from "@/lib/slugify";
import { RecipePlaceholder } from "@/components/recipe-card";
import { cn } from "@/lib/utils";

export function RecipeRow({ recipe }: { recipe: Recipe }) {
  const { isFav, toggle } = useFavourites();
  const fav = isFav(recipe.slug);
  const total = recipe.prep_min + recipe.cook_min;
  const [imgFailed, setImgFailed] = useState(false);
  const photoSrc = recipe.image_url || `/images/recipes/${slugifyName(recipe.name)}.jpg`;

  return (
    <Link
      to="/recipes/$slug"
      params={{ slug: recipe.slug }}
      className="flex items-start gap-3 py-4 border-b border-border last:border-b-0 group"
    >
      {/* Thumbnail — falls back to the illustration if the photo isn't there yet */}
      <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-muted/30">
        {!imgFailed ? (
          <img
            src={photoSrc}
            alt={recipe.name}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <RecipePlaceholder mealType={recipe.meal_type} className="h-full w-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block shrink-0 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-secondary">
            {recipe.meal_type}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(recipe.slug);
            }}
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all",
              fav ? "text-secondary" : "text-foreground/25 hover:text-secondary/60"
            )}
            aria-label={fav ? "Remove from saved" : "Save recipe"}
          >
            <Heart className={cn("h-4 w-4 transition-all", fav && "fill-secondary")} />
          </button>
        </div>

        <h3 className="mt-1 font-serif text-base leading-tight text-foreground group-hover:text-secondary transition-colors">
          {recipe.name}
        </h3>

        {recipe.collagen_tip && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground font-light">
            {recipe.collagen_tip}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{total} min · Serves {recipe.servings}</span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-1" />
    </Link>
  );
}

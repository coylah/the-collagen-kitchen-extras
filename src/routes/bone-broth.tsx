import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { listRecipes } from "@/lib/recipes.functions";
import { Sparkles } from "lucide-react";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/bone-broth")({
  head: () => ({
    meta: [
      { title: "Bone Broth — The Collagen Kitchen" },
      { name: "description", content: "The backbone of The Collagen Kitchen. Coylah's Collagen Bone Broth." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: BoneBrothPage,
});

function BoneBrothPage() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const broth = recipes.find(r => r.slug === "bone-broth");

  return (
    <AppShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-secondary" />
            <p className="text-[9px] uppercase tracking-[0.32em] text-secondary">The heart of this cookbook</p>
            <div className="h-px w-6 bg-secondary" />
          </div>
          <p className="font-script text-2xl text-secondary -mb-1">Love Coylah</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight text-foreground mb-3">
            Coylah's Collagen Bone Broth
          </h1>
          <div className="w-8 h-px bg-secondary mb-5" />
          <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed font-light">
            <p>
              If there's one thing I want you to take away from this cookbook, it's this. Bone broth is the single most direct collagen-supporting food you can make — it contains glycine, proline and hydroxyproline, the exact amino acids your body uses to build collagen, already extracted and ready to use.
            </p>
            <p>
              Every other recipe in this cookbook supports collagen synthesis in different ways. This one delivers the raw material directly. There is nothing more powerful you can add to your kitchen routine.
            </p>
            <p>
              Here's the habit I want you to build: every time you roast a chicken, keep the carcass. Pop it in a bag in the freezer. When you've got two or three saved up, make a batch of broth. Ask your butcher for bones too — most will give them away for next to nothing or completely free.
            </p>
            <p>
              Once you've got broth in the freezer, the rule is simple: anywhere a recipe calls for water — rice, quinoa, lentils, soups, sauces — use broth instead. It costs you nothing extra and turns an ordinary meal into a genuinely collagen-building one.
            </p>
            <div className="rounded-2xl border border-secondary/20 bg-[#fef2f4] p-5">
              <p className="text-[9px] uppercase tracking-[0.22em] text-secondary font-medium mb-2">Why apple cider vinegar?</p>
              <p>The apple cider vinegar in this recipe isn't optional — it's what pulls the minerals and collagen out of the bones and into the broth. Without it, you're making a much weaker stock. Add it at the start and don't skip the resting time before you turn the heat on.</p>
            </div>
            <div className="rounded-2xl border border-secondary/20 bg-[#fef2f4] p-5">
              <p className="text-[9px] uppercase tracking-[0.22em] text-secondary font-medium mb-2">How long to simmer?</p>
              <p>Minimum 12 hours. 24 hours is better. A slow cooker on low overnight is the easiest way — you wake up to a ready batch with no effort. The longer it simmers, the richer the colour and the more collagen you extract.</p>
            </div>
          </div>
        </div>
      </section>

      {broth ? (
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="bg-white px-8 py-8 sm:px-12 border-b border-border">
              <p className="text-[9px] uppercase tracking-[0.22em] text-secondary mb-2">The recipe</p>
              <h2 className="font-serif text-3xl font-light">{broth.name}</h2>
              <div className="mt-3 h-px w-7 bg-secondary" />
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Prep: {broth.prep_min} min</span>
                <span>·</span>
                <span>Simmer: 12-24 hours</span>
                <span>·</span>
                <span>Makes approx {broth.servings} portions</span>
              </div>
            </div>

            {broth.notes && (
              <div className="border-b border-border bg-[#fef2f4] px-8 py-6 sm:px-12">
                <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">Coylah's tips</p>
                <p className="text-sm font-light leading-relaxed text-foreground/80">{broth.notes}</p>
              </div>
            )}

            <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr]">
              <section className="border-b border-border px-8 py-8 lg:border-b-0 lg:border-r lg:px-10">
                <h3 className="font-serif text-xl font-light mb-5">Ingredients</h3>
                <ul className="space-y-2">
                  {broth.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm font-light leading-relaxed">
                      {ing.qty && <span className="text-muted-foreground">{ing.qty} </span>}
                      {ing.unit && <span className="text-muted-foreground">{ing.unit} </span>}
                      {ing.item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="px-8 py-8 lg:px-10">
                <h3 className="font-serif text-xl font-light mb-5">Method</h3>
                <ol className="space-y-4">
                  {broth.method.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[10px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm font-light leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {broth.collagen_tip && (
              <div className="border-t border-border bg-[#fef2f4] px-8 py-8 sm:px-12">
                <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-secondary font-medium">✦ The glow factor</p>
                <p className="font-serif text-xl font-light leading-relaxed text-foreground/80">{broth.collagen_tip}</p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Bone broth is part of the Build phase — the foundation of the collagen matrix.
            </p>
            <Link
              to="/why-this-works"
              className="inline-flex items-center gap-2 text-sm text-secondary font-medium hover:underline underline-offset-2"
            >
              <Sparkles className="h-4 w-4" />
              See the full collagen matrix — why this works →
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-secondary underline underline-offset-2">
              Back to the cookbook →
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-4xl px-4 py-10 text-center">
          <p className="text-muted-foreground">Recipe loading...</p>
        </section>
      )}
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/why-this-works")({
  head: () => ({
    meta: [
      { title: "Why This Works — The Collagen Kitchen" },
      {
        name: "description",
        content: "The science behind every recipe. Four phases, eleven cofactors, one cookbook.",
      },
    ],
  }),
  component: WhyThisWorksPage,
});

const PHASES = [
  {
    key: "build",
    label: "BUILD",
    cofactors: "Glycine · Proline · Lysine",
    description: "The raw material. Your body cannot make collagen without these three amino acids — and it can't borrow them from anywhere else. They come from protein. Real protein. Meat, fish, eggs, dairy and bone broth.",
    foods: "Chicken, salmon, sardines, eggs, cottage cheese, bone broth, Greek yoghurt, skyr",
  },
  {
    key: "activate",
    label: "ACTIVATE",
    cofactors: "Vitamin C · Iron",
    description: "The spark that gets everything moving. Vitamin C and iron trigger the enzymes that convert those amino acids into stable collagen fibres. Without vitamin C, synthesis stops completely — this is literally what scurvy is. Without iron, the same enzymes don't work properly even when vitamin C is plentiful.",
    foods: "Red pepper, kiwi, broccoli, strawberries, blackcurrants, sardines, lentils, spinach",
  },
  {
    key: "support",
    label: "SUPPORT",
    cofactors: "Zinc · Copper · Manganese · Silica",
    description: "The enablers that most people have never even heard of. Zinc activates the building enzymes. Copper cross-links the fibres to make them strong — without it, collagen forms but falls apart. Manganese and silica support the connective tissue framework everything sits within.",
    foods: "Pumpkin seeds, sesame seeds, oats, walnuts, dark chocolate, brown rice, cashews, mussels",
  },
  {
    key: "protect",
    label: "PROTECT",
    cofactors: "Vitamin A · Omega-3 · Antioxidants · Blood sugar stability",
    description: "The defenders. Because building collagen is only half the job — you also have to stop it being destroyed. Vitamin A protects and regenerates. Omega-3 reduces the inflammation that breaks it down. Antioxidants neutralise the oxidative damage from UV, stress and pollution. And stable blood sugar stops sugar literally attaching to your collagen fibres and making them stiff.",
    foods: "Avocado, mackerel, sweet potato, berries, leafy greens, dark chocolate, oily fish, olive oil",
  },
];

const MATRIX_SECTIONS = [
  {
    phase: "BUILD",
    number: "01",
    name: "Protein — glycine, proline and lysine",
    why: "The amino acids collagen is literally made from. Glycine makes up one third of the collagen structure. Proline provides stability. Lysine is essential for the hydroxylation step that locks the triple helix in place. Bone broth and gelatine deliver these in their already-processed form — which is why they're so valuable.",
    rda: "45g protein/day minimum — more if active",
    examples: "Salmon, chicken, eggs, sardines, cottage cheese, Greek yoghurt, bone broth",
    note: "Animal protein delivers glycine, proline and lysine most efficiently. If you eat mostly plant-based, pay particular attention to lysine — it's low in most plant foods except legumes.",
  },
  {
    phase: "ACTIVATE",
    number: "02",
    name: "Vitamin C",
    why: "Non-negotiable. Activates prolyl hydroxylase and lysyl hydroxylase — the enzymes that convert proline and lysine into the stable forms needed for a collagen triple helix. Raw or lightly cooked is best — vitamin C degrades with prolonged heat.",
    rda: "75-90mg/day minimum",
    examples: "Red pepper, blackcurrants, kiwi, broccoli, strawberries, Brussels sprouts, citrus",
    note: "Half a raw red pepper covers your daily vitamin C needs entirely. It contains more vitamin C than an orange.",
  },
  {
    phase: "ACTIVATE",
    number: "03",
    name: "Iron",
    why: "Works alongside vitamin C in the same hydroxylation enzymes. Without iron these enzymes can't function properly even when vitamin C is plentiful. One of the most common deficiencies in women — and one that directly impairs collagen synthesis.",
    rda: "14.8mg/day (reproductive age) · 8.7mg/day (post-menopause)",
    examples: "Clams, pumpkin seeds, sesame seeds, sardines, beef, lentils, spinach",
    note: "⚠️ Liver is very high in iron but maximum once a week — avoid entirely in pregnancy. Always pair plant iron sources with vitamin C to increase absorption.",
  },
  {
    phase: "SUPPORT",
    number: "04",
    name: "Zinc",
    why: "Activates the enzymes that build and renew collagen. Cannot be stored — you need it daily. Many women are quietly deficient, particularly during perimenopause, without ever knowing it.",
    rda: "7mg/day for women",
    examples: "Oysters, beef, pumpkin seeds, cashews, cheddar, oats, hemp seeds",
    note: "Oysters contain more zinc per gram than any other food on earth. Animal zinc is significantly more bioavailable than plant zinc.",
  },
  {
    phase: "SUPPORT",
    number: "05",
    name: "Copper",
    why: "Activates lysyl oxidase — the enzyme that weaves collagen fibres together and makes them strong. Without copper, collagen forms but is weak and unstable. Copper deficiency directly affects skin elasticity.",
    rda: "1.2mg/day",
    examples: "Oysters, sesame seeds, tahini, cashews, hazelnuts, dark chocolate, walnuts",
    note: "Zinc and copper compete for absorption. If you supplement zinc, make sure your copper intake is adequate. Oysters contain both in naturally balanced proportions.",
  },
  {
    phase: "SUPPORT",
    number: "06",
    name: "Manganese",
    why: "Helps metabolise the amino acids used to build collagen and is involved in forming procollagen — the precursor to mature collagen. Also supports the broader extracellular matrix that collagen sits within.",
    rda: "1.8mg/day",
    examples: "Mussels, pine nuts, hazelnuts, pumpkin seeds, oats, brown rice, chickpeas",
    note: "Mussels are one of the richest manganese sources available — and massively underused in British cooking.",
  },
  {
    phase: "SUPPORT",
    number: "07",
    name: "Silica",
    why: "Supports the connective tissue framework that collagen sits within. Low silica levels are directly linked to reduced collagen formation. Absorption varies significantly — wholegrains are the most reliable source.",
    rda: "No official RDA — estimated 20-50mg/day",
    examples: "Brown rice, oats, sweet potato, cucumber, strawberries, carrots",
    note: "Brown rice has over double the silica of white rice. This is one reason the recipes use wholegrains rather than refined alternatives.",
  },
  {
    phase: "PROTECT",
    number: "08",
    name: "Vitamin A",
    why: "Protects collagen from breakdown, stimulates new production and improves blood circulation to skin tissue. Supports fibroblasts — the cells in your dermis that actually manufacture collagen. Fat-soluble — always pair with a healthy fat for absorption.",
    rda: "600mcg RAE/day",
    examples: "Sweet potato, carrots, butternut squash, spinach, kale, eggs, mackerel",
    note: "⚠️ Liver is very high in vitamin A — maximum once a week, avoid entirely in pregnancy.",
  },
  {
    phase: "PROTECT",
    number: "09",
    name: "Omega-3",
    why: "Reduces the chronic inflammation that destroys collagen. Maintains skin barrier integrity — affecting how plump and hydrated skin actually looks. Plant omega-3 converts to usable forms at only 5-10% efficiency. Oily fish delivers directly.",
    rda: "250-500mg EPA+DHA/day",
    examples: "Mackerel, salmon, sardines, herring, trout, anchovies, mussels",
    note: "Two portions of oily fish a week covers most people's needs. Mackerel is cheap, sustainable and criminally underrated.",
  },
  {
    phase: "PROTECT",
    number: "10",
    name: "Antioxidants",
    why: "UV, pollution, stress, poor sleep and processed food all create oxidative stress that breaks collagen down. Antioxidants neutralise the free radicals responsible. Different ones protect in different ways — vitamin E protects cell membranes, lycopene protects from UV, ellagic acid may slow breakdown, resveratrol inhibits breakdown enzymes, selenium works alongside vitamin E.",
    rda: "Vitamin E 3mg/day · Selenium 60µg/day",
    examples: "Pomegranate seeds, berries, dark chocolate, avocado, sunflower seeds, red grapes, almonds",
    note: "⚠️ Brazil nuts — 1-2 per day maximum. A small handful exceeds the safe daily selenium limit.",
  },
  {
    phase: "PROTECT",
    number: "11",
    name: "Blood sugar stability",
    why: "Sugar molecules attach to collagen fibres in a process called glycation — making them rigid, brittle and damaged. Glycated collagen cannot be repaired, only replaced. This is a major cause of skin losing elasticity and developing a dull, grey tone over time.",
    rda: "No RDA — aim for low GI foods and limit refined sugar and alcohol",
    examples: "Oats, lentils, chickpeas, brown rice, sweet potato, quinoa, leafy greens, berries, cinnamon",
    note: "Alcohol depletes both zinc and vitamin C — two of the most critical collagen cofactors. Refined sugar causes direct collagen damage through glycation.",
  },
];

function WhyThisWorksPage() {
  const [showMatrix, setShowMatrix] = useState(false);

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-secondary" />
            <p className="text-[9px] uppercase tracking-[0.32em] text-secondary">The science behind the cookbook</p>
            <div className="h-px w-6 bg-secondary" />
          </div>
          <p className="font-script text-2xl text-secondary -mb-1">Love Coylah</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight text-foreground mb-4">
            Why This Works
          </h1>
          <div className="w-8 h-px bg-secondary" />
        </div>

        {/* Coylah's story */}
        <div className="space-y-5 text-sm font-light leading-relaxed text-foreground/80 mb-10">
          <p>
            I spent ten years working in skin. I genuinely loved it — the ingredients, the formulations, the science. I was that person reading clinical studies on retinoids at midnight for fun.
          </p>
          <p>
            And I took the collagen powders. Of course I did. I recommended them. I believed in them.
          </p>
          <p>
            Then I actually started reading the research properly. Not the brand-funded stuff. The actual peer-reviewed research. And something kept coming up that nobody in the supplement industry was talking about.
          </p>
          <p className="font-normal text-foreground">
            Collagen powder delivers amino acids. That's it. Your body can only turn those amino acids into actual collagen if everything else is already in place — the vitamin C to trigger synthesis, the zinc and copper to build and cross-link the fibres, the iron to stabilise the structure, the antioxidants to protect what you've made. Without those things already present, the amino acids just get used for something else.
          </p>
          <p>
            The powders weren't the problem. The missing picture was the problem.
          </p>
          <p>
            Four years of cross-referencing nutritional databases, research papers and recipe testing later, I built The Collagen Kitchen Matrix — a complete framework mapping every food against every cofactor involved in collagen synthesis and protection. Every single recipe in this cookbook has been built using it.
          </p>
          <p>
            You don't need to understand all of it. Honestly — that's the whole point. I've done that bit so you don't have to.
          </p>
          <p>
            Follow the recipes. Use the planner. Build a Glow Bowl. Have a dessert. The matrix is working behind the scenes on every single plate.
          </p>
          <p>
            The science is here if you want it. But mostly? Just eat the food.
          </p>
          <p className="font-script text-2xl text-secondary">Love Coylah x</p>
        </div>

        {/* The four phases */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-light mb-1">The four phases</h2>
          <p className="text-sm text-muted-foreground mb-6">Every recipe is built around all four. Miss one and the whole system underperforms.</p>
          <div className="space-y-4">
            {PHASES.map((phase) => (
              <div key={phase.key} className="rounded-2xl border border-secondary/20 bg-[#fef2f4] p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-8 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                    {phase.label}
                  </span>
                  <div>
                    <p className="text-xs text-secondary font-medium tracking-wider mb-1">{phase.cofactors}</p>
                    <p className="text-sm font-light leading-relaxed text-foreground/80 mb-2">{phase.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/60">You'll see these throughout the cookbook:</span> {phase.foods}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix toggle */}
        <div className="rounded-2xl border border-border bg-card mb-8">
          <button
            onClick={() => setShowMatrix(v => !v)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div>
              <h2 className="font-serif text-xl font-light">Inside the Collagen Kitchen Matrix</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Examples from the nutritional framework used to build every recipe in this cookbook.
              </p>
            </div>
            {showMatrix
              ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            }
          </button>

          {showMatrix && (
            <div className="border-t border-border px-6 pb-6 pt-5 space-y-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every recipe has been built using the complete Collagen Kitchen Matrix — every food mapped against every cofactor across all four phases. Below are examples of the foods you'll regularly see throughout the cookbook and exactly why they've earned their place.
              </p>
              {MATRIX_SECTIONS.map((s) => (
                <div key={s.number} className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-semibold text-secondary">
                      {s.number}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-secondary font-medium">{s.phase}</span>
                  </div>
                  <h3 className="font-serif text-lg font-light mb-2">{s.name}</h3>
                  <p className="text-sm font-light leading-relaxed text-foreground/80 mb-3">{s.why}</p>
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/60">Daily target:</span> {s.rda}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/60">Examples include:</span> {s.examples}
                    </p>
                    {s.note && (
                      <p className="text-[11px] text-secondary/80 italic mt-1">{s.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This page is an educational guide, not medical advice. Always speak to your GP before making significant dietary changes — especially during pregnancy, if you have a health condition, or if you take medication. Figures referenced from USDA FoodData Central, UK CoFID and peer-reviewed research.{" "}
            <span className="font-medium text-foreground/60">
              ⚠️ Liver: maximum once a week, avoid in pregnancy. Brazil nuts: 1-2 per day maximum.
            </span>
          </p>
          <Link to="/bone-broth" className="mt-3 inline-block text-xs text-secondary hover:underline underline-offset-2">
            Read about bone broth — the most direct collagen food in this cookbook →
          </Link>
        </div>

      </article>
    </AppShell>
  );
}

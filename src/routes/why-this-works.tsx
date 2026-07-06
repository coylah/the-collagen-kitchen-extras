import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    color: "bg-[#fef2f4] border-secondary/20",
    cofactors: "Glycine · Proline · Lysine",
    description: "The raw material. Your body cannot make collagen without these three amino acids. They come from protein — meat, fish, eggs, dairy and bone broth.",
    foods: "Chicken, salmon, sardines, eggs, cottage cheese, bone broth, Greek yoghurt",
  },
  {
    key: "activate",
    label: "ACTIVATE",
    color: "bg-[#fef2f4] border-secondary/20",
    cofactors: "Vitamin C · Iron",
    description: "The spark. Vitamin C and iron trigger the enzymes that convert those amino acids into stable collagen fibres. Without vitamin C, synthesis stops completely. This is literally what scurvy is.",
    foods: "Red pepper, kiwi, broccoli, strawberries, blackcurrants, sardines, lentils, spinach",
  },
  {
    key: "support",
    label: "SUPPORT",
    color: "bg-[#fef2f4] border-secondary/20",
    cofactors: "Zinc · Copper · Manganese · Silica",
    description: "The enablers. Zinc activates the building enzymes. Copper cross-links the fibres to make them strong. Manganese supports the amino acid metabolism needed. Silica supports the connective tissue framework collagen sits within.",
    foods: "Pumpkin seeds, sesame seeds, oats, walnuts, dark chocolate, brown rice, cashews",
  },
  {
    key: "protect",
    label: "PROTECT",
    color: "bg-[#fef2f4] border-secondary/20",
    cofactors: "Vitamin A · Omega-3 · Antioxidants · Blood sugar stability",
    description: "The defenders. Vitamin A protects and regenerates. Omega-3 reduces the inflammation that destroys collagen. Antioxidants neutralise oxidative damage. Stable blood sugar prevents glycation — where sugar literally attaches to collagen fibres and makes them stiff and brittle.",
    foods: "Avocado, mackerel, sweet potato, berries, leafy greens, dark chocolate, oily fish",
  },
];

const MATRIX_SECTIONS = [
  {
    phase: "BUILD",
    number: "01",
    name: "Protein — glycine, proline and lysine",
    why: "The amino acids collagen is literally made from. Without them your body cannot form collagen at all. Glycine makes up one third of the collagen structure.",
    rda: "45g protein/day minimum — more if active",
    top: "Tuna (30g/100g), turkey (29g), chicken (27g), beef (26g), salmon (25g), sardines (25g), eggs (13g)",
    note: "Animal protein delivers glycine, proline and lysine most efficiently. Gelatine and bone broth deliver these in their already-processed form.",
  },
  {
    phase: "ACTIVATE",
    number: "02",
    name: "Vitamin C",
    why: "Activates the enzymes that convert amino acids into stable collagen. Without it, synthesis stops. The recommended 75-90mg/day is a minimum — research suggests 200-500mg better supports collagen.",
    rda: "75-90mg/day",
    top: "Guava (228mg/100g), blackcurrants (181mg), yellow pepper (184mg), red pepper (128mg), kale (120mg), kiwi (93mg), broccoli (89mg)",
    note: "Raw or lightly cooked is best — vitamin C degrades with prolonged heat.",
  },
  {
    phase: "ACTIVATE",
    number: "03",
    name: "Iron",
    why: "Works alongside vitamin C in the same hydroxylation enzymes. Without iron these enzymes don't function properly even if vitamin C is plentiful. Iron deficiency is one of the most common deficiencies in women.",
    rda: "14.8mg/day (reproductive age) · 8.7mg/day (post-menopause)",
    top: "Clams (28mg/100g), pumpkin seeds (8.8mg), sesame seeds (8-9mg), sardines (2.9mg), beef (2.6-3mg), lentils (3.3mg cooked)",
    note: "⚠️ Liver is very high in iron but maximum once a week. Avoid entirely in pregnancy. Always pair plant iron sources with vitamin C to boost absorption.",
  },
  {
    phase: "SUPPORT",
    number: "04",
    name: "Zinc",
    why: "Activates the enzymes that build and renew collagen. Cannot be stored — you need it daily. Many women are quietly deficient, particularly during perimenopause.",
    rda: "7mg/day for women",
    top: "Oysters (16-90mg/100g), beef (4-8mg), pumpkin seeds (7-8mg), cashews (5.6mg), cheddar (3-4mg), oats (2-3mg)",
    note: "Animal zinc is significantly more bioavailable than plant zinc.",
  },
  {
    phase: "SUPPORT",
    number: "05",
    name: "Copper",
    why: "Activates lysyl oxidase — the enzyme that weaves collagen fibres together and makes them strong. Without copper, collagen forms but is weak and unstable.",
    rda: "1.2mg/day",
    top: "Oysters (4-8mg/100g), sesame seeds/tahini (4mg), cashews (2.2mg), hazelnuts (1.7mg), dark chocolate (1-2mg), walnuts (1.6mg)",
    note: "Zinc and copper compete for absorption — if you supplement zinc, make sure copper intake is adequate.",
  },
  {
    phase: "SUPPORT",
    number: "06",
    name: "Manganese",
    why: "Helps the body metabolise the amino acids used to build collagen and is involved in forming procollagen — the precursor to mature collagen.",
    rda: "1.8mg/day",
    top: "Mussels (6-7mg/100g), pine nuts (8mg), hazelnuts (6mg), pumpkin seeds (4.5mg), oats (4-5mg), brown rice (1-2mg cooked)",
    note: "Mussels are one of the richest manganese sources available and are massively underused.",
  },
  {
    phase: "SUPPORT",
    number: "07",
    name: "Silica",
    why: "Supports the connective tissue framework that collagen sits within. Low silica levels are directly linked to reduced collagen formation and signs of premature skin ageing.",
    rda: "No official RDA — estimated 20-50mg/day",
    top: "Brown rice (~1240mg/100g), oats (~595mg), sweet potato (~12mg), cucumber (~7mg), carrots (~5mg), strawberries (~5mg)",
    note: "Brown rice has over double the silica of white rice. Wholegrains are the most reliable source.",
  },
  {
    phase: "PROTECT",
    number: "08",
    name: "Vitamin A",
    why: "Protects collagen from breakdown, stimulates new production and improves blood circulation to skin tissue. Supports fibroblasts — the cells that manufacture collagen in your dermis.",
    rda: "600mcg RAE/day",
    top: "Sweet potato (961mcg/100g), carrots (835mcg), butternut squash (532mcg), spinach (469mcg), eggs (148mcg preformed)",
    note: "⚠️ Liver is very high in preformed vitamin A — maximum once a week. Avoid in pregnancy. Always pair beta-carotene vegetables with a healthy fat for absorption.",
  },
  {
    phase: "PROTECT",
    number: "09",
    name: "Omega-3",
    why: "Reduces the chronic inflammation that destroys collagen. Maintains skin barrier integrity. Plant omega-3 (ALA) converts to the usable forms at only 5-10% efficiency — oily fish delivers directly.",
    rda: "250-500mg EPA+DHA/day",
    top: "Mackerel (2.5-5g/100g), salmon (1.5-2.5g), sardines (1.4-2g), herring (1.7-2.4g), trout (0.9-1.2g)",
    note: "Two portions of oily fish a week covers most people's omega-3 needs entirely.",
  },
  {
    phase: "PROTECT",
    number: "10",
    name: "Antioxidants",
    why: "Protect existing collagen from oxidative damage. Includes vitamin E (cell membrane protection), lycopene (UV protection), ellagic acid (may slow breakdown), resveratrol (inhibits breakdown enzymes) and selenium (works with vitamin E).",
    rda: "Vitamin E 3mg/day · Selenium 60µg/day",
    top: "Pomegranate seeds, berries, dark chocolate (70%+), avocado, sunflower seeds, almonds, red/purple grapes",
    note: "⚠️ Brazil nuts are very high in selenium — 1-2 per day maximum. A small handful exceeds the safe daily limit.",
  },
  {
    phase: "PROTECT",
    number: "11",
    name: "Blood sugar stability",
    why: "Sugar molecules attach to collagen fibres (glycation) making them rigid and damaged. This is a major cause of skin losing elasticity. Stable blood sugar prevents this happening.",
    rda: "No RDA — aim for low GI foods and limit refined sugar",
    top: "Oats, lentils, chickpeas, brown rice, sweet potato, quinoa, leafy greens, berries",
    note: "Alcohol depletes both zinc and vitamin C — two of the most critical collagen cofactors. Refined sugar causes direct collagen damage through glycation.",
  },
];

function WhyThisWorksPage() {
  const [showMatrix, setShowMatrix] = useState(false);
  const [accepted, setAccepted] = useState(false);

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
            I spent ten years working in skin. I took the powders. I recommended the powders. I genuinely believed in the powders.
          </p>
          <p>
            Then I started actually reading the research.
          </p>
          <p>
            Collagen powder delivers amino acids — and that's it. Your body can only turn those amino acids into actual collagen if everything else is already in place. The vitamin C to trigger synthesis. The zinc and copper to build and cross-link the fibres. The iron to stabilise the structure. The antioxidants to protect what you've made. Without those things, the amino acids just get used for something else entirely.
          </p>
          <p>
            That was the missing piece. Not the collagen — but everything your body needs alongside it to actually use it.
          </p>
          <p>
            Four years of cross-referencing research papers, nutritional databases and recipe testing later, this is what I built.
          </p>
          <p className="font-normal text-foreground">
            Every recipe in this cookbook is built around four phases — Build, Activate, Support, Protect. Inside those four phases live eleven specific nutrients your body needs to make collagen properly. Complex? A bit. But you don't need to understand all of it. That's what this cookbook is for.
          </p>
          <p>
            Follow the recipes. Use the planner. Build a Glow Bowl. Have a dessert. Every single thing in here has been lovingly thought through to make sure you're hitting every cofactor, every phase, every week — without the guesswork, without the confusion, and without spending a fortune on half the solution.
          </p>
          <p>
            The science is here if you want it. But mostly? Just eat the food.
          </p>
          <p className="font-script text-2xl text-secondary">Love Coylah x</p>
        </div>

        {/* The four phases */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-light mb-1">The four phases</h2>
          <p className="text-sm text-muted-foreground mb-6">Eleven cofactors. Four phases. One system.</p>
          <div className="space-y-4">
            {PHASES.map((phase) => (
              <div key={phase.key} className={`rounded-2xl border p-6 ${phase.color}`}>
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-8 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                    {phase.label}
                  </span>
                  <div>
                    <p className="text-xs text-secondary font-medium tracking-wider mb-1">{phase.cofactors}</p>
                    <p className="text-sm font-light leading-relaxed text-foreground/80 mb-2">{phase.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/60">Key foods:</span> {phase.foods}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full matrix toggle */}
        <div className="rounded-2xl border border-border bg-card mb-8">
          <button
            onClick={() => setShowMatrix(v => !v)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div>
              <h2 className="font-serif text-xl font-light">The full collagen matrix</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Every cofactor. Every food. Ordered by amount per realistic portion.
              </p>
            </div>
            {showMatrix
              ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            }
          </button>

          {showMatrix && (
            <div className="border-t border-border px-6 pb-6 pt-5 space-y-8">
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
                      <span className="font-medium text-foreground/60">Best sources:</span> {s.top}
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
            This page is an educational guide, not medical advice. Always speak to your GP before making significant dietary changes — especially during pregnancy, if you have a health condition, or if you take medication. Figures sourced from USDA FoodData Central, UK CoFID and peer-reviewed research.{" "}
            <span className="font-medium text-foreground/60">
              ⚠️ Liver: maximum once a week, avoid in pregnancy.
              Brazil nuts: 1-2 per day maximum.
            </span>
          </p>
        </div>

      </article>
    </AppShell>
  );
}

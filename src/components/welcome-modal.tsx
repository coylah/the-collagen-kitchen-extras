import { useState, useEffect } from "react";
import { BookOpen, Heart, CalendarDays, ShoppingBasket, Salad, X, Smartphone } from "lucide-react";

const STORAGE_KEY = "ck.welcomed";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showFaq, setShowFaq] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    setShowFaq(false);
    setStep(0);
  }

  if (!open) return null;

  const steps = [
    {
      icon: <BookOpen className="h-8 w-8 text-secondary" />,
      title: "Your cookbook",
      body: "Every single recipe in here is real food that actively feeds your glow — collagen, vitamin C, healthy fats, antioxidants. Browse by meal type, search by ingredient, or just have a nose around. There's a lot to love.\n\nWhen you're cooking, tap each ingredient or step to tick it off as you go. No more losing your place halfway through.",
    },
    {
      icon: <Heart className="h-8 w-8 text-secondary" />,
      title: "Save what you love",
      body: "See a recipe that's calling your name? Tap the little heart and it saves straight to your Saved tab. It'll be waiting for you every time you come back — no scrolling, no searching, just your favourites ready to go.",
    },
    {
      icon: <CalendarDays className="h-8 w-8 text-secondary" />,
      title: "Plan your week",
      body: "Add recipes to your weekly planner — breakfast, lunch, dinner, snacks — and your shopping list builds itself automatically. Tap any slot to add a meal. Tap the little x to remove it. Job done.\n\nNo more staring into the fridge wondering what to make.",
    },
    {
      icon: <ShoppingBasket className="h-8 w-8 text-secondary" />,
      title: "Your shopping list",
      body: "Everything from your planner comes together in one clean list, grouped by category and ready to shop. Tap items to tick them off as you go, or tap \"I have\" to move them out of the way.\n\nNeed to add anything else for the week? Type it straight into the list — it becomes a checkbox item just like everything else.",
    },
    {
      icon: <Salad className="h-8 w-8 text-secondary" />,
      title: "Build a Glow Bowl",
      body: "This one's a proper treat. Tap your way through six steps — Support, Build, Activate, Protect, Fortify, Finish — and you've built yourself a collagen-supporting lunch from whatever's in your fridge.\n\nThere's also a Yoghurt Bowl Builder for breakfast. Ten ready-made combinations to start from, or go completely your own way.",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-secondary" />,
      title: "Save to your home screen",
      body: "One last thing — save this to your phone's home screen so it's always one tap away, just like an app.\n\nOn iPhone: tap the Share button at the bottom of your browser, then tap \"Add to Home Screen.\"\n\nOn Android: tap the three dots menu at the top right, then tap \"Add to Home Screen.\"\n\nNo App Store needed.",
    },
  ];

  const faqs = [
    { q: "How do I add recipes to my meal plan?", a: "Open any recipe and tap \"Add to meal plan\" — then pick the day and slot. Or go straight to the Planner tab and tap any empty slot to choose from the full recipe list." },
    { q: "How do I clear my planner?", a: "Go to the Planner tab and tap \"Clear week\" in the top right. This clears your meals but never touches your saved favourites." },
    { q: "Why are some shopping list items generated automatically?", a: "Your shopping list builds from whatever you've added to your planner. Remove a recipe from the planner and those ingredients disappear from the list automatically." },
    { q: "How do I clear my shopping list?", a: "Tap \"Clear extras & manual\" to remove bowl extras and anything you've typed in manually. To clear the planner ingredients, go to the Planner and clear your week from there." },
    { q: "Can I add my own extras like coffee or milk?", a: "Yes — scroll to the bottom of the shopping list and type anything into the \"Add anything else\" box. It becomes a tappable checkbox item on your list." },
    { q: "Can I save recipes?", a: "Yes — tap the heart on any recipe card or recipe page to save it. Find everything you've saved under the Saved tab." },
    { q: "Can I personalise my Glow Bowl or Yoghurt Bowl?", a: "Absolutely. Pick from the presets to get started then tap any ingredient to swap it out. Your bowl summary updates as you go." },
    { q: "How do I use this like an app on my phone?", a: "On iPhone, tap the Share button in your browser and select \"Add to Home Screen.\" On Android, tap the three dots menu and select \"Add to Home Screen.\" It'll sit on your phone just like a regular app." },
    { q: "I need help with something else.", a: "Email us at hello@lovecoylah.com — we're always happy to help." },
  ];

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-xl max-h-[90vh] overflow-y-auto">

        <button
          onClick={close}
          className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-accent z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {!showFaq ? (
          <>
            {/* Welcome header — first step only */}
            {isFirst && (
              <div className="border-b border-border px-8 pt-8 pb-5 text-center">
                <p className="font-script text-2xl text-secondary">Love Coylah</p>
                <h2 className="mt-1 font-serif text-2xl font-light">Welcome, my lovely.</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  You've just unlocked The Collagen Kitchen — your personal skin-food cookbook, meal planner and weekly shopping list, all in one place and all built around your skin.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Let me show you around. Tap through — I promise it's quick.
                </p>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center pt-5 px-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-secondary" : i < step ? "w-1.5 bg-secondary/40" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="px-8 py-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary/10">
                  {current.icon}
                </div>
              </div>
              <h3 className="font-serif text-xl mb-3">{current.title}</h3>
              <div className="text-sm text-muted-foreground leading-relaxed text-left space-y-3">
                {current.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-8 pb-4">
              {!isFirst && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                >
                  Back
                </button>
              )}
              {!isLast ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex-1 rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={close}
                  className="flex-1 rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  I'm ready — show me the recipes! →
                </button>
              )}
            </div>

            <div className="pb-5 flex items-center justify-center gap-4">
              {!isLast && (
                <button onClick={close} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Skip intro
                </button>
              )}
              <button onClick={() => setShowFaq(true)} className="text-xs text-secondary hover:underline underline-offset-2">
                FAQs & help
              </button>
            </div>
          </>
        ) : (
          <>
            {/* FAQ section */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-light">How to use this</h2>
                <button onClick={() => setShowFaq(false)} className="text-xs text-secondary hover:underline">
                  ← Back
                </button>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-border/60 pb-4 last:border-0">
                    <p className="text-sm font-medium text-foreground mb-1">{faq.q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-secondary/5 border border-secondary/20 p-4 text-center">
                <p className="text-sm text-muted-foreground">Need more help?</p>
                <a href="mailto:hello@lovecoylah.com" className="text-sm text-secondary font-medium hover:underline">
                  hello@lovecoylah.com
                </a>
              </div>
              <button
                onClick={close}
                className="mt-4 w-full rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                Got it — take me to the recipes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

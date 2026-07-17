import { useState, useEffect } from "react";
import { X, Smartphone, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "ck.welcomed";
const FAQ_DIRECT_KEY = "ck.openFaqDirect";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showFaq, setShowFaq] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    const wantsFaq = localStorage.getItem(FAQ_DIRECT_KEY);

    if (wantsFaq) {
      localStorage.removeItem(FAQ_DIRECT_KEY);
      setShowFaq(true);
      setOpen(true);
    } else if (!seen) {
      setOpen(true);
    }
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
      image: "/images/coylah.jpg",
      title: "Welcome to The Collagen Kitchen",
      subtitle: "Real food. Real glow.",
      body: "Everything here is built around your skin.",
    },
    {
      image: "/images/salmon.jpg",
      title: "Eat for your skin",
      body: "Every recipe is designed to support collagen, strengthen your skin barrier, and build your glow.",
    },
    {
      title: "Everything in one place",
      body: "Cook. Plan. Shop. All connected.",
      features: [
        { title: "Recipes", desc: "Collagen-rich meals to fuel your glow." },
        { title: "Planner", desc: "Plan your meals your way." },
        { title: "Shopping", desc: "Smart lists that build themselves." },
      ],
    },
    {
      image: "/images/glow-bowl.jpg",
      title: "Build your Glow Bowl",
      body: "A simple system to create collagen-supporting meals — without thinking about it.",
    },
    {
      title: "Save to your home screen",
      body: "One tap access. Just like a real app.",
    },
  ];

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">

        {/* Close */}
        <button
          onClick={close}
          className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:bg-gray-100 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {!showFaq ? (
          <>
            {/* Progress dots */}
            <div className="flex gap-2 justify-center pt-5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-6 bg-red-500"
                      : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* CONTENT */}
            <div className="py-6 text-center">

              {/* IMAGE */}
              {current.image && (
                <img
                  src={current.image}
                  alt=""
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="px-8 mt-4">

                <h3 className="font-serif text-2xl mb-2">
                  {current.title}
                </h3>

                {current.subtitle && (
                  <p className="text-sm text-gray-500 mb-3">
                    {current.subtitle}
                  </p>
                )}

                {current.body && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {current.body}
                  </p>
                )}

                {current.features && (
                  <div className="mt-5 space-y-3 text-left">
                    {current.features.map((f, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <p className="text-sm font-medium">{f.title}</p>
                        <p className="text-xs text-gray-500">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 px-6 pb-4">
              {!isFirst && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 border rounded-lg py-2.5 text-sm text-gray-500"
                >
                  Back
                </button>
              )}

              {!isLast ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={close}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium"
                >
                  I'm ready →
                </button>
              )}
            </div>

            {/* FOOTER */}
            <div className="pb-5 flex justify-center gap-4 text-xs">
              {!isLast && (
                <button onClick={close} className="text-gray-500 underline">
                  Skip intro
                </button>
              )}
              <button onClick={() => setShowFaq(true)} className="text-red-500 underline">
                FAQs & help
              </button>
            </div>

          </>
        ) : (
          <>
            <div className="px-6 py-8 text-center">
              <h2 className="font-serif text-2xl mb-4">FAQs</h2>

              <p className="text-sm text-gray-500 mb-6">
                Need help? We've got you.
              </p>

              <Link
                to="/why-this-works"
                onClick={close}
                className="inline-flex items-center gap-2 text-red-500 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Why This Works →
              </Link>

              <button
                onClick={close}
                className="mt-6 w-full bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium"
              >
                Take me to recipes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

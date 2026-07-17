import { useState } from "react";
import { BookOpen, Calendar, ShoppingBasket, Smartphone, ChevronRight, ArrowRight } from "lucide-react";

const BRAND_RED = "#9c1a35";

const slides = [
  {
    title: "Welcome to\nThe Collagen Kitchen",
    signature: "Love Coylah",
    description: "Real food. Real glow.\nBuilt around your skin.",
    image: "/images/coylah.jpg",
    cta: "Start",
    isHero: true,
  },
  {
    title: "Food that\nfuels your skin",
    description:
      "Every recipe is designed to support collagen, strengthen your skin barrier, and build your glow.",
    image: "/images/salmon.jpg",
    cta: "Next",
  },
  {
    title: "Everything\nin one place",
    description: "Cook. Plan. Shop.\nAll connected.",
    icon: BookOpen,
    isContentOnly: true,
    cta: "Next",
    listItems: [
      { icon: BookOpen, title: "Recipes", description: "Collagen-rich meals to fuel your glow." },
      { icon: Calendar, title: "Planner", description: "Plan your meals, your way." },
      { icon: ShoppingBasket, title: "Shopping", description: "Smart lists that shop themselves." },
    ],
  },
  {
    title: "Build your\nGlow Bowl",
    description:
      "A simple system to create collagen-supporting meals — without overthinking it.",
    image: "/images/thai-green.jpg",
    cta: "Next",
  },
  {
    title: "Save to your\nhome screen",
    description: "One tap access.\nJust like a real app.",
    icon: Smartphone,
    isContentOnly: true,
    isFinal: true,
    cta: "I'm ready",
  },
];

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const Icon = slide.icon;

  const next = () => {
    if (step === slides.length - 1) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  const back = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-xl z-10 w-7 h-7 flex items-center justify-center"
        >
          ×
        </button>

        <div className="flex justify-center gap-2 pt-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === step ? "24px" : "8px",
                backgroundColor: i === step ? BRAND_RED : "#d1d5db",
              }}
            />
          ))}
        </div>

        <div className="flex flex-col min-h-[560px]">
          {!slide.isContentOnly && slide.image && (
            <div className="h-[42%] overflow-hidden bg-gray-100">
              <img
                src={slide.image}
                className={`w-full h-full object-cover ${slide.isHero ? "object-top" : ""}`}
              />
            </div>
          )}

          {slide.isContentOnly && Icon && (
            <div className="flex justify-center pt-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_RED}1a` }}
              >
                <Icon size={28} color={BRAND_RED} strokeWidth={1.75} />
              </div>
            </div>
          )}

          <div className="flex flex-col justify-between flex-1 p-6 text-center">
            <div>
              {slide.signature && (
                <p
                  className="font-serif italic text-lg mb-1"
                  style={{ color: BRAND_RED }}
                >
                  {slide.signature}
                </p>
              )}

              <h2 className="text-2xl font-serif leading-tight whitespace-pre-line mb-3">
                {slide.title}
              </h2>

              <div
                className="w-8 h-[2px] mx-auto mb-3"
                style={{ backgroundColor: BRAND_RED }}
              />

              {slide.description && (
                <p className="text-gray-500 text-sm whitespace-pre-line">
                  {slide.description}
                </p>
              )}

              {slide.listItems && (
                <div className="mt-6 space-y-3 text-left">
                  {slide.listItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 border border-gray-200 rounded-xl p-3"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${BRAND_RED}1a` }}
                        >
                          <ItemIcon size={18} color={BRAND_RED} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    );
                  })}
                </div>
              )}

              {slide.isFinal && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-xl bg-white shadow flex flex-col items-center justify-center border border-gray-100">
                      <span
                        className="font-serif italic text-sm"
                        style={{ color: BRAND_RED }}
                      >
                        LC
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-medium shrink-0">On iPhone:</span>
                    <span className="text-gray-500">
                      Tap the Share button, then "Add to Home Screen".
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-medium shrink-0">On Android:</span>
                    <span className="text-gray-500">
                      Tap the three-dot menu, then "Add to Home Screen".
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {step > 0 && (
                <button
                  onClick={back}
                  className="w-full border border-gray-300 rounded-xl py-3 text-gray-500 text-sm"
                >
                  Back
                </button>
              )}

              <button
                onClick={next}
                className="w-full text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND_RED }}
              >
                {slide.cta}
                <ArrowRight size={16} />
              </button>

              <div className="text-xs text-gray-400 pt-1">Skip intro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

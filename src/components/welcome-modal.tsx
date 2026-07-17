import { useState } from "react";

const slides = [
  {
    title: "Welcome to The Collagen Kitchen",
    subtitle: "Real food. Real glow.",
    description: "Everything here is built around your skin.",
    image: "/images/coylah.jpg",
    cta: "Start",
    isHero: true,
  },
  {
    title: "Eat for your skin",
    subtitle: "",
    description:
      "Every recipe is designed to support collagen, strengthen your skin barrier, and build your glow.",
    image: "/images/salmon.jpg",
    cta: "Next",
  },
  {
    title: "Everything in one place",
    subtitle: "",
    description: "Cook. Plan. Shop. All connected.",
    cta: "Next",
    isContentOnly: true,
  },
  {
    title: "Build your Glow Bowl",
    subtitle: "",
    description:
      "A simple system to create collagen-supporting meals — without thinking about it.",
    image: "/images/thai-green.jpg",
    cta: "Next",
  },
  {
    title: "Save to your home screen",
    subtitle: "One tap access. Just like a real app.",
    description: "",
    cta: "I’m ready →",
  },
];

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const slide = slides[step];

  const next = () => {
    if (step === slides.length - 1) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  const back = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-xl z-10"
        >
          ×
        </button>

        <div className="flex justify-center gap-2 pt-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-6 bg-red-500" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col h-[520px]">

          {!slide.isContentOnly && slide.image && (
            <div className="h-[45%] overflow-hidden">
              <img
                src={slide.image}
                className={`w-full h-full ${
                  slide.isHero
                    ? "object-cover object-top"
                    : "object-cover"
                }`}
              />
            </div>
          )}

          <div className="flex flex-col justify-between flex-1 p-6 text-center">

            <div>
              <h2 className="text-2xl font-serif mb-2">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="text-gray-500 mb-2">
                  {slide.subtitle}
                </p>
              )}

              {slide.description && (
                <p className="text-gray-500 text-sm">
                  {slide.description}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3">

              {step > 0 && (
                <button
                  onClick={back}
                  className="w-full border border-gray-300 rounded-xl py-3 text-gray-500"
                >
                  Back
                </button>
              )}

              <button
                onClick={next}
                className="w-full bg-red-500 text-white rounded-xl py-3 font-medium"
              >
                {slide.cta}
              </button>

              <div className="text-xs text-gray-400 pt-2">
                Skip intro &nbsp; • &nbsp; FAQs & help
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

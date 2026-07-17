import { useState } from "react";
import {
  BookOpen,
  Calendar,
  ShoppingBasket,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Share,
  MoreVertical,
  X,
} from "lucide-react";

const BRAND_RED = "#9c1a35";
const BRAND_RED_TINT = "#9c1a351a";

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
    isFinal: true,
    cta: "I'm ready!",
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
  const skip = () => onClose();

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top bar: dots + close */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div className="w-7" />
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? "22px" : "6px",
                backgroundColor: i === step ? BRAND_RED : "#e5e7eb",
              }}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Media block — same fixed height on every slide */}
      <div className="h-[38vh] shrink-0 overflow-hidden bg-white flex items-center justify-center">
        {slide.image ? (
          <img
            src={slide.image}
            className={`w-full h-full object-cover ${slide.isHero ? "object-top" : ""}`}
          />
        ) : Icon ? (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND_RED_TINT }}
          >
            <Icon size={32} color={BRAND_RED} strokeWidth={1.5} />
          </div>
        ) : null}
      </div>

      {/* Scrollable content — fills remaining space, never changes the outer frame size */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 text-center">
        {slide.signature && (
          <p className="font-serif italic text-lg mb-1" style={{ color: BRAND_RED }}>
            {slide.signature}
          </p>
        )}

        <h2 className="text-[26px] font-serif leading-tight whitespace-pre-line mb-3">
          {slide.title}
        </h2>

        <div className="w-8 h-[2px] mx-auto mb-3" style={{ backgroundColor: BRAND_RED }} />

        {slide.description && (
          <p className="text-gray-500 text-sm whitespace-pre-line max-w-xs mx-auto">
            {slide.description}
          </p>
        )}

        {slide.listItems && (
          <div className="mt-6 space-y-3 text-left max-w-xs mx-auto">
            {slide.listItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 border border-gray-200 rounded-xl p-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: BRAND_RED_TINT }}
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
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-gray-100"
              >
                <span className="font-serif italic text-lg" style={{ color: BRAND_RED }}>
                  LC
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-4">The Collagen Kitchen</p>

            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: BRAND_RED_TINT }}
                >
                  <Share size={14} color={BRAND_RED} />
                </div>
                <p className="text-xs text-gray-500 pt-1.5">
                  <span className="font-medium text-gray-700">On iPhone: </span>
                  Tap the Share button, then "Add to Home Screen".
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: BRAND_RED_TINT }}
                >
                  <MoreVertical size={14} color={BRAND_RED} />
                </div>
                <p className="text-xs text-gray-500 pt-1.5">
                  <span className="font-medium text-gray-700">On Android: </span>
                  Tap the three-dot menu, then "Add to Home Screen".
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed footer — always same position */}
      <div className="px-6 pb-8 pt-3 space-y-2 shrink-0">
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
          className="w-full text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: BRAND_RED }}
        >
          {slide.cta}
          <ArrowRight size={16} />
        </button>

        <button onClick={skip} className="w-full text-xs text-gray-400 pt-1">
          Skip
        </button>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Top bar: dots + close */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
        <div className="w-6" />
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? "20px" : "6px",
                backgroundColor: i === step ? BRAND_RED : "#e5e7eb",
              }}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* Media block — small, fixed, same on every slide */}
      <div className="h-[130px] shrink-0 overflow-hidden bg-white flex items-center justify-center">
        {slide.image ? (
          <img
            src={slide.image}
            className={`w-full h-full object-cover ${slide.isHero ? "object-top" : ""}`}
          />
        ) : Icon ? (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND_RED_TINT }}
          >
            <Icon size={24} color={BRAND_RED} strokeWidth={1.5} />
          </div>
        ) : null}
      </div>

      {/* Content — fills remaining space, vertically centered, no scroll needed */}
      <div className="flex-1 min-h-0 flex flex-col justify-center px-6 text-center overflow-y-auto">
        {slide.signature && (
          <p className="font-serif italic text-base mb-0.5" style={{ color: BRAND_RED }}>
            {slide.signature}
          </p>
        )}

        <h2 className="text-xl font-serif leading-tight whitespace-pre-line mb-2">
          {slide.title}
        </h2>

        <div className="w-7 h-[2px] mx-auto mb-2" style={{ backgroundColor: BRAND_RED }} />

        {slide.description && (
          <p className="text-gray-500 text-[13px] leading-snug whitespace-pre-line max-w-xs mx-auto">
            {slide.description}
          </p>
        )}

        {slide.listItems && (
          <div className="mt-3 space-y-1.5 text-left max-w-xs mx-auto w-full">
            {slide.listItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-2.5 py-2"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: BRAND_RED_TINT }}
                  >
                    <ItemIcon size={15} color={BRAND_RED} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium leading-tight">{item.title}</p>
                    <p className="text-[10.5px] text-gray-500 leading-tight truncate">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {slide.isFinal && (
          <div className="mt-3 max-w-xs mx-auto w-full">
            <div className="flex justify-center mb-1">
              <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
                <span className="font-serif italic text-sm" style={{ color: BRAND_RED }}>
                  LC
                </span>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-700 mb-2.5">The Collagen Kitchen</p>

            <div className="text-left space-y-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: BRAND_RED_TINT }}
                >
                  <Share size={11} color={BRAND_RED} />
                </div>
                <p className="text-[10.5px] text-gray-500 leading-tight">
                  <span className="font-medium text-gray-700">iPhone: </span>
                  Share button → "Add to Home Screen"
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: BRAND_RED_TINT }}
                >
                  <MoreVertical size={11} color={BRAND_RED} />
                </div>
                <p className="text-[10.5px] text-gray-500 leading-tight">
                  <span className="font-medium text-gray-700">Android: </span>
                  Menu → "Add to Home Screen"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed footer */}
      <div className="px-6 pb-6 pt-2 space-y-1.5 shrink-0">
        {step > 0 && (
          <button
            onClick={back}
            className="w-full border border-gray-300 rounded-xl py-2.5 text-gray-500 text-sm"
          >
            Back
          </button>
        )}

        <button
          onClick={next}
          className="w-full text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: BRAND_RED }}
        >
          {slide.cta}
          <ArrowRight size={15} />
        </button>

        <button onClick={skip} className="w-full text-[11px] text-gray-400 pt-0.5">
          Skip
        </button>
      </div>
    </div>
  );
}

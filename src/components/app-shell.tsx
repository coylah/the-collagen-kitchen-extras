import { Link } from "@tanstack/react-router";
import { Heart, BookOpen, CalendarDays, ShoppingBasket, HelpCircle, FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import WelcomeModal from "@/components/welcome-modal";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function AppShell({ children }: { children: ReactNode }) {
  const [hasWelcomed, setHasWelcomed, hasWelcomedLoaded] = useLocalStorage("ck.welcomed", false);
  const [showWelcome, setShowWelcome, showWelcomeLoaded] = useLocalStorage("ck.showWelcome", true);

  // Only decide to show the modal once both flags have actually loaded from
  // localStorage (post-hydration). Before that, isOpen is false on both
  // server and client, so there's nothing for React to mismatch on.
  const isOpen = hasWelcomedLoaded && showWelcomeLoaded && !hasWelcomed && showWelcome;

  return (
    <div className="min-h-screen flex flex-col">
      {isOpen && (
        <WelcomeModal
          onClose={() => {
            setHasWelcomed(true);
            setShowWelcome(false);
          }}
        />
      )}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  function openFaq() {
    localStorage.setItem("ck.welcomed", "1");
    localStorage.setItem("ck.openFaqDirect", "1");
    window.location.reload();
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-white/98 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-script text-base text-secondary -mb-1">Love Coylah</span>
          <span className="font-serif text-lg font-light tracking-tight text-foreground">
            The Collagen Kitchen
          </span>
        </Link>
      </div>
      <nav className="grid grid-cols-6 border-t border-border">
        <NavLink to="/" icon={<BookOpen className="h-4 w-4" />} label="Recipes" />
        <NavLink to="/planner" icon={<CalendarDays className="h-4 w-4" />} label="Planner" />
        <NavLink to="/shopping" icon={<ShoppingBasket className="h-4 w-4" />} label="Shopping" />
        <NavLink to="/favourites" icon={<Heart className="h-4 w-4" />} label="Saved" />
        <NavLink to="/why-this-works" icon={<FlaskConical className="h-4 w-4" />} label="Science" />
        <button
          onClick={openFaq}
          className="flex flex-col items-center gap-0.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-[8px] uppercase tracking-wide">FAQs</span>
        </button>
      </nav>
    </header>
  );
}

function Footer() {
  function resetOnboarding() {
    localStorage.removeItem("ck.welcomed");
    localStorage.removeItem("ck.showWelcome");
    window.location.reload();
  }

  return (
    <footer className="no-print mt-2 border-t border-border py-5 text-center">
      <p className="font-script text-2xl text-secondary">Love Coylah</p>
      <p className="mt-1 font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground">
        Age Slow · Reclaim Your Glow
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground/60 max-w-md mx-auto">
        The Collagen Kitchen · Skin-food recipes from the inside out.
      </p>
      <p className="mt-1.5 text-[10px] text-muted-foreground/40 max-w-md mx-auto px-4">
        Coylah is not a doctor, dermatologist or registered nutritionist. Always speak to your GP before making changes to your diet or skincare.
      </p>
      {/* DEV ONLY — remove before launch. Lets you re-trigger the welcome modal
          without clearing storage manually via DevTools/incognito. */}
      <button
        onClick={resetOnboarding}
        className="mt-4 text-[10px] text-muted-foreground/30 hover:text-muted-foreground underline"
      >
        Reset onboarding (dev)
      </button>
    </footer>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex flex-col items-center gap-0.5 py-1.5 text-foreground/50 transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{
        className:
          "flex flex-col items-center gap-0.5 py-1.5 bg-secondary/10 text-secondary",
      }}
    >
      {icon}
      <span className="text-[8px] uppercase tracking-wide">{label}</span>
    </Link>
  );
}

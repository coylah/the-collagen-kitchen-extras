// _authenticated/route.tsx
// All routes nested under _authenticated require a valid Supabase session.
// If the user isn't logged in, they're redirected to /auth (the magic link login page).

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Dev-only bypass: inside the Lovable editor preview we skip the login gate so
// building/testing doesn't require a magic link every time. Any other host
// (including the published production domain) keeps the full auth gate.
function isEditorPreview() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h.includes("lovableproject.com") ||
    h.includes("lovable.dev") ||
    h.startsWith("id-preview--") ||
    h === "localhost"
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (isEditorPreview()) return { user: null };
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relay-shell min-h-screen">
      <Navbar />
      <main style={{ paddingTop: "var(--nav-height)" }}>
        <Outlet />
      </main>
    </div>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "var(--nav-height)",
        background: "var(--void-02)",
        borderBottom: "1px solid var(--void-05)",
      }}
    >
      <Link to="/" className="flex items-center gap-3">
        <span className="blink-dot" aria-hidden="true" />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "var(--ink-primary)",
            fontSize: 18,
          }}
        >
          RELAY
        </span>
      </Link>
      <button
        onClick={handleSignOut}
        style={{
          fontFamily: "var(--font-accent)",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--ink-tertiary)",
          textTransform: "uppercase",
        }}
        className="hover:!text-[color:var(--ink-primary)] transition-colors"
      >
        Sign out
      </button>
    </header>
  );
}

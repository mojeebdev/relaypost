import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relay-shell min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-10">
        <div className="flex items-center gap-3 mb-10">
          <span className="blink-dot" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: "0.08em", fontSize: 22 }}>
            RELAY
          </span>
        </div>

        <p className="label-mono mb-2">// {mode === "signin" ? "operator login" : "request access"}</p>
        <h1 className="text-3xl mb-1">{mode === "signin" ? "Welcome back." : "Open a channel."}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--ink-secondary)" }}>
          One post on X. Three platforms in your queue.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label-mono block mb-2">email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-mono" autoComplete="email"
            />
          </div>
          <div>
            <label className="label-mono block mb-2">password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-mono" autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full mt-2">
            {loading ? "TRANSMITTING…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--void-05)" }}>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="label-mono-sm"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {mode === "signin" ? "→ new operator? sign up" : "→ already on the wire? sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

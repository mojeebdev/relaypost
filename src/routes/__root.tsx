import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 relay-shell">
      <div className="max-w-md text-center">
        <h1 className="text-7xl">404</h1>
        <p className="mt-4 label-mono">SIGNAL NOT FOUND</p>
        <div className="mt-8">
          <Link to="/" className="btn-ghost">RETURN TO BASE</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 relay-shell">
      <div className="max-w-md text-center">
        <h1 className="text-2xl">Transmission failed</h1>
        <p className="mt-3 label-mono">{error.message.slice(0, 120)}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-accent">RETRY</button>
          <a href="/" className="btn-ghost">HOME</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RELAY — X-first content distribution" },
      { name: "description", content: "Publish on X. Relay it everywhere. RELAY reformats your X posts for LinkedIn, Medium, and Facebook." },
      { name: "author", content: "RELAY" },
      { property: "og:title", content: "RELAY — X-first content distribution" },
      { property: "og:description", content: "Publish on X. Relay it everywhere. RELAY reformats your X posts for LinkedIn, Medium, and Facebook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "RELAY — X-first content distribution" },
      { name: "twitter:description", content: "Publish on X. Relay it everywhere. RELAY reformats your X posts for LinkedIn, Medium, and Facebook." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b578e6ee-c6f3-4036-9765-2c9687d0065a" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b578e6ee-c6f3-4036-9765-2c9687d0065a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=array@300,400,500&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@300;400;500&display=swap" },
    ],
    scripts: [
      { src: "https://cdn.novus.ai/analytics.js", async: true, "data-app": "relay" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Build trigger: refresh Lovable Cloud env vars for production */}
        <HeadContent />
        {import.meta.env.VITE_PENDO_API_KEY && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track', 'trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})(${JSON.stringify(import.meta.env.VITE_PENDO_API_KEY)});`,
            }}
          />
        )}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && typeof window !== "undefined" && window.pendo) {
      const anonId = "anon-" + crypto.randomUUID();
      window.pendo.initialize({
        visitor: { id: anonId },
        account: { id: "relay-app" },
      });
      initialized.current = true;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      router.invalidate();
      queryClient.invalidateQueries();
      if (session?.user && window.pendo) {
        window.pendo.identify({
          visitor: {
            id: session.user.id,
            email: session.user.email || "",
          },
          account: { id: session.user.id },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

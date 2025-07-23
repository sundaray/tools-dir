import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { RouterContext } from "@/routerContext";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
    meta: [
      {
        title: "My TanStack Router SSR App",
      },
      {
        charSet: "UTF-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
    ],
    scripts: [
      // Add Tailwind CDN if needed
      {
        src: "https://unpkg.com/@tailwindcss/browser@4",
      },
      // Development-specific scripts
      ...(!import.meta.env.PROD
        ? [
            {
              type: "module",
              children: `import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true`,
            },
            {
              type: "module",
              src: "/@vite/client",
            },
          ]
        : []),
      // Entry point script
      {
        type: "module",
        src: import.meta.env.PROD
          ? "/static/entry-client.js"
          : "/src/entry-client.tsx",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="p-2 flex gap-2">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{" "}
          <Link
            to="/submit"
            activeProps={{
              className: "font-bold",
            }}
          >
            Submit
          </Link>
        </div>
        <hr />
        <Outlet /> {/* Start rendering router matches */}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}

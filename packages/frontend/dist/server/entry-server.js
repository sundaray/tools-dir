import { jsxs, jsx } from "react/jsx-runtime";
import { createRequestHandler, renderRouterToStream, RouterServer } from "@tanstack/react-router/ssr/server";
import { createRootRouteWithContext, HeadContent, Link, Outlet, Scripts, createFileRoute, lazyRouteComponent, createRouter as createRouter$1 } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Headers } from "@effect/platform";
import { Effect, Option, Cause } from "effect";
const appCss = "/assets/app-CTmgqCPV.css";
const Route$2 = createRootRouteWithContext()({
  head: () => ({
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" }
    ],
    meta: [
      {
        title: "My TanStack Router SSR App"
      },
      {
        charSet: "UTF-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }
    ],
    scripts: [
      // Add Tailwind CDN if needed
      {
        src: "https://unpkg.com/@tailwindcss/browser@4"
      },
      // Development-specific scripts
      ...[],
      // Entry point script
      {
        type: "module",
        src: "/static/entry-client.js"
      }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsxs("div", { className: "p-2 flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            activeProps: {
              className: "font-bold"
            },
            activeOptions: { exact: true },
            children: "Home"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/submit",
            activeProps: {
              className: "font-bold"
            },
            children: "Submit"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx(Outlet, {}),
      " ",
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-right" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter = () => import("./assets/submit-C6-gX60D.js");
const Route$1 = createFileRoute("/submit")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function getFieldErrorId(fieldName, uniqueId) {
  return `${fieldName}-${uniqueId}-error`;
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const Route = createFileRoute("/")({
  component: Home
});
function Home() {
  return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl text-neutral-900", children: "Hello World" }),
    /* @__PURE__ */ jsx(Input, { className: "border-neutral-300" }),
    /* @__PURE__ */ jsx(Button, { children: "Hello" })
  ] });
}
const SubmitRoute = Route$1.update({
  id: "/submit",
  path: "/submit",
  getParentRoute: () => Route$2
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  SubmitRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
function createRouter() {
  return createRouter$1({
    routeTree,
    context: {
      head: ""
    },
    defaultPreload: "intent",
    scrollRestoration: true
  });
}
function render({
  request,
  head
}) {
  return Effect.gen(function* () {
    const host = Headers.get(request.headers, "host").pipe(
      Option.getOrElse(() => "localhost:3000")
    );
    const url = new URL(request.url, `http://${host}`);
    const webHeaders = new globalThis.Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      } else if (value) {
        webHeaders.set(key, value);
      }
    });
    const webRequest = new Request(url.href, {
      method: request.method,
      headers: webHeaders
    });
    const handler = createRequestHandler({
      request: webRequest,
      createRouter: () => {
        const router = createRouter();
        router.update({
          context: {
            ...router.options.context,
            head
          }
        });
        return router;
      }
    });
    const response = yield* Effect.tryPromise({
      try: () => handler(
        ({ request: request2, responseHeaders, router }) => renderRouterToStream({
          request: request2,
          responseHeaders,
          router,
          children: /* @__PURE__ */ jsx(RouterServer, { router })
        })
      ),
      catch: (error) => new Cause.UnknownException(error)
    });
    return response;
  });
}
export {
  Button as B,
  Input as I,
  cn as c,
  getFieldErrorId as g,
  render
};

import { Effect, Layer } from "effect";
import { Tag } from "effect/Context";
import { identity } from "effect/Function";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  HttpServer,
  HttpRouter,
  HttpMiddleware,
  HttpServerResponse,
} from "@effect/platform";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";

import { tools } from "./tools/index.js";

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;
// Note: Adjusted root path to point to the frontend directory correctly from backend/dist
const frontendRoot = path.resolve(__dirname, "..", "frontend");

// --- Service Definition for ViteDevServer (Dev only) ---
// We manage the Vite server as a scoped resource within a Layer.
// This ensures its startup and graceful shutdown are handled by Effect.
type ViteDevServer = import("vite").ViteDevServer;
const ViteDevServer = Tag<ViteDevServer>();

const ViteLayer = Layer.scoped(
  ViteDevServer,
  Effect.acquireRelease(
    Effect.tryPromise(async () => {
      console.log("Creating Vite dev server...");
      return (await import("vite")).createServer({
        root: frontendRoot,
        logLevel: "info",
        server: { middlewareMode: true },
        appType: "custom",
      });
    }),
    (vite) =>
      Effect.log("Closing Vite server...").pipe(Effect.andThen(vite.close()))
  )
).pipe(Layer.filter(() => !isProd));

const AppRouter = HttpRouter.empty.pipe(
  HttpRouter.mount("/tools", tools),

  // 2. Serve static assets from `dist/client` in production.
  // This replaces your manual `staticFileRoute` with a more robust, built-in solution.
  HttpRouter.use(
    isProd
      ? HttpMiddleware.serveDirectory({
          directory: path.join(frontendRoot, "dist", "client"),
        })
      : identity // In dev, Vite handles static assets via its middleware.
  ),

  // 3. The SSR catch-all route. This should be last.
  HttpRouter.get(
    "*",
    Effect.gen(function* (_) {
      const req = yield* _(HttpServer.request.ServerRequest);
      const vite = yield* _(Effect.serviceOption(ViteDevServer));
      const url = req.url;

      // Skip rendering for file-like paths that might have fallen through
      if (path.extname(url)) {
        return HttpServerResponse.empty({ status: 404 });
      }

      console.info(`SSR Rendering: ${url}`);

      // Get Vite-injected head scripts in development
      const viteHead = yield* _(
        Effect.tryPromise(async () => {
          if (vite.isSome()) {
            const html = await vite.value.transformIndexHtml(
              url,
              `<html><head></head><body></body></html>`
            );
            return html.substring(
              html.indexOf("<head>") + 6,
              html.indexOf("</head>")
            );
          }
          return "";
        })
      );

      // Load the SSR entry module
      const entry = yield* _(
        Effect.tryPromise(async () => {
          if (vite.isSome()) {
            return vite.value.ssrLoadModule("/src/entry-server.tsx");
          } else {
            return import(
              path.join(frontendRoot, "dist", "server", "entry-server.js")
            );
          }
        })
      );

      // Your `entry-server.tsx` returns a standard `Response` object. This is great!
      // We can wrap the call and convert the result to an Effect response.
      const webResponse = yield* _(
        Effect.tryPromise(() => entry.render({ request: req, head: viteHead }))
      );

      return HttpServerResponse.fromWeb(webResponse);
    }).pipe(
      // Global error handler for the SSR route
      Effect.catchAllCause((cause) => {
        console.error("SSR Handler Failed", cause);
        return HttpServerResponse.text(String(cause), { status: 500 });
      })
    )
  )
);

// --- Middleware Layer for Vite HMR (Dev only) ---
const ViteMiddlewareLayer = HttpServer.layer.pipe(
  HttpServer.withMiddleware(
    Effect.serviceOption(ViteDevServer).pipe(
      Effect.map((vite) =>
        vite.isSome()
          ? // Adapt Vite's Express-style middleware for Effect Platform
            NodeHttpServer.fromRequestHandler(vite.value.middlewares, {
              parseBody: false,
            })
          : identity
      )
    )
  )
);

// --- Create the final Application Layer ---
const AppLayer = AppRouter.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// --- Compose all layers into the final runnable application ---
const ServerLive = AppLayer.pipe(
  // The main server layer is the final one, consuming the app.
  Layer.provide(NodeHttpServer.layer({ port: PORT })),
  // Add dependencies for the server & dev mode
  Layer.provide(NodeContext.layer),
  Layer.provide(ViteLayer),
  Layer.provide(ViteMiddlewareLayer)
);

// --- Program Entry Point ---
// `Layer.launch` creates a never-ending Effect that runs the server.
// `NodeRuntime.runMain` executes it.
const program = Layer.launch(ServerLive);

NodeRuntime.runMain(program);

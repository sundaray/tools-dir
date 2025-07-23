import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpRouter,
  HttpServerResponse,
  HttpServer,
  HttpServerRequest,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer, Effect } from "effect";
import { createServer } from "node:http";
import { toolsApiLive } from "./tools/live.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

// Setup paths and environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");
const isProd = process.env.NODE_ENV === "production";

// Initialize Vite in development
let vite: any;
if (!isProd) {
  vite = await (
    await import("vite")
  ).createServer({
    root: path.join(root, "packages/frontend"),
    logLevel: "info",
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: "custom",
  });
}

// Static file serving route (production only)
const staticFileRoute = HttpRouter.get(
  "/static/*",
  Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest;
    const urlPath = req.url.replace(/^\/static/, "");
    const filePath = path.join(
      root,
      "packages/frontend/dist/client/static",
      urlPath
    );

    try {
      const content = yield* Effect.tryPromise(() => fs.readFile(filePath));
      const ext = path.extname(filePath);
      const contentType =
        ext === ".js"
          ? "application/javascript"
          : ext === ".css"
          ? "text/css"
          : ext === ".html"
          ? "text/html"
          : "application/octet-stream";

      return HttpServerResponse.raw(content, {
        status: 200,
        headers: {
          "content-type": contentType,
        },
      });
    } catch {
      return HttpServerResponse.text("Not found", { status: 404 });
    }
  })
);

// SSR catch-all route
const ssrRoute = HttpRouter.all(
  "*",
  Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest;

    // Skip API routes and file extensions
    if (req.url.startsWith("/tools") || path.extname(req.url) !== "") {
      return HttpServerResponse.text("Not found", { status: 404 });
    }

    // Get Vite head transformation in development
    let viteHead = "";
    if (!isProd && vite) {
      const htmlTemplate = `<html><head></head><body></body></html>`;
      const transformed = yield* Effect.tryPromise(() =>
        vite.transformIndexHtml(req.url, htmlTemplate)
      );
      viteHead = transformed.substring(
        transformed.indexOf("<head>") + 6,
        transformed.indexOf("</head>")
      );
    }

    // Load the SSR entry module
    const entry = yield* Effect.tryPromise(async () => {
      if (!isProd) {
        return vite.ssrLoadModule("/src/entry-server.tsx");
      } else {
        return import(
          path.join(root, "packages/frontend/dist/server/entry-server.js")
        );
      }
    });

    // Call the render function
    const response = yield* Effect.tryPromise(() =>
      entry.render({ request: req, head: viteHead })
    );

    // Stream the response
    if (response.body) {
      return HttpServerResponse.stream(response.body, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }

    return HttpServerResponse.empty({ status: response.status });
  })
);

// Create the main router
const mainRouter = HttpRouter.empty.pipe(
  // Mount API routes
  HttpRouter.mount("/tools", HttpApiBuilder.toHttpApp(toolsApiLive)),
  // Mount static files in production
  ...(isProd ? [staticFileRoute] : []),
  // Mount SSR catch-all
  ssrRoute
);

// Create the server with all middleware
const ServerLive = HttpServer.serve(mainRouter).pipe(
  // Add Swagger documentation
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  // Add Vite middleware in development
  !isProd && vite ? HttpServer.middleware(viteMiddleware) : Layer.empty,
  // Add the HTTP server
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

// Launch the server
Layer.launch(ServerLive).pipe(NodeRuntime.runMain);

// Handle graceful shutdown
process.on("SIGINT", async () => {
  if (vite) {
    await vite.close();
  }
  process.exit(0);
});

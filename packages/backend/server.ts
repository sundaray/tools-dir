// packages/backend/index.ts

import { Effect, Layer, Option } from "effect";
import {
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { FileSystem } from "@effect/platform/FileSystem";
import * as path from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import { tools as apiRouter } from "./tools/index.js";

// --- Configuration ---
const port = 3000;
const isProd = process.env.NODE_ENV === "production";

// --- Define Paths (important for monorepo) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go from 'packages/backend/dist' up to the root, then to 'packages/frontend/dist'
const frontendDistPath = path.join(__dirname, "../../../frontend/dist");
const staticPath = path.join(frontendDistPath, "client");

// --- SSR Handler ---

// This function converts a standard Web API Response to an Effect HttpServerResponse
function responseToEffect(response: Response) {
  return HttpServerResponse.stream(response.body).pipe(
    HttpServerResponse.setHeaders(response.headers),
    HttpServerResponse.setStatus(response.status)
  );
}

// The core SSR logic for production
const ssrHandler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Dynamically import the SSR entry built by Vite
  const { render } = yield* Effect.tryPromise(
    () => import(path.join(frontendDistPath, "server/entry-server.js"))
  );

  // The `head` content is empty in prod because vite injects it during build
  const webResponse = yield* Effect.tryPromise(() =>
    render({ request: request, head: "" })
  );

  return yield* responseToEffect(webResponse);
});

// --- Static File Handler ---

// A simple handler to serve static files (e.g., /static/assets/index-D3sBFp1h.js)
const staticHandler = Effect.gen(function* () {
  const fs = yield* FileSystem;
  const request = yield* HttpServerRequest.HttpServerRequest;
  const filePath = path.join(staticPath, request.url);

  // Security: Prevent directory traversal attacks
  if (!filePath.startsWith(staticPath)) {
    return HttpServerResponse.empty({ status: 401 });
  }

  const fileExists = yield* fs.exists(filePath);
  if (fileExists) {
    return HttpServerResponse.file(filePath);
  }

  // Fallback for RouteNotFound, so our SSR handler can catch it
  return yield* Effect.fail(new Error("File not found"));
});

// --- Main Application Logic ---

// In development, we only serve the API. The Vite dev server handles the frontend.
let app = HttpRouter.empty.pipe(
  HttpRouter.mount("/tools", apiRouter),
  HttpServer.serve(),
  HttpServer.withLogAddress
);

// In production, we build a more complex server
if (isProd) {
  console.log(
    "Running in production mode. Serving API, static files, and SSR."
  );

  // Router for static assets like JS, CSS, images
  const staticRouter = HttpRouter.empty.pipe(
    HttpRouter.get("/static/*", staticHandler)
  );

  // Main router combining everything. Order is important.
  const prodRouter = HttpRouter.empty.pipe(
    HttpRouter.mount("/tools", apiRouter), // 1. Handle API calls
    HttpRouter.mount("/", staticRouter), // 2. Handle static file requests
    HttpRouter.catchAll(ssrHandler) // 3. For everything else, SSR the app
  );

  app = prodRouter.pipe(HttpServer.serve(), HttpServer.withLogAddress);
} else {
  console.log("Running in development mode. Serving API only.");
}

const serverLive = NodeHttpServer.layer(() => createServer(), { port });

NodeRuntime.runMain(Layer.launch(Layer.provide(app, serverLive)));

// packages/backend/server.ts

import { Effect, Layer, Cause, Stream } from "effect";
import {
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import {
  NodeHttpServer,
  NodeRuntime,
  NodeContext,
} from "@effect/platform-node";
import { FileSystem } from "@effect/platform/FileSystem";
import * as path from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { tools as apiRouter } from "./tools/index.js";

// --- Configuration ---
const port = 3000;
const isProd = process.env.NODE_ENV === "production";

// --- Define Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../../frontend");
const frontendDistPath = path.join(root, "dist");

// --- Vite Server Cache ---
let viteServer: any = null;

// --- SSR Utilities ---
class StreamError {
  readonly _tag = "StreamError";
  constructor(readonly error: unknown) {}
}

function responseToEffect(response: Response) {
  if (response.body === null) {
    return HttpServerResponse.empty().pipe(
      HttpServerResponse.setHeaders(response.headers),
      HttpServerResponse.setStatus(response.status)
    );
  }
  const bodyStream = Stream.fromReadableStream(
    () => response.body!,
    (error) => new StreamError(error)
  );
  return HttpServerResponse.stream(bodyStream).pipe(
    HttpServerResponse.setHeaders(response.headers),
    HttpServerResponse.setStatus(response.status)
  );
}

// --- Create or get Vite server ---
const getViteServer = Effect.gen(function* () {
  if (isProd || viteServer) return viteServer;

  const viteModule = yield* Effect.tryPromise({
    try: () => import("vite"),
    catch: (error) => new Cause.UnknownException(error),
  });

  viteServer = yield* Effect.tryPromise({
    try: () =>
      viteModule.createServer({
        root,
        logLevel: "info",
        server: {
          middlewareMode: true,
          watch: {
            usePolling: true,
            interval: 100,
          },
        },
        appType: "custom",
      }),
    catch: (error) => new Cause.UnknownException(error),
  });

  return viteServer;
});

// --- SSR Handler ---
const ssrHandler = () =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const url = request.url;

    // Check if it's a file request (has extension)
    if (path.extname(url) !== "") {
      return HttpServerResponse.text(`${url} is not valid router path`, {
        status: 404,
      });
    }

    let viteHead = "";

    if (!isProd) {
      const vite = yield* getViteServer;

      // Extract head content from Vite's transformation
      const transformed = yield* Effect.tryPromise({
        try: () =>
          vite.transformIndexHtml(
            url,
            `<html><head></head><body></body></html>`
          ) as Promise<string>,
        catch: (error) => new Cause.UnknownException(error),
      });

      // Extract the head content
      const headStart = transformed.indexOf("<head>") + 6;
      const headEnd = transformed.indexOf("</head>");
      viteHead = transformed.substring(headStart, headEnd);
    }

    // Load the server entry
    const entry = yield* Effect.gen(function* () {
      if (!isProd) {
        const vite = yield* getViteServer;
        return yield* Effect.tryPromise({
          try: () => vite.ssrLoadModule("/src/entry-server.tsx"),
          catch: (error) => new Cause.UnknownException(error),
        });
      } else {
        return yield* Effect.tryPromise({
          try: () =>
            import(path.join(frontendDistPath, "server/entry-server.js")),
          catch: (error) => new Cause.UnknownException(error),
        });
      }
    });

    // Render the app
    const webResponse = yield* Effect.tryPromise({
      try: () =>
        entry.render({
          request: request,
          head: viteHead,
        }) as Promise<Response>,
      catch: (error) => new Cause.UnknownException(error),
    });

    return responseToEffect(webResponse);
  }).pipe(
    Effect.catchAll((error) =>
      HttpServerResponse.text("Internal Server Error", { status: 500 })
    )
  );

// --- Static files handler for production ---
const staticHandler = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem;
    const request = yield* HttpServerRequest.HttpServerRequest;
    const filePath = path.join(frontendDistPath, "client", request.url);

    const fileExists = yield* fs.exists(filePath);
    if (fileExists) {
      return yield* HttpServerResponse.file(filePath);
    }
    return HttpServerResponse.text("Not Found", { status: 404 });
  }).pipe(
    Effect.catchAll(() => HttpServerResponse.text("Not Found", { status: 404 }))
  );

// --- Main Application Logic ---

// Define the app based on environment
const app = isProd
  ? HttpRouter.empty.pipe(
      HttpRouter.mount("/tools", apiRouter),
      HttpRouter.get("/static/*", staticHandler()),
      HttpRouter.catchAll(ssrHandler)
    )
  : HttpRouter.empty.pipe(
      HttpRouter.mount("/tools", apiRouter),
      HttpRouter.catchAll(ssrHandler)
    );

// Create the server
const server = app.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// Create the server layer
const serverLive = NodeHttpServer.layer(() => createServer(), { port });

// Create the program
const program = Layer.launch(
  Layer.provide(server, serverLive).pipe((layer) =>
    isProd ? Layer.provide(layer, NodeContext.layer) : layer
  )
);

// Clean up on exit
process.on("SIGINT", () => {
  if (viteServer) {
    viteServer.close();
  }
  process.exit(0);
});

console.log(
  isProd
    ? "Running in production mode. Serving API, static files, and SSR."
    : "Running in development mode with Vite HMR. Access at http://localhost:3000"
);

// Run the program
NodeRuntime.runMain(program);

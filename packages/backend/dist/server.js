// packages/backend/index.ts
import { Effect, Layer, Cause, Stream } from "effect";
import { HttpRouter, HttpServer, HttpServerRequest, HttpServerResponse, } from "@effect/platform";
import { NodeHttpServer, NodeRuntime, NodeContext, // Import NodeContext
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
const frontendDistPath = path.join(__dirname, "../../../frontend/dist");
const staticPath = path.join(frontendDistPath, "client");
// --- SSR Utilities ---
class StreamError {
    error;
    _tag = "StreamError";
    constructor(error) {
        this.error = error;
    }
}
function responseToEffect(response) {
    if (response.body === null) {
        return HttpServerResponse.empty().pipe(HttpServerResponse.setHeaders(response.headers), HttpServerResponse.setStatus(response.status));
    }
    const bodyStream = Stream.fromReadableStream(() => response.body, (error) => new StreamError(error));
    return HttpServerResponse.stream(bodyStream).pipe(HttpServerResponse.setHeaders(response.headers), HttpServerResponse.setStatus(response.status));
}
// --- Route Handlers ---
// Renders the React application on the server.
const ssrHandler = Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const { render } = yield* Effect.tryPromise({
        try: () => import(path.join(frontendDistPath, "server/entry-server.js")),
        catch: (error) => new Cause.UnknownException(error),
    });
    const webResponse = yield* Effect.tryPromise({
        try: () => render({ request: request, head: "" }),
        catch: (error) => new Cause.UnknownException(error),
    });
    return responseToEffect(webResponse);
});
// Serves static files from the frontend's build output.
const staticHandler = Effect.gen(function* () {
    const fs = yield* FileSystem;
    const request = yield* HttpServerRequest.HttpServerRequest;
    // Serve from /static/*, so we need to strip that prefix for the file path.
    const relativePath = request.url.substring("/static".length);
    const filePath = path.join(staticPath, relativePath);
    if (!filePath.startsWith(staticPath)) {
        return HttpServerResponse.empty({ status: 401 });
    }
    const fileExists = yield* fs.exists(filePath);
    if (fileExists) {
        return yield* HttpServerResponse.file(filePath);
    }
    return yield* Effect.fail(new Error("File not found"));
});
// --- Main Application Logic ---
// Define the development app (serves API only).
const devApp = HttpRouter.empty.pipe(HttpRouter.mount("/tools", apiRouter), HttpServer.serve(), HttpServer.withLogAddress);
// Define the production app (serves API, static files, and performs SSR).
const prodApp = HttpRouter.empty
    .pipe(HttpRouter.mount("/tools", apiRouter), HttpRouter.get("/static/*", staticHandler), HttpRouter.catchAll(() => ssrHandler))
    .pipe(HttpServer.serve(), HttpServer.withLogAddress);
// Use a ternary to select the correct app logic based on the environment.
const app = isProd ? prodApp : devApp;
if (isProd) {
    console.log("Running in production mode. Serving API, static files, and SSR.");
}
else {
    console.log("Running in development mode. Serving API only.");
}
// Create the layer for the HTTP server itself.
const serverLive = NodeHttpServer.layer(() => createServer(), { port });
const program = Layer.launch(
// The base of our program provides the app logic to the server implementation.
Layer.provide(app, serverLive).pipe(
// We conditionally add another layer of dependencies ONLY in production.
(layer) => (isProd ? Layer.provide(layer, NodeContext.layer) : layer)));
// Run the final program.
NodeRuntime.runMain(program);
//# sourceMappingURL=server.js.map
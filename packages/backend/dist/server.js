import { Effect, Layer, Cause, Stream } from "effect";
import { HttpRouter, HttpServer, HttpServerRequest, HttpServerResponse, } from "@effect/platform";
import { NodeHttpServer, NodeRuntime, NodeFileSystem, } from "@effect/platform-node";
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
/* ------------------------------------------------------------------ */
/* Vite dev-server helper                                              */
/* ------------------------------------------------------------------ */
let viteServer;
// --- Create or get Vite server ---
const getViteServer = Effect.gen(function* () {
    if (isProd) {
        return yield* Effect.die(new Error("getViteServer must not be called in production"));
    }
    if (viteServer) {
        return viteServer;
    }
    const viteModule = yield* Effect.tryPromise({
        try: () => import("vite"),
        catch: (error) => new Cause.UnknownException(error),
    });
    viteServer = yield* Effect.tryPromise({
        try: () => viteModule.createServer({
            root: path.resolve(__dirname, "../../frontend"),
            logLevel: "info",
            server: {
                middlewareMode: true,
                watch: { usePolling: true, interval: 100 },
            },
            appType: "custom",
        }),
        catch: (error) => new Cause.UnknownException(error),
    });
    return viteServer;
});
// --- SSR Handler ---
const ssrHandler = () => Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const url = request.url;
    console.log(`[SSR] Received request for URL: ${url}`);
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
            try: () => vite.transformIndexHtml(url, `<html><head></head><body></body></html>`),
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
        }
        else {
            return yield* Effect.tryPromise({
                try: () => import(path.join(frontendDistPath, "server/entry-server.js")),
                catch: (error) => new Cause.UnknownException(error),
            });
        }
    });
    // The render function returns an Effect, not a Promise
    // We need to run the Effect to get the Response
    const renderEffect = entry.render({
        request: request,
        head: viteHead,
    });
    // Run the Effect and get the Response
    const webResponse = yield* renderEffect;
    return responseToEffect(webResponse);
}).pipe(Effect.catchAll((error) => {
    console.error("SSR Error:", error);
    return HttpServerResponse.text("Internal Server Error", { status: 500 });
}));
// --- Static files handler for production ---
const staticHandler = () => Effect.gen(function* () {
    const fs = yield* FileSystem;
    const request = yield* HttpServerRequest.HttpServerRequest;
    const filePath = path.join(frontendDistPath, "client", request.url);
    const fileExists = yield* fs.exists(filePath);
    if (fileExists) {
        return yield* HttpServerResponse.file(filePath);
    }
    return HttpServerResponse.text("Not Found", { status: 404 });
}).pipe(Effect.catchAll(() => HttpServerResponse.text("Not Found", { status: 404 })));
// --- Main Application Logic ---
// Define the app based on environment
const app = (isProd
    ? HttpRouter.empty.pipe(HttpRouter.mount("/tools", apiRouter), HttpRouter.get("/static/*", staticHandler()), HttpRouter.get("/*", ssrHandler()))
    : HttpRouter.empty.pipe(HttpRouter.mount("/tools", apiRouter), HttpRouter.get("/*", ssrHandler())));
const AppLive = HttpServer.serve(app);
const PlatformLive = Layer.merge(NodeHttpServer.layer(() => createServer(), { port }), NodeFileSystem.layer);
const ServerLive = Layer.provide(AppLive, PlatformLive);
// Run the program
NodeRuntime.runMain(Layer.launch(ServerLive));
//# sourceMappingURL=server.js.map
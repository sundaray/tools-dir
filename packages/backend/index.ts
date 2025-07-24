import { Layer } from "effect";

import { HttpServer, HttpRouter } from "@effect/platform";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";

import { tools } from "./tools/index.js";
import { createServer } from "http";

const port = 3000;

const router = HttpRouter.empty.pipe(HttpRouter.mount("/tools", tools));

const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

const serverLive = NodeHttpServer.layer(() => createServer(), { port });

NodeRuntime.runMain(Layer.launch(Layer.provide(app, serverLive)));

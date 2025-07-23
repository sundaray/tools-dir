import { HttpApiBuilder, HttpApiSwagger } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { createServer } from "node:http";
import { toolsApiLive } from "./tools/live";

const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(toolsApiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);

import { Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "./api.js";
import { submitToolHandler } from "./handlers.js";

export const toolsGroupLive = HttpApiBuilder.group(
  toolsApi,
  "tools",
  (handlers) => handlers.handle("submitTool", submitToolHandler)
);

export const toolsApiLive = HttpApiBuilder.api(toolsApi).pipe(
  Layer.provide(toolsGroupLive)
);

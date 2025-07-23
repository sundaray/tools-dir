import { Effect } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "./api.js";

export const submitToolHandler = HttpApiBuilder.handler(
  toolsApi,
  "tools",
  "submitTool",
  ({ payload }) =>
    Effect.gen(function* () {
      console.log("HttpServerRequest body: ", payload);
      return {
        message: "Tools submitted successfully!",
      };
    })
);

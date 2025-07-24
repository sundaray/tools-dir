import { Effect } from "effect";
import { HttpRouter, HttpServerResponse } from "@effect/platform";

function submitHandler() {
  return Effect.gen(function* () {
    return yield* HttpServerResponse.text("Tool submitted successfully.");
  });
}

export const tools = HttpRouter.empty.pipe(
  HttpRouter.post("/submit", submitHandler())
);

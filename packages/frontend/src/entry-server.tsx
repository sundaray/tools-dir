import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server";
import { createRouter } from "@/router";
import type { HttpServerRequest } from "@effect/platform";
import { Headers } from "@effect/platform";
import { Effect, Option, Cause } from "effect";

export function render({
  request,
  head,
}: {
  request: HttpServerRequest.HttpServerRequest;
  head: string;
}) {
  return Effect.gen(function* () {
    const host = Headers.get(request.headers, "host").pipe(
      Option.getOrElse(() => "localhost:3000")
    );
    const url = new URL(request.url, `http://${host}`);
    const webHeaders = new globalThis.Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      } else if (value) {
        webHeaders.set(key, value);
      }
    });
    const webRequest = new Request(url.href, {
      method: request.method,
      headers: webHeaders,
    });

    const handler = createRequestHandler({
      request: webRequest,
      createRouter: () => {
        const router = createRouter();
        router.update({
          context: {
            ...router.options.context,
            head: head,
          },
        });
        return router;
      },
    });

    // Instead of awaiting a promise, we safely execute it within Effect
    const response = yield* Effect.tryPromise({
      try: () =>
        handler(({ request, responseHeaders, router }) =>
          renderRouterToStream({
            request,
            responseHeaders,
            router,
            children: <RouterServer router={router} />,
          })
        ),
      catch: (error) => new Cause.UnknownException(error),
    });

    return response;
  });
}

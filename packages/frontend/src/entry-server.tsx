// packages/frontend/src/entry-server.tsx
import { pipeline } from "node:stream/promises";
import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server";
import { createRouter } from "@/router";
import type { HttpServerRequest } from "@effect/platform";
import { Effect } from "effect";

export async function render({
  request,
  head,
}: {
  request: HttpServerRequest.HttpServerRequest;
  head: string;
}) {
  // Convert Effect Platform request to web standard Request
  const url = new URL(
    request.url,
    `http://${request.headers["host"] || "localhost"}`
  );

  const webRequest = new Request(url.href, {
    method: request.method,
    headers: (() => {
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else if (value) {
          headers.set(key, value);
        }
      });
      return headers;
    })(),
  });

  // Create a request handler
  const handler = createRequestHandler({
    request: webRequest,
    createRouter: () => {
      const router = createRouter();

      // Update router with the head info from vite
      router.update({
        context: {
          ...router.options.context,
          head: head,
        },
      });
      return router;
    },
  });

  // Use the stream handler for SSR streaming
  const response = await handler(({ request, responseHeaders, router }) =>
    renderRouterToStream({
      request,
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    })
  );

  return response;
}

// packages/frontend/src/entry-server.tsx
import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server";
import { createRouter } from "@/router";
import type { HttpServerRequest } from "@effect/platform";
import { Headers } from "@effect/platform";
import { Option } from "effect";

export async function render({
  request,
  head,
}: {
  request: HttpServerRequest.HttpServerRequest;
  head: string;
}) {
  // Get host header using Effect's Headers module
  const host = Headers.get(request.headers, "host").pipe(
    Option.getOrElse(() => "localhost:3000")
  );

  // Construct URL properly
  const url = new URL(request.url, `http://${host}`);

  // Convert headers to Web API Headers
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

/// <reference types="vite/client" />

import {
  createRootRoute,
  Link,
  Outlet,
  HeadContent,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-semibold">
          Home
        </Link>
        <Link to="/submit" className="[&.active]:font-semibold">
          Submit
        </Link>
      </div>
      <hr />
      <HeadContent />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

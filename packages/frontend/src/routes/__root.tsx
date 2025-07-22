/// <reference types="vite/client" />

import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[]&.active]:font-bold">
          Home
        </Link>
        <Link to="/submit" className="[]&.active]:font-bold">
          Submit
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

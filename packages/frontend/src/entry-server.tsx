import { pipeline } from "node:stream/promises";
import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server";
import { createRouter } from "@/router";

export async function render() {}

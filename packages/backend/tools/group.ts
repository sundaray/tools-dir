import { HttpApiGroup, HttpApiMiddleware } from "@effect/platform";

import { submitTool } from "./endpoints";

export const usersGroup = HttpApiGroup.make("tools").add(submitTool);

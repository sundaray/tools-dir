import { HttpApiGroup } from "@effect/platform";

import { submitTool } from "./endpoints.js";

export const toolsGroup = HttpApiGroup.make("tools").add(submitTool);

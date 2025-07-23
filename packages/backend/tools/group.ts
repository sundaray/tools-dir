import { HttpApiGroup } from "@effect/platform";

import { submitTool } from "./endpoints";

export const toolsGroup = HttpApiGroup.make("tools").add(submitTool);

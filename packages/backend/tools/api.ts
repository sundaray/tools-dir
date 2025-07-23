import { HttpApi } from "@effect/platform";
import { toolsGroup } from "./group.js";

export const toolsApi = HttpApi.make("toolsApi").add(toolsGroup);

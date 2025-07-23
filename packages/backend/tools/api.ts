import { HttpApi } from "@effect/platform";
import { toolsGroup } from "./group";

export const toolsApi = HttpApi.make("toolsApi").add(toolsGroup);

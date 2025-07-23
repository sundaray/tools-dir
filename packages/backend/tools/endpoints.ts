import { HttpApiEndpoint } from "@effect/platform";
import { ToolSubmissionSchema } from "../../shared/src/schema";

export const submitTool = HttpApiEndpoint.get("submitTool", "/tools/submit")
  .setPath(ToolSubmissionSchema)
  .addSuccess();

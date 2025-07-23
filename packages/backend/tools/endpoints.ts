import { HttpApiEndpoint } from "@effect/platform";
import {
  ToolSubmissionSchema,
  ToolSubmissionResponseSchema,
} from "../../shared/src/schema";

export const submitTool = HttpApiEndpoint.get("submitTool", "/tools/submit")
  .setPayload(ToolSubmissionSchema)
  .addSuccess(ToolSubmissionResponseSchema);

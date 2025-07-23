import { HttpApiEndpoint } from "@effect/platform";
import {
  ToolSubmissionSchema,
  ToolSubmissionResponseSchema,
} from "shared/src/schema";

export const submitTool = HttpApiEndpoint.post("submitTool", "/tools/submit")
  .setPayload(ToolSubmissionSchema)
  .addSuccess(ToolSubmissionResponseSchema, { status: 200 });

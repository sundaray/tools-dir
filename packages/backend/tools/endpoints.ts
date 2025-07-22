import { HttpApiEndpoint, HttpApiError } from "@effect/platform";
import { Schema } from "effect";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

export const getUsers = HttpApiEndpoint.get("getUsers", "/users").addSuccess(
  Schema.Array(User)
);

export const getUser = HttpApiEndpoint.get("getUser", "/user/:id")
  .setPath(Schema.Struct({ id: Schema.NumberFromString }))
  .addSuccess(User, { status: 200 })
  .addError(HttpApiError.NotFound);

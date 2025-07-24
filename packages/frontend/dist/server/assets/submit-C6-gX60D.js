import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";
import * as LabelPrimitive from "@radix-ui/react-label";
import { c as cn, g as getFieldErrorId, I as Input, B as Button } from "../entry-server.js";
import axios from "axios";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@effect/platform";
const ToolSubmissionSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.nonEmptyString({
      message: () => "Name is required."
    })
  ),
  website: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Website URL is required." }),
    Schema.pattern(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      {
        message: () => "Please enter a valid website URL"
      }
    )
  )
});
Schema.Struct({
  message: Schema.String
});
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function FormMessage({ message, type }) {
  if (!message) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "rounded-md p-4 my-4",
        type === "error" && "bg-red-50",
        type === "success" && "bg-green-50"
      ),
      children: /* @__PURE__ */ jsx(
        "p",
        {
          className: cn(
            "text-sm",
            type === "error" && "text-red-800",
            type === "success" && "text-green-800"
          ),
          children: message
        }
      )
    }
  );
}
function FormFieldMessage({ error, errorId }) {
  if (!error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-7" });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-7", children: /* @__PURE__ */ jsx(
    "p",
    {
      id: errorId,
      role: "alert",
      className: "text-sm text-red-600 mt-1 ease-out animate-in fade-in-0",
      children: error
    }
  ) });
}
function ToolSubmissionForm() {
  const id = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: effectTsResolver(ToolSubmissionSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      website: ""
    }
  });
  const onSubmit = async function(data) {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post("/api/tools/submit", data);
      console.log("/tools/submit API response: ", response.data.message);
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };
  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "grid gap-2", children: [
    message && /* @__PURE__ */ jsx(FormMessage, { message, type: messageType }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Name" }),
      /* @__PURE__ */ jsx(
        Controller,
        {
          name: "name",
          control,
          render: function({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  ...field,
                  id: "name",
                  className: "mt-2 border-neutral-300",
                  placeholder: "Enter tool name",
                  "aria-invalid": fieldError ? "true" : "false",
                  "aria-describedby": fieldError ? fieldErrorId : void 0,
                  disabled: isProcessing
                }
              ),
              /* @__PURE__ */ jsx(
                FormFieldMessage,
                {
                  error: fieldError?.message,
                  errorId: fieldErrorId
                }
              )
            ] });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "website", children: "Website" }),
      /* @__PURE__ */ jsx(
        Controller,
        {
          name: "website",
          control,
          render: function({ field }) {
            const fieldErrorId = getFieldErrorId(field.name, id);
            const fieldError = errors[field.name];
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  ...field,
                  id: "website",
                  className: "mt-2 border-neutral-300",
                  placeholder: "https://example.com",
                  "aria-invalid": fieldError ? "true" : "false",
                  "aria-describedby": fieldError ? fieldErrorId : void 0,
                  disabled: isProcessing
                }
              ),
              /* @__PURE__ */ jsx(
                FormFieldMessage,
                {
                  error: fieldError?.message,
                  errorId: fieldErrorId
                }
              )
            ] });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isProcessing, children: isProcessing ? "Submitting..." : "Submit Tool" })
  ] });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto p-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl tracking-tight mb-6 font-semibold", children: "Submit a Tool" }),
    /* @__PURE__ */ jsx(ToolSubmissionForm, {})
  ] });
};
export {
  SplitComponent as component
};

import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { ToolSubmissionSchema, type ToolSubmissionFormData } from "@/schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { FormFieldMessage } from "@/components/form-field-message";
import { getFieldErrorId } from "@/lib/utils";

export function ToolSubmissionForm() {
  const formId = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ToolSubmissionFormData>({
    resolver: effectTsResolver(ToolSubmissionSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      website: "",
    },
  });

  const onSubmit = function (data: ToolSubmissionFormData) {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log("Form data:", data);
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {message && <FormMessage message={message} type={messageType} />}

      {/* Name Field */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Controller
          name="name"
          control={control}
          render={function ({ field }) {
            const errorId = getFieldErrorId(field.name, formId);
            return (
              <>
                <Input
                  {...field}
                  id="name"
                  placeholder="Enter tool name"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? errorId : undefined}
                  disabled={isProcessing}
                />
                <FormFieldMessage
                  error={errors.name?.message}
                  errorId={errorId}
                />
              </>
            );
          }}
        />
      </div>

      {/* Website Field */}
      <div>
        <Label htmlFor="website">Website</Label>
        <Controller
          name="website"
          control={control}
          render={function ({ field }) {
            const errorId = getFieldErrorId(field.name, formId);

            return (
              <>
                <Input
                  {...field}
                  id="website"
                  placeholder="https://example.com"
                  aria-invalid={errors.website ? "true" : "false"}
                  disabled={isProcessing}
                />
                <FormFieldMessage
                  error={errors.name?.message}
                  errorId={errorId}
                />
              </>
            );
          }}
        />
      </div>
      {/* Submit Button */}
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}

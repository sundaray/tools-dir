import React from "react";
import { useForm, Controller } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { ToolSubmissionSchema, type ToolSubmissionFormData } from "@/schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ToolSubmissionForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
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
    console.log("Form submitted with data: ", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Controller
          name="name"
          control={control}
          render={function ({ field }) {
            return (
              <Input
                {...field}
                id="name"
                placeholder="Enter tool name"
                aria-invalid={errors.name ? true : false}
              />
            );
          }}
        />
        {errors.name && (
          <p role="alert" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Website Field */}
      <div>
        <Label htmlFor="website">Website</Label>
        <Controller
          name="website"
          control={control}
          render={function ({ field }) {
            return (
              <Input
                {...field}
                id="website"
                placeholder="https://example.com"
                aria-invalid={errors.website ? "true" : "false"}
              />
            );
          }}
        />
        {errors.website && (
          <p role="alert" className="text-sm text-red-600">
            {errors.website.message}
          </p>
        )}
      </div>
      {/* Submit Button */}
      <Button type="submit">Submit Tool</Button>
    </form>
  );
}

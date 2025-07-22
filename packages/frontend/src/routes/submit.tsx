import { createFileRoute } from "@tanstack/react-router";
import { ToolSubmissionForm } from "@/components/tool-submission-form";

export const Route = createFileRoute("/submit")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl tracking-tight mb-6 font-semibold">
        Submit a Tool
      </h1>
      <ToolSubmissionForm />
    </div>
  );
}

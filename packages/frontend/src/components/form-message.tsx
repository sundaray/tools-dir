import { cn } from "@/lib/utils";

type FormMessageProps = {
  message: string | null;
  type: "success" | "error";
};

export function FormMessage({ message, type }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md p-4 my-4",
        type === "error" && "bg-red-50",
        type === "success" && "bg-green-50"
      )}
    >
      <p
        className={cn(
          "text-sm",
          type === "error" && "text-red-800",
          type === "success" && "text-green-800"
        )}
      >
        {message}
      </p>
    </div>
  );
}

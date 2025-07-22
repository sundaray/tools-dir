import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  return (
    <div className="p-2">
      <h2 className="text-2xl text-neutral-900">Hello World</h2>
      <Input className="border-neutral-300" />
      <Button>Hello</Button>
    </div>
  );
}

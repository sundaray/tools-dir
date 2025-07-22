import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  return (
    <div className="p-2">
      <h2>Hello World</h2>
    </div>
  );
}

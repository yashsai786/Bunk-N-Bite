import { createFileRoute } from "@tanstack/react-router";
import { BunkApp } from "@/features/bunk/BunkApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <BunkApp />;
}

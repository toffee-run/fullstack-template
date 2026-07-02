import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Hello World!" }],
  }),
  component: () => <h1>Hello World!</h1>,
});

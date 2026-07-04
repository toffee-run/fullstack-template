import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

const getUserSession = createServerFn({ method: "GET" }).handler(() => {
  return getRequestHeader("X-User-Session") ?? "null";
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Hello World!" }],
  }),
  loader: () => getUserSession(),
  component: HomePage,
});

function HomePage() {
  const userSession = Route.useLoaderData() as string;

  return (
    <div>
      <h1>Hello World!</h1>
      <pre>{JSON.stringify(JSON.parse(userSession), null, 4)}</pre>
    </div>
  );
}

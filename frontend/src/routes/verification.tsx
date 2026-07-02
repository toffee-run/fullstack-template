import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type SearchParams = {
  flow?: string;
};

export const Route = createFileRoute("/verification")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    flow: typeof search.flow === "string" ? search.flow : undefined,
  }),
  component: VerificationComponent,
});

function VerificationComponent() {
  const { flow: flowId } = Route.useSearch() as SearchParams;
  const [flow, setFlow] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flowId) {
      window.location.href = "/auth/self-service/verification/browser";
      return;
    }

    fetch(`/auth/self-service/verification/flows?id=${flowId}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 404 || res.status === 410 || res.status === 403 || res.status === 400) {
          window.location.href = "/auth/self-service/verification/browser";
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch verification flow");
        return res.json();
      })
      .then((data) => {
        if (data) setFlow(data);
      })
      .catch((err) => setError(err.message));
  }, [flowId]);

  if (error) return <div>Error: {error}</div>;
  if (!flow) return <div>Loading...</div>;

  return (
    <div>
      <h1>Verification</h1>
      <form action={flow.ui.action} method={flow.ui.method}>
        {flow.ui.nodes.map((node: any, idx: number) => {
          if (node.type === "input") {
            const attrs = node.attributes;
            if (attrs.type === "submit") {
              return (
                <button
                  key={idx}
                  name={attrs.name}
                  type="submit"
                  value={attrs.value}
                  disabled={attrs.disabled}
                >
                  {node.meta?.label?.text || attrs.value || "Submit"}
                </button>
              );
            }
            return (
              <div key={idx}>
                {attrs.type !== "hidden" && (
                  <label style={{ display: "block", marginTop: "10px" }}>
                    {node.meta?.label?.text || attrs.name}
                  </label>
                )}
                <input
                  name={attrs.name}
                  type={attrs.type}
                  defaultValue={attrs.value}
                  disabled={attrs.disabled}
                />
              </div>
            );
          }
          return null;
        })}
      </form>
    </div>
  );
}

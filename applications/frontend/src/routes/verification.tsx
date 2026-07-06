import { createFileRoute } from "@tanstack/react-router";
import { VerificationFlow } from "@ory/kratos-client";
import { useKratosFlow } from "@/hooks/useKratosFlow";
import { KratosForm } from "@/components/KratosForm";

interface VerificationSearch {
  flow?: string;
  return_to?: string;
}

export const Route = createFileRoute("/verification")({
  validateSearch: (search: Record<string, unknown>): VerificationSearch => {
    return {
      flow: search.flow as string | undefined,
      return_to: search.return_to as string | undefined,
    };
  },
  component: VerificationPage,
});

function VerificationPage() {
  const search = Route.useSearch();

  const { flow, loading, error, submitFlow } = useKratosFlow<VerificationFlow>({
    flowType: "verification",
    flowId: search.flow,
    returnTo: search.return_to,
  });

  if (error) {
    return (
      <div className="verification-container">
        <h1>Подтверждение email</h1>
        <div className="error-box">{error}</div>
        <p>
          <a href="/verification">Попробовать снова</a>
        </p>
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="verification-container">
        <h1>Подтверждение email</h1>
        <div className="loading">Загрузка формы...</div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h1>Подтверждение email</h1>
      <KratosForm ui={flow.ui} submitFlow={submitFlow} />
      <p className="verification-links">
        <a href="/">На главную</a>
      </p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { RecoveryFlow } from "@ory/kratos-client";
import { useKratosFlow } from "@/hooks/useKratosFlow";
import { KratosForm } from "@/components/KratosForm";

interface RecoverySearch {
  flow?: string;
  return_to?: string;
}

export const Route = createFileRoute("/recovery")({
  validateSearch: (search: Record<string, unknown>): RecoverySearch => {
    return {
      flow: search.flow as string | undefined,
      return_to: search.return_to as string | undefined,
    };
  },
  component: RecoveryPage,
});

function RecoveryPage() {
  const search = Route.useSearch();

  const { flow, loading, error, submitFlow } = useKratosFlow<RecoveryFlow>({
    flowType: "recovery",
    flowId: search.flow,
    returnTo: search.return_to,
  });

  if (error) {
    return (
      <div className="recovery-container">
        <h1>Восстановление пароля</h1>
        <div className="error-box">{error}</div>
        <p>
          <a href="/recovery">Попробовать снова</a>
        </p>
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="recovery-container">
        <h1>Восстановление пароля</h1>
        <div className="loading">Загрузка формы...</div>
      </div>
    );
  }

  return (
    <div className="recovery-container">
      <h1>Восстановление пароля</h1>
      <KratosForm ui={flow.ui} submitFlow={submitFlow} />
      <p className="recovery-links">
        <a href="/login">Вспомнили пароль? Войти</a>
      </p>
    </div>
  );
}

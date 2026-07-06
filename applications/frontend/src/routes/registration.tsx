import { createFileRoute } from "@tanstack/react-router";
import { RegistrationFlow } from "@ory/kratos-client";
import { useKratosFlow } from "@/hooks/useKratosFlow";
import { KratosForm } from "@/components/KratosForm";

interface RegistrationSearch {
  flow?: string;
  return_to?: string;
}

export const Route = createFileRoute("/registration")({
  validateSearch: (search: Record<string, unknown>): RegistrationSearch => {
    return {
      flow: search.flow as string | undefined,
      return_to: search.return_to as string | undefined,
    };
  },
  component: RegistrationPage,
});

function RegistrationPage() {
  const search = Route.useSearch();

  const { flow, loading, error, submitFlow } = useKratosFlow<RegistrationFlow>({
    flowType: "registration",
    flowId: search.flow,
    returnTo: search.return_to,
  });

  if (error) {
    return (
      <div className="registration-container">
        <h1>Регистрация</h1>
        <div className="error-box">{error}</div>
        <p>
          <a href="/registration">Попробовать снова</a>
        </p>
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="registration-container">
        <h1>Регистрация</h1>
        <div className="loading">Загрузка формы...</div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <h1>Регистрация</h1>
      <KratosForm ui={flow.ui} submitFlow={submitFlow} />
      <p className="registration-links">
        <a href="/login">Уже есть аккаунт? Войти</a>
      </p>
    </div>
  );
}

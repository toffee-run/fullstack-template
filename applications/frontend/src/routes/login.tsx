import { createFileRoute } from "@tanstack/react-router";
import { LoginFlow } from "@ory/kratos-client";
import { useKratosFlow } from "@/hooks/useKratosFlow";
import { KratosForm } from "@/components/KratosForm";

interface LoginSearch {
  flow?: string;
  return_to?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      flow: search.flow as string | undefined,
      return_to: search.return_to as string | undefined,
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();

  const { flow, loading, error, submitFlow } = useKratosFlow<LoginFlow>({
    flowType: "login",
    flowId: search.flow,
    returnTo: search.return_to,
  });

  if (error) {
    return (
      <div className="login-container">
        <h1>Вход</h1>
        <div className="error-box">{error}</div>
        <p>
          <a href="/login">Попробовать снова</a>
        </p>
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="login-container">
        <h1>Вход</h1>
        <div className="loading">Загрузка формы...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Вход</h1>
      <KratosForm ui={flow.ui} submitFlow={submitFlow} />
      <p className="login-links">
        <a href="/registration">Зарегистрироваться</a> |{" "}
        <a href="/recovery">Восстановить пароль</a> |{" "}
        <a href="/verification">Подтвердить аккаунт</a>
      </p>
    </div>
  );
}

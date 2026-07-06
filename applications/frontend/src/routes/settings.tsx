import { createFileRoute } from "@tanstack/react-router";
import { SettingsFlow } from "@ory/kratos-client";
import { useKratosFlow } from "@/hooks/useKratosFlow";
import { KratosForm } from "@/components/KratosForm";

interface SettingsSearch {
  flow?: string;
  return_to?: string;
}

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    return {
      flow: search.flow as string | undefined,
    };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const search = Route.useSearch();

  const { flow, loading, error, submitFlow } = useKratosFlow<SettingsFlow>({
    flowType: "settings",
    flowId: search.flow,
  });

  if (error) {
    return (
      <div className="settings-container">
        <h1>Настройки профиля</h1>
        <div className="error-box">{error}</div>
        <p>
          <a href="/settings">Попробовать снова</a>
        </p>
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="settings-container">
        <h1>Настройки профиля</h1>
        <div className="loading">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Настройки профиля</h1>
      <KratosForm ui={flow.ui} submitFlow={submitFlow} />
      <p className="settings-links">
        <a href="/">На главную</a>
      </p>
    </div>
  );
}

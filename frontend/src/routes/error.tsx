import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowError } from "@ory/kratos-client";
import { kratos } from "../kratos";

interface ErrorSearch {
  id?: string;
}

export const Route = createFileRoute("/error")({
  validateSearch: (search: Record<string, unknown>): ErrorSearch => {
    return {
      id: search.id as string | undefined,
    };
  },
  component: ErrorPage,
});

function ErrorPage() {
  const search = Route.useSearch();
  const [errorDetails, setErrorDetails] = useState<FlowError | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!search.id) {
      setLoading(false);
      return;
    }

    kratos
      .getFlowError({ id: search.id })
      .then(({ data }) => {
        setErrorDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message || "Failed to fetch error details");
        setLoading(false);
      });
  }, [search.id]);

  if (loading) {
    return (
      <div className="error-container">
        <h1>Произошла ошибка</h1>
        <div className="loading">Загрузка деталей ошибки...</div>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>Произошла ошибка</h1>
      {fetchError && <div className="error-box">{fetchError}</div>}

      {errorDetails ? (
        <div className="error-details">
          <h2>Код ошибки: {(errorDetails.error as any)?.code}</h2>
          <p>
            <strong>Статус:</strong> {(errorDetails.error as any)?.status}
          </p>
          <p>
            <strong>Причина:</strong> {(errorDetails.error as any)?.reason}
          </p>
          <p>
            <strong>Сообщение:</strong> {(errorDetails.error as any)?.message}
          </p>
          <details>
            <summary>Техническая информация</summary>
            <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <p>Неизвестная ошибка.</p>
      )}

      <p className="error-links">
        <a href="/">На главную</a> | <a href="/login">Войти</a>
      </p>
    </div>
  );
}

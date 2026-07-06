import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { kratos } from "@/kratos";
import { getUserSession } from "@/utils/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Главная страница" }],
  }),
  loader: () => getUserSession(),
  component: HomePage,
});

function HomePage() {
  const session = Route.useLoaderData() as any;
  const [logoutUrl, setLogoutUrl] = useState<string | null>(null);

  const isAuthenticated = session && session.active;
  const userEmail = session?.identity?.traits?.email || "unknown";

  useEffect(() => {
    if (isAuthenticated) {
      kratos
        .createBrowserLogoutFlow()
        .then(({ data }) => {
          setLogoutUrl(data.logout_url);
        })
        .catch((err) => {
          console.error("Failed to fetch logout flow details", err);
        });
    }
  }, [isAuthenticated]);

  return (
    <div className="home-container">
      <h1>Добро пожаловать в Fullstack Template</h1>

      {isAuthenticated ? (
        <div className="auth-box">
          <p>
            Вы вошли как: <strong>{userEmail}</strong>
          </p>
          <div className="session-details">
            <h3>Детали сессии (от Oathkeeper):</h3>
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
          <p className="actions">
            <a href="/settings">Настройки профиля</a> |{" "}
            {logoutUrl ? (
              <a href={logoutUrl}>Выйти</a>
            ) : (
              <span>Выход из системы...</span>
            )}
          </p>
        </div>
      ) : (
        <div className="guest-box">
          <p>Вы вошли как гость.</p>
          <p className="actions">
            <a href="/login">Войти в аккаунт</a> |{" "}
            <a href="/registration">Создать аккаунт</a>
          </p>
        </div>
      )}
    </div>
  );
}

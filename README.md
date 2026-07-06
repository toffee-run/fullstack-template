# Fullstack Шаблон
--------------------

Комплексный, готовый к продакшену fullstack-шаблон на базе Docker Compose. Этот шаблон разработан для создания надежной основы при разработке масштабируемых приложений со встроенным управлением идентификацией, маршрутизацией и инструментами наблюдаемости (observability).

## 🏗️ Архитектура

Проект разделен на три основных уровня:

- **`applications/`**: Содержит исходный код ваших приложений (frontend, backend, management).
- **`infrastructure/`**: Базовые сервисы, необходимые для работы приложения (аутентификация, шлюзы, наблюдаемость, базы данных).
- **`environments/`**: Специфичные для среды конфигурации и переменные для всех сервисов.

### Основные сервисы

Этот шаблон "из коробки" включает следующие компоненты инфраструктуры:

* **Маршрутизация и API-шлюз**: [Traefik](https://traefik.io/) & [Ory Oathkeeper](https://www.ory.sh/oathkeeper/)
* **Идентификация и аутентификация**: [Ory Kratos](https://www.ory.sh/kratos/)
* **Наблюдаемость (Observability & APM)**: [SigNoz](https://signoz.io/) & OpenTelemetry Collectors (master, host, integrations)
* **Базы данных**: [PostgreSQL](https://www.postgresql.org/) & [ClickHouse](https://clickhouse.com/)
* **Почтовый сервер**: Локальный SMTP для разработки

## 🚀 Быстрый старт

### Требования

* Docker
* Docker Compose

### Запуск проекта

Чтобы запустить все сервисы, просто выполните команду:

```bash
docker compose up -d
```

### Доступ к сервисам

После запуска проекта вы сможете получить доступ к сервисам по следующим портам (по умолчанию):

* **Приложение / Шлюз Traefik**: `http://localhost:8000` (HTTPS: `4443`)
* **SigNoz (Дашборд наблюдаемости)**: `http://localhost:8080`
* **Локальный почтовый сервер**: `http://localhost:8025`

## 📁 Структура проекта

```text
.
├── applications/
│   ├── backend/
│   ├── frontend/
│   └── management/
├── infrastructure/
│   ├── authentication/ # Ory Kratos & Oathkeeper
│   ├── gateways/       # Конфигурация Traefik
│   ├── observability/  # SigNoz и OpenTelemetry
│   ├── storages/       # Postgres и ClickHouse
│   └── other/          # Почтовый сервер и т.д.
├── environments/       # Переменные окружения (.env файлы)
├── docker-compose.yaml # Основной файл compose
└── docker-compose.override.yaml
```

## 🛠️ Конфигурация

Конфигурации сервисов управляются через `.env` файлы, расположенные в директории `environments/`. Каждый крупный компонент имеет свой собственный файл окружения (например, `postgres.env`, `kratos.env`, `signoz.env`). Изменяйте эти файлы для настройки учетных данных, портов или специфических параметров приложения.

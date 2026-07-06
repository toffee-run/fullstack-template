FROM python:3.14.6-slim-trixie AS base
WORKDIR /app


FROM base AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_PYTHON_DOWNLOADS=0 \
    UV_COMPILE_BYTECODE=1 \
    UV_NO_DEV=1

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY app.py .
COPY src src
RUN uv sync --locked


FROM base
ENV PYTHONUNBUFFERED=1

COPY --from=builder /app/ .
ENV PATH="/app/.venv/bin:$PATH"

COPY dashboards dashboards
CMD ["python", "app.py"]

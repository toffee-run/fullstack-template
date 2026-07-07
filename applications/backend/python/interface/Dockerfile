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
ENV GRANIAN_HOST=0.0.0.0 \
    GRANIAN_INTERFACE=asgi \
    GRANIAN_LOOP=uvloop \
    GRANIAN_WORKERS=4

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        curl \
    ; \
    rm -rf /var/lib/apt/lists/*;
HEALTHCHECK --interval=5s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:$PYTHON_INTERFACE_PORT/checks/liveliness || exit 1

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT ["entrypoint"]

COPY --from=builder /app/ .
ENV PATH="/app/.venv/bin:$PATH"

CMD ["granian", "app:app"]

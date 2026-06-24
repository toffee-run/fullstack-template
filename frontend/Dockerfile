FROM node:24.15.0-trixie-slim AS base
WORKDIR /app


FROM base AS builder

COPY package.json pnpm-lock.yaml tsconfig.json vite.config.ts ./
RUN set -eux; \
    npm i -g pnpm@11.5.3; \
    pnpm i --frozen-lockfile

COPY src src
RUN pnpm run build


FROM base

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    curl \
    ; \
    rm -rf /var/lib/apt/lists/*;
HEALTHCHECK --interval=3s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:$FRONTEND_PORT/ || exit 1

COPY --from=builder /app/.output .output

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

CMD ["node", ".output/server/index.mjs"]

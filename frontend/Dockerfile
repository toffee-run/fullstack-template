FROM node:24.15.0-trixie-slim AS base
WORKDIR /app


FROM base AS builder
RUN npm i -g pnpm@11.5.3

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm i --frozen-lockfile

COPY src src
COPY instrumentation.ts nitro.config.ts tsconfig.json vite.config.ts ./
RUN pnpm run build


FROM base
ENV FRONTEND_PORT=3000

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    curl \
    ; \
    rm -rf /var/lib/apt/lists/*;
HEALTHCHECK --interval=3s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:$FRONTEND_PORT/health || exit 1

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

COPY --from=builder /app/.output .output

CMD ["node", ".output/server/index.mjs"]

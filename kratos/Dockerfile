FROM alpine:3.22

RUN set -eux; \
    apk add --no-cache \
    curl \
    ;
HEALTHCHECK --interval=5s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:$KRATOS_PUBLIC_PORT/health/alive || exit 1

COPY --from=oryd/kratos:v26.2.0 /usr/bin/kratos /usr/bin/kratos

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint", "kratos" ]

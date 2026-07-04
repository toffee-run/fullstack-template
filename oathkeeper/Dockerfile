FROM alpine:3.22

RUN apk add --no-cache \
    curl \
    ;
HEALTHCHECK --interval=5s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:$OATHKEEPER_PORT/health/alive || exit 1

COPY --from=oryd/oathkeeper:v26.2.0 /usr/bin/oathkeeper /usr/bin/oathkeeper

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint", "oathkeeper" ]

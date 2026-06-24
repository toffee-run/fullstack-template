FROM signoz/signoz-otel-collector:v0.144.4

USER root

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    curl \
    ; \
    rm -rf /var/lib/apt/lists/*;
HEALTHCHECK --interval=5s --timeout=1s --start-period=2s --retries=3 \
    CMD curl -f http://localhost:13133/health || exit 1

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

USER 10001

CMD [ "/signoz-otel-collector", "--config", "/etc/otel/config.yaml" ]

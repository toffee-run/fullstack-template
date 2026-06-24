FROM traefik:v3.7.1 AS base
WORKDIR /etc/traefik

RUN set -eux; \
    apk add --no-cache \
    envsubst \
    ;

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

CMD [ "traefik" ]

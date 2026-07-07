FROM postgres:18.3-trixie

COPY healthcheck.sh /usr/local/bin/healthcheck
RUN chmod +x /usr/local/bin/healthcheck
HEALTHCHECK --interval=5s --timeout=1s --start-period=3s --retries=3 \
    CMD [ "healthcheck" ]

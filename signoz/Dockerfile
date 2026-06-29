FROM signoz/signoz-community:v0.122.0

HEALTHCHECK --interval=3s --timeout=1s --start-period=2s --retries=3 \
  CMD wget --spider -q http://$SIGNOZ_HOST:$SIGNOZ_PORT/api/v1/health

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

CMD [ "./signoz-community", "server" ]

FROM signoz/signoz-community:v0.122.0

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT [ "entrypoint" ]

CMD [ "./signoz-community", "server" ]

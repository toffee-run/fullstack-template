FROM clickhouse/clickhouse-server:26.3.10.60

RUN set -eux; \
    OS=$(uname -s | tr "[:upper:]" "[:lower:]"); \
    ARCH=$(uname -m | sed s/aarch64/arm64/ | sed s/x86_64/amd64/); \
    DIR="/var/lib/clickhouse/user_scripts"; \
    NAME="histogram-quantile"; \
    FILE_NAME="${NAME}_${OS}_$ARCH.tar.gz"; \
    wget "https://github.com/SigNoz/signoz/releases/download/$NAME%2Fv0.0.1/$FILE_NAME"; \
    tar -xvzf $FILE_NAME; \
    mkdir -p $DIR; \
    mv $NAME $DIR/histogramQuantile; \
    rm $FILE_NAME;
COPY histogramQuantile.xml /etc/clickhouse-server/

HEALTHCHECK --interval=10s --timeout=1s --start-period=15s --retries=5 \
    CMD ["wget", "--spider", "-q", "http://localhost:8123/ping"]

#!/bin/sh
set -eux

export SIGNOZ_TELEMETRYSTORE_CLICKHOUSE_DSN=clickhouse://$CLICKHOUSE_USER:$CLICKHOUSE_PASSWORD@$CLICKHOUSE_HOST:$CLICKHOUSE_PORT

# Inject dashboard auto-refresh script (default to 1m refresh interval)
sed -i "s|<noscript>You need to enable JavaScript to run this app.</noscript>|<script>(function(){try{var b=(document.querySelector('base')\|\|{}).getAttribute('href')\|\|'/';var p=b==='/'?'':b;var path=window.location.pathname;var db=p?path.replace(p,''):path;if(db.indexOf('/dashboard/')===0){var k=p+'refreshInterval';var d=JSON.parse(localStorage.getItem(k)\|\|'{}');if(!d[path]){d[path]='1m';localStorage.setItem(k,JSON.stringify(d));}}}catch(e){}})();<\/script><noscript>You need to enable JavaScript to run this app.<\/noscript>|g" /etc/signoz/web/index.html

exec "$@"

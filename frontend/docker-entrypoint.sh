#!/bin/sh
set -e

if [ "$ENVIRONMENT" = "production" ]; then
    echo "Production mode: injecting Cloudflare secrets..."
    envsubst '$CF_ACCESS_CLIENT_ID $CF_ACCESS_CLIENT_SECRET' \
      < /tmp/nginx.conf \
      > /etc/nginx/conf.d/default.conf
else
    echo "Development mode: using nginx-dev.conf"
fi

exec "$@"

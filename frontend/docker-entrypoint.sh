#!/bin/sh
set -e

if [ "$ENVIRONMENT" = "production" ]; then
    echo "Production mode: using nginx.conf"
    cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf
else
    echo "Development mode: using nginx-dev.conf"
fi

exec "$@"

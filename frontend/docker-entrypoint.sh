#!/bin/sh
set -eu

cd /app

if [ ! -f .env.local ] && [ -f .env.docker.example ]; then
  cp .env.docker.example .env.local
fi

exec npm run dev -- --hostname 0.0.0.0 --port 3000

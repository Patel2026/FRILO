#!/bin/sh
set -eu
cd /app
exec npm start -- --hostname 0.0.0.0 --port 3000

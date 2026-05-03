#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations…"
alembic upgrade head

echo "Starting Space Chess API…"
exec gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 2 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -

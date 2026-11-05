#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
python - <<'PY'
import os
import sys
import time

import psycopg2
from psycopg2.extensions import parse_dsn

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("DATABASE_URL is not set", file=sys.stderr)
    sys.exit(1)

dsn = parse_dsn(database_url)
deadline = time.time() + 60

while True:
    try:
        conn = psycopg2.connect(**dsn)
        conn.close()
        print("PostgreSQL is available.")
        break
    except Exception as exc:
        if time.time() >= deadline:
            print(f"Timed out waiting for PostgreSQL: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"PostgreSQL not ready yet ({exc}); retrying...")
        time.sleep(2)
PY

echo "Running database migrations..."
flask db upgrade

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "Seeding database..."
  python -m backend.seed
fi

echo "Starting application: $*"
exec "$@"

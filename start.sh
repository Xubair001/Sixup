#!/usr/bin/env bash
# Start the full Indoor Cricket stack

cd "$(dirname "$0")"

echo "==> Starting Postgres + Redis..."
docker compose up db redis -d
until docker exec indoor-cricket-db-1 pg_isready -U cricket 2>/dev/null; do sleep 1; done

echo "==> Running migrations..."
cd backend && .venv/bin/alembic upgrade head

echo "==> Starting API (port 8001)..."
.venv/bin/uvicorn app.main:app --port 8001 &
sleep 2

echo ""
echo "  API:      http://localhost:8001"
echo "  API docs: http://localhost:8001/docs"
echo ""
echo "Open a new terminal and run:"
echo "  cd frontend && npm run dev"
echo "  App: http://localhost:3000"

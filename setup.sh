#!/usr/bin/env bash
set -e

echo "==> Starting Postgres + Redis via Docker..."
docker compose up -d
echo "Waiting for DB to be ready..."
sleep 3

echo ""
echo "==> Setting up backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "==> Running Alembic migrations..."
alembic upgrade head

echo ""
echo "==> Backend ready. Start it with:"
echo "    cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"

cd ..

echo ""
echo "==> Setting up frontend..."
cd frontend
npm install --legacy-peer-deps

echo ""
echo "==> Frontend ready. Start it with:"
echo "    cd frontend && npm run dev"

echo ""
echo "==> All done!"
echo "    API docs: http://localhost:8000/docs"
echo "    App:      http://localhost:3000"

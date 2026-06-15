# ── Builder: install deps (gcc available for any compiled extensions) ──────────
FROM python:3.12 AS builder

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=5

# Split into layers so Docker caches each group independently
# Layer 1: web framework
RUN pip install --no-cache-dir \
    fastapi==0.111.1 \
    uvicorn[standard]==0.30.1 \
    python-multipart==0.0.9

# Layer 2: database (heaviest — sqlalchemy + asyncpg + greenlet)
RUN pip install --no-cache-dir \
    sqlalchemy[asyncio]==2.0.31 \
    asyncpg==0.29.0 \
    alembic==1.13.2

# Layer 3: auth + validation
RUN pip install --no-cache-dir \
    "pydantic[email]==2.8.2" \
    pydantic-settings==2.3.4 \
    email-validator==2.2.0 \
    "python-jose[cryptography]==3.3.0" \
    "passlib[bcrypt]==1.7.4" \
    bcrypt==4.0.1

# Layer 4: utilities
RUN pip install --no-cache-dir \
    loguru==0.7.2 \
    "redis[hiredis]==5.0.8" \
    pillow==10.4.0 \
    apscheduler==3.10.4 \
    python-dotenv==1.0.1 \
    httpx==0.27.0

# ── Runtime: slim image, no build tools ───────────────────────────────────────
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

RUN mkdir -p logs static \
    && addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --gid 1001 appuser \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE ${PORT:-8000}

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:' + __import__('os').environ.get('PORT','8000') + '/health')" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]

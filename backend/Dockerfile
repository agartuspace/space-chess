# Stage 1: Builder / dependency installer
FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim AS runner
WORKDIR /app

# Install stockfish and runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    stockfish \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*


# Copy installed packages
COPY --from=builder /install /usr/local

# Create non-root user
RUN useradd -r -u 1001 -g root appuser

# Copy application
COPY --chown=appuser:root . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

USER appuser
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]

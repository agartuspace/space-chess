# Reference Architecture — Next.js + FastAPI + PostgreSQL + Redis + Docker

A production-grade stack blueprint for any project. Describes what files exist, where they live, how they connect, and the standards that keep the system reliable at scale.

---

## System Diagram

```
                          Browser
                            │
                            ▼
                  ┌──────────────────┐
                  │   Next.js (3000) │  React 18, App Router, TypeScript
                  │                  │  middleware.ts → auth gate
                  │  next.config.mjs │  rewrites /api/* → backend
                  └────────┬─────────┘
                           │  same-origin httpOnly cookies
                           ▼
                  ┌──────────────────┐
                  │  FastAPI  (8000) │  async Python, Pydantic, SQLAlchemy
                  │                  │  structured logging, request tracing
                  └──┬────┬────┬──┬─┘
                     │    │    │  │
              ┌──────┘    │    │  └────────┐
              ▼           ▼    ▼           ▼
        ┌───────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐
        │ PostgreSQL│ │  Redis   │ │   Celery   │ │  S3 /   │
        │   (data)  │ │ (cache,  │ │  (worker)  │ │  MinIO  │
        │           │ │  broker, │ │            │ │ (files) │
        │           │ │  pubsub) │ │            │ │         │
        └───────────┘ └──────────┘ └────────────┘ └─────────┘
                                         │
                                    ┌────┴────┐
                                    │  Sentry │  (error tracking)
                                    └─────────┘
```

**How it flows:** The browser talks only to Next.js. Next.js serves pages and proxies `/api/*` to FastAPI via rewrites. httpOnly cookies travel transparently through the proxy. FastAPI handles all business logic, talks to Postgres for persistence, Redis for caching and pub/sub, S3 for file storage, and enqueues background work to Celery via Redis broker.

---

## Full Directory Structure

```
project/
│
├── app/                            # ── FRONTEND (Next.js App Router) ──
│   ├── layout.tsx                  # Root layout: providers, fonts, error boundary
│   ├── page.tsx                    # Home / landing
│   ├── error.tsx                   # Global error boundary
│   ├── loading.tsx                 # Global loading skeleton
│   ├── not-found.tsx               # 404 page
│   ├── globals.css                 # Tailwind layers + CSS variables (design tokens)
│   │
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # Primitives (Button, Input, Modal, Toast, etc.)
│   │   └── <Feature>Widget.tsx     # Feature-specific shared components
│   │
│   ├── hooks/                      # Shared React hooks
│   │   ├── use-auth.ts             # Auth context hook
│   │   └── use-api.ts              # React Query wrapper hooks
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # apiFetch() wrapper (credentials: include)
│   │   ├── query-client.ts         # React Query client configuration
│   │   └── utils.ts                # cn(), formatDate(), etc.
│   │
│   ├── stores/                     # Zustand stores (global client state)
│   │   └── auth-store.ts
│   │
│   ├── types/                      # Shared TypeScript types
│   │   └── index.ts
│   │
│   ├── styles/pages/               # CSS Modules scoped by domain
│   │   └── <domain>/
│   │       └── Component.module.css
│   │
│   │  ── Routes (each is a folder with page.tsx) ──
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin-specific layout (sidebar, nav)
│   │   └── users/page.tsx
│   └── <feature>/
│       ├── page.tsx
│       ├── loading.tsx             # Route-level loading skeleton
│       ├── error.tsx               # Route-level error boundary
│       └── components/             # Route-local components
│           └── FeatureCard.tsx
│
├── public/                         # Static assets (images, icons, favicons)
├── middleware.ts                    # Edge middleware: auth redirects, route protection
├── next.config.mjs                 # API rewrites, redirects, caching headers
├── tailwind.config.ts              # Theme tokens, plugins
├── tsconfig.json
├── package.json
├── Dockerfile                      # Frontend container (multi-stage: deps → build → runtime)
├── .eslintrc.json
│
├── backend/                        # ── BACKEND (FastAPI) ──
│   ├── app/
│   │   ├── main.py                 # App factory: CORS, middleware, routers, exception handlers
│   │   ├── config.py               # All env-var settings (single source of truth)
│   │   ├── database.py             # Async engine + session factory + get_db dependency
│   │   │
│   │   ├── auth/                   # ── Auth module ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py           # /api/auth/* endpoints (register, login, OAuth, refresh)
│   │   │   ├── service.py          # JWT creation/rotation, password hashing, OAuth
│   │   │   ├── schemas.py          # Pydantic: RegisterRequest, LoginRequest, TokenResponse
│   │   │   ├── models.py           # User, UserProfile, RefreshToken
│   │   │   └── dependencies.py     # get_current_user, require_role() (FastAPI Depends)
│   │   │
│   │   ├── users/                  # ── Example feature module ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py           # API endpoints
│   │   │   ├── service.py          # Business logic (receives session, returns data)
│   │   │   ├── schemas.py          # Pydantic request/response models
│   │   │   └── models.py           # SQLAlchemy models
│   │   │
│   │   ├── <feature>/              # ── Every feature follows the same shape ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── schemas.py
│   │   │   └── models.py
│   │   │
│   │   ├── shared/                 # Cross-cutting code
│   │   │   ├── models.py           # Base, UUIDMixin, TimestampMixin, SoftDeleteMixin
│   │   │   ├── schemas.py          # PaginatedResponse, ErrorResponse, standard envelopes
│   │   │   ├── exceptions.py       # Custom exception classes + global handler
│   │   │   ├── pagination.py       # Cursor-based and offset pagination helpers
│   │   │   ├── cache.py            # Redis cache-aside helpers
│   │   │   ├── storage.py          # S3/MinIO file upload abstraction
│   │   │   └── permissions.py      # RBAC: role checks, resource-level authorization
│   │   │
│   │   ├── middleware/
│   │   │   ├── request_id.py       # Attach X-Request-ID to every request + logs
│   │   │   ├── logging.py          # Structured JSON logging middleware
│   │   │   └── rate_limit.py       # Rate limiting (slowapi or custom)
│   │   │
│   │   ├── celery_app.py           # Celery instance
│   │   └── tasks.py                # Celery task definitions
│   │
│   ├── tests/                      # ── TEST SUITE ──
│   │   ├── conftest.py             # Fixtures: async test DB, test client, auth helpers
│   │   ├── factories.py            # factory_boy factories for all models
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   │   └── <feature>/
│   │       └── test_<feature>.py
│   │
│   ├── alembic/                    # ── Database migrations ──
│   │   ├── env.py                  # Async migration runner (imports Base.metadata)
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── alembic.ini
│   ├── pyproject.toml              # Dependencies (Poetry)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .dockerignore
│   └── .env.example
│
├── docs/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: lint → test → build → deploy
├── .gitignore
├── .env.example
└── README.md
```

---

## Backend Module Anatomy

Every feature module follows the same 5-file pattern:

```
<feature>/
├── __init__.py         # Empty or re-exports
├── router.py           # FastAPI APIRouter — HTTP layer only
├── service.py          # Business logic — all DB queries live here
├── schemas.py          # Pydantic models — request & response shapes
└── models.py           # SQLAlchemy ORM models — table definitions
```

### Dependency Rules

```
router.py  →  service.py  →  models.py
    ↓              ↓
schemas.py    shared/*
```

- **router.py** depends on **service.py** and **schemas.py**. Never touches SQLAlchemy directly.
- **service.py** receives `AsyncSession` as argument. Contains all DB queries and business logic. No HTTP concepts (no Request, no Response, no HTTPException).
- **schemas.py** is standalone Pydantic. No imports from models or service.
- **models.py** imports `Base` from `shared/models.py`. Alembic sees it through `Base.metadata`.
- **Never reverse** the dependency direction. Service never imports from router.

### Registering a module

```python
# main.py
from app.orders.router import router as orders_router
app.include_router(orders_router, prefix="/api/v1/orders", tags=["Orders"])
```

---

## Database Layer

### database.py

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,           # concurrent connections per worker
    max_overflow=10,        # burst capacity
    pool_recycle=3600,      # recycle connections every hour
)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
```

### shared/models.py — Base and Mixins

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, BigInteger, Boolean
import uuid, time

class Base(DeclarativeBase):
    pass

class UUIDMixin:
    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

class TimestampMixin:
    created_at: Mapped[int] = mapped_column(
        BigInteger, default=lambda: int(time.time() * 1000)
    )
    updated_at: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

class SoftDeleteMixin:
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_at: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
```

### Transaction Pattern in Services

```python
# service.py — the service layer owns transaction boundaries
async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    order = Order(**data.model_dump())
    db.add(order)
    await db.flush()          # get ID without committing

    log = OrderLog(order_id=order.id, action="created")
    db.add(log)

    await db.commit()         # single commit for both writes
    await db.refresh(order)
    return order
```

The router calls service functions inside the session context provided by `get_db()`. If a service function raises, the session rolls back automatically when the context manager exits.

### Conventions

- UUIDs as string primary keys
- Timestamps as milliseconds since epoch (integer) — no timezone bugs
- Enums as PostgreSQL `Enum` types
- Soft delete via `SoftDeleteMixin` for user-facing data (never hard delete by default)
- Indexes on every foreign key and any column used in `WHERE` or `ORDER BY`

---

## Authentication & Authorization

### Token Strategy (Access + Refresh)

```
1. POST /api/auth/login
2. Backend validates credentials
3. Returns:
   - access_token  (httpOnly cookie, 15-minute expiry, HS256 JWT)
   - refresh_token (httpOnly cookie, 30-day expiry, opaque UUID stored in DB)
4. Frontend makes requests — access_token cookie travels automatically
5. When access_token expires → frontend gets 401
6. Frontend calls POST /api/auth/refresh → new access_token issued
7. On logout → refresh_token is deleted from DB (revocation)
```

Why not a single 7-day JWT: a long-lived access token cannot be revoked. If compromised, the attacker has access for the full duration. Short access + long refresh gives you revocation via the database.

### RBAC (Role-Based Access Control)

```python
# shared/permissions.py
from enum import Enum

class Role(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"

def require_role(*allowed: Role):
    async def dependency(
        user_id: str = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> str:
        user = await db.get(User, user_id)
        if user.role not in allowed:
            raise HTTPException(403, "Insufficient permissions")
        return user_id
    return dependency

# Usage in router:
@router.delete("/{user_id}", dependencies=[Depends(require_role(Role.ADMIN))])
async def delete_user(...):
    ...
```

Scale this further with resource-level permissions (e.g. "is this user the owner of this resource?") by adding a `check_ownership()` helper in the same module.

### Frontend Middleware

```typescript
// middleware.ts
const PUBLIC_PATHS = ['/auth', '/legal', '/', '/about'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  return NextResponse.next();
}
```

---

## API Design Standards

### Consistent Response Envelope

Every API response follows the same shape:

```python
# shared/schemas.py
class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    code: str              # machine-readable: "INVALID_CREDENTIALS", "NOT_FOUND"

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    has_next: bool
```

### Global Exception Handler

```python
# main.py
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "code": exc.code, "detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "code": "VALIDATION_ERROR", "detail": exc.errors()},
    )
```

### Pagination (Cursor-Based for Large Datasets)

```python
# shared/pagination.py
async def paginate_query(
    db: AsyncSession,
    query,
    page: int = 1,
    page_size: int = 20,
    max_page_size: int = 100,
) -> PaginatedResponse:
    page_size = min(page_size, max_page_size)
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    items = (await db.execute(
        query.offset((page - 1) * page_size).limit(page_size)
    )).scalars().all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, has_next=(page * page_size < total),
    )
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...

@router.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, ...):
    ...
```

Apply strict limits on auth endpoints. Lighter limits (e.g. `60/minute`) on general API routes.

### API Versioning

All routes live under `/api/v1/`. When a breaking change is needed, create `/api/v2/` handlers alongside v1 and deprecate v1 with a sunset date header.

---

## Data Fetching (Frontend)

Raw `fetch` calls in components don't give you caching, deduplication, retry, or loading states. Use **React Query (TanStack Query)**:

### Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // data considered fresh for 30s
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// layout.tsx (root)
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Per-Feature Hooks

```typescript
// hooks/use-orders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useOrders(page: number) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => apiFetch(`/api/v1/orders?page=${page}`).then(r => r.json()),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) =>
      apiFetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
```

This gives you automatic caching, background refetching, optimistic updates, and loading/error states — for free.

---

## Caching Strategy

Redis serves three distinct purposes. Keep them separated by key prefix:

| Purpose | Key Pattern | TTL | Example |
|---------|------------|-----|---------|
| **Application cache** | `cache:{resource}:{id}` | 5–60 min | `cache:user:abc123` |
| **Session/presence** | `session:{id}`, `online:{id}` | Variable | `online:user_abc` |
| **Celery broker** | Managed by Celery | N/A | Internal |

### Cache-Aside Pattern

```python
# shared/cache.py
import json

async def cache_get(redis, key: str):
    data = await redis.get(key)
    return json.loads(data) if data else None

async def cache_set(redis, key: str, value, ttl: int = 300):
    await redis.set(key, json.dumps(value), ex=ttl)

async def cache_delete(redis, key: str):
    await redis.delete(key)
```

```python
# service.py
async def get_user_profile(db, redis, user_id: str):
    cached = await cache_get(redis, f"cache:user:{user_id}")
    if cached:
        return cached

    user = await db.get(User, user_id)
    data = UserSchema.model_validate(user).model_dump()

    await cache_set(redis, f"cache:user:{user_id}", data, ttl=300)
    return data
```

**Invalidation rule:** whenever you write to a resource, delete its cache key. Never let stale data survive a write.

---

## File Storage

Never store uploads on the local filesystem in production — it doesn't survive container restarts or scale across instances.

### Abstraction Layer

```python
# shared/storage.py
import boto3
from app.config import S3_BUCKET, S3_ENDPOINT, S3_KEY, S3_SECRET

s3 = boto3.client('s3', endpoint_url=S3_ENDPOINT,
                   aws_access_key_id=S3_KEY, aws_secret_access_key=S3_SECRET)

async def upload_file(file_bytes: bytes, key: str, content_type: str) -> str:
    s3.put_object(Bucket=S3_BUCKET, Key=key, Body=file_bytes, ContentType=content_type)
    return f"{S3_ENDPOINT}/{S3_BUCKET}/{key}"

async def delete_file(key: str):
    s3.delete_object(Bucket=S3_BUCKET, Key=key)
```

For local development, use **MinIO** as an S3-compatible drop-in (add to `docker-compose.yml`). In production, use any S3-compatible storage (AWS S3, DigitalOcean Spaces, Cloudflare R2).

---

## Observability

### Structured Logging

Every log line is JSON with consistent fields:

```python
# middleware/logging.py
import logging, json, time, uuid

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "request_id": getattr(record, "request_id", None),
            "user_id": getattr(record, "user_id", None),
        })
```

### Request ID Propagation

```python
# middleware/request_id.py
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
```

Every log entry, every error report, every downstream call includes `request_id`. When something breaks, you grep one ID and see the entire request lifecycle.

### Error Tracking (Sentry)

```python
# main.py
import sentry_sdk
sentry_sdk.init(dsn=config.SENTRY_DSN, traces_sample_rate=0.1)
```

Frontend:
```typescript
// layout.tsx
import * as Sentry from '@sentry/nextjs';
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
```

### Health Check

```python
@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    redis_client.ping()
    return {"status": "ok", "db": "ok", "redis": "ok"}
```

Use this in Docker healthcheck, load balancer probes, and uptime monitoring (UptimeRobot, Betterstack).

---

## Testing

### Backend (pytest + httpx)

```
tests/
├── conftest.py           # Test DB, async client, auth fixtures
├── factories.py          # factory_boy: UserFactory, OrderFactory, etc.
├── test_auth.py          # Auth flow tests
└── orders/
    └── test_orders.py    # Feature tests
```

```python
# conftest.py
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base

@pytest_asyncio.fixture
async def db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client(db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
```

```python
# test_auth.py
async def test_register_and_login(client):
    r = await client.post("/api/auth/register", json={
        "email": "test@example.com", "password": "secure123"
    })
    assert r.status_code == 200
    assert "access_token" in r.cookies
```

### Frontend (Vitest + React Testing Library + Playwright)

- **Unit tests:** Vitest + React Testing Library for component logic
- **E2E tests:** Playwright for critical user flows (login, checkout, etc.)

### What to Test

| Layer | What | Tool |
|-------|------|------|
| Backend service | Business logic, edge cases | pytest |
| Backend API | Request/response contract, auth, validation | httpx + pytest |
| Frontend components | Rendering, user interaction | Vitest + RTL |
| E2E critical paths | Login → action → result | Playwright |

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: [5432:5432]
      redis:
        image: redis:7
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install poetry && poetry install
        working-directory: backend
      - run: poetry run ruff check app/
        working-directory: backend
      - run: poetry run pytest --tb=short -q
        working-directory: backend
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test
          REDIS_HOST: localhost

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

Add a deploy job that triggers on `main` branch merges (SSH to VPS, or push to container registry + restart).

---

## Docker (Production-Hardened)

### Backend Dockerfile (multi-stage)

```dockerfile
# backend/Dockerfile
# Stage 1: install dependencies
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt -o requirements.txt
RUN pip install --prefix=/install -r requirements.txt

# Stage 2: runtime image
FROM python:3.12-slim
WORKDIR /app

RUN adduser --disabled-password --no-create-home appuser
COPY --from=builder /install /usr/local
COPY . .
RUN chown -R appuser:appuser /app

USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend Dockerfile (multi-stage)

```dockerfile
# Dockerfile (project root)
# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: production runtime
FROM node:20-alpine
WORKDIR /app

RUN adduser -D -H appuser

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

Requires `output: "standalone"` in `next.config.mjs`:
```javascript
const nextConfig = {
  output: "standalone",
  // ... other config
};
```

The standalone output bundles everything into a minimal `server.js` — no `node_modules` in the final image. Production image is ~150 MB instead of 1+ GB.

### Key Dockerfile principles

- **Multi-stage** — final images contain no build tools, no dev dependencies
- **Non-root user** — `appuser` instead of root (security baseline)
- **Alpine base** — smaller images for Node.js; slim for Python
- **Layer caching** — `COPY package.json` before `COPY .` so dependencies are cached unless lockfile changes

### .dockerignore

Each service needs its own `.dockerignore`:

```
# backend/.dockerignore
.git
.env
.env.*
__pycache__
*.pyc
.venv
tests/
docs/
*.md
```

```
# .dockerignore (frontend, project root)
.git
.env
.env.*
node_modules
.next
backend/
docs/
*.md
```

### docker-compose.yml (full stack)

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports: ["3000:3000"]
    environment:
      BACKEND_INTERNAL_URL: http://backend:8000
    depends_on: [backend]
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ports: ["8000:8000"]
    env_file: backend/.env
    volumes: ["./backend:/app"]
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_started }

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.celery_app:celery_app worker -l info
    env_file: backend/.env
    volumes: ["./backend:/app"]
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7
    command: redis-server --requirepass "${REDIS_PASSWORD}"
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET}
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio_data:/data]

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

Note: In development, you can run the frontend outside Docker (`npm run dev`) for faster hot-reload and mount the backend code as a volume. In production/staging, run everything inside Docker for consistency.

### Development vs Production compose

```bash
# Development — frontend outside Docker for fast HMR
cd backend && docker compose up -d          # backend + infra only
cd .. && npm run dev                        # frontend with hot reload

# Staging / Production — everything containerized
docker compose up -d                        # full stack from root
```

---

## Production Deployment

### Architecture

```
Internet → Nginx (443/SSL)
             ├── /           → frontend container (3000)
             ├── /api/*      → backend container  (8000)
             └── /ws/*       → backend container  (8000) [WebSocket upgrade]

Docker internal network:
  frontend (3000) ──→ backend (8000) via BACKEND_INTERNAL_URL
  backend  (8000) ──→ postgres (5432), redis (6379), minio (9000)
  celery   worker ──→ postgres, redis
```

All services run as Docker containers. Nginx is the only process exposed to the internet. Containers communicate over the Docker bridge network using service names as hostnames.

### Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Request-ID $request_id;
        proxy_read_timeout 300s;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
    }
}
```

### Gunicorn (Production Process Manager)

Don't use bare `uvicorn` in production. Use Gunicorn as a process manager:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

This gives you proper worker management, graceful restarts, and pre-fork process isolation.

---

## Real-Time Communication

| Pattern | Best for | Implementation |
|---------|----------|----------------|
| **SSE** | AI streaming, notifications | `StreamingResponse` (FastAPI) + `EventSource` (browser) |
| **WebSocket** | Chat, collaboration, presence | FastAPI `WebSocket` + Redis pub/sub between instances |
| **Polling** | Simple status checks | `setInterval` + REST endpoint |

### WebSocket (Multi-Instance Safe)

```python
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, room_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(room_id, []).append(ws)

    async def broadcast(self, room_id: str, data: dict):
        for ws in self.active.get(room_id, []):
            await ws.send_json(data)
```

With multiple server instances, a message sent to instance A must reach clients on instance B. Use **Redis pub/sub** as the bridge: publish to a Redis channel, every instance subscribes and forwards to its local connections.

---

## Alembic (Migrations)

### env.py (key part)

```python
from app.shared.models import Base

# Import every module's models so Base.metadata is populated
import app.auth.models
import app.users.models
import app.orders.models

target_metadata = Base.metadata
```

### Commands

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend alembic revision --autogenerate -m "add_orders_table"
docker compose exec backend alembic downgrade -1
docker compose exec backend alembic current
```

### Rules

- Name manual migrations `YYYYMMDDHHMMSS_description.py`
- Always test both `upgrade()` and `downgrade()`
- Never modify a migration that has been applied to production — create a new one
- For data migrations (backfills), create a separate migration with explicit SQL, not autogenerate

---

## Environment Variables

```
# .env.example

# Database
DB_USER=postgres
DB_PASSWORD=changeme
DB_NAME=myapp
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=changeme
REDIS_DB=0

# Auth
JWT_SECRET_KEY=generate-a-real-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
SECURE_COOKIES=false
COOKIES_DOMAIN=

# File Storage
S3_ENDPOINT=http://minio:9000
S3_BUCKET=uploads
S3_KEY=minioadmin
S3_SECRET=minioadmin

# Observability
SENTRY_DSN=
LOG_LEVEL=INFO

# Frontend
FRONTEND_BASE_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Rule:** never commit `.env`. Commit `.env.example` with safe placeholders. In production, use secrets management (Docker secrets, HashiCorp Vault, or cloud provider's secret manager).

---

## Git Workflow

### Branches

```
main              ← always deployable
  └── feature/*   ← one branch per task, short-lived
  └── hotfix/*    ← urgent production fixes
```

### Commits (Conventional)

```
feat: add order processing module
fix: prevent duplicate payment webhooks
refactor: extract user service from main.py
docs: update architecture reference
test: add order creation integration tests
chore: upgrade FastAPI to 0.115
```

### Pull Request Checklist

- [ ] Tests pass
- [ ] No linter errors
- [ ] Migration included if models changed
- [ ] Migration tested (upgrade + downgrade)
- [ ] No secrets in code

---

## Adding a New Feature (Checklist)

1. **Backend module** — `backend/app/<feature>/` with `__init__.py`, `router.py`, `service.py`, `schemas.py`, `models.py`
2. **Register router** — `app.include_router(...)` in `main.py`
3. **Models → migration** — define tables, import in `alembic/env.py`, run `alembic revision --autogenerate`
4. **Apply migration** — `alembic upgrade head`
5. **Write tests** — at minimum: one happy-path, one auth check, one validation error
6. **Frontend route** — `app/<feature>/page.tsx` + `loading.tsx` + `error.tsx` + local components
7. **Data hooks** — React Query hooks in `hooks/use-<feature>.ts`
8. **Connect** — call backend via `apiFetch('/api/v1/<feature>/...')`
9. **Protect** — add auth/role dependency to router; update `middleware.ts` if needed
10. **Cache** — add Redis caching if the data is read-heavy

---

## Key Principles

- **Separation:** Frontend knows nothing about the database. Backend knows nothing about React.
- **Single proxy:** Next.js rewrites handle all API routing — one origin, no CORS issues for cookies.
- **Cookie auth:** httpOnly JWT cookies with short access + long refresh. Never store tokens in localStorage.
- **Feature modules:** Backend organized by domain, not by layer. Each module is self-contained.
- **Async everything:** FastAPI + asyncpg + SQLAlchemy async. No blocking in the request path.
- **Test what matters:** Service logic, API contracts, critical E2E flows. Not every CSS class.
- **Observe everything:** Structured logs, request IDs, Sentry, health checks. If you can't see it, you can't fix it.
- **Cache deliberately:** Redis for hot data with explicit invalidation. Never let a write leave stale cache.
- **Migrations are code:** Every schema change through Alembic. Never hand-edit production databases.
- **Docker for dev, hardened for prod:** Multi-stage builds, non-root users, Gunicorn workers, Nginx in front.

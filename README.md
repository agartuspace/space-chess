# Space Chess · Agartu

Монорепозиторий в духе [reference architecture](./docs/reference-architecture.md): **frontend** и **backend** живут как соседние папки в корне, **docs** для ТЗ и внешней документации.

## Структура репозитория

```
chess-learning/
├── frontend/           # Next.js (App Router) — приложение Space Chess / Ustaz
├── backend/            # FastAPI, SQLAlchemy, Alembic, Stockfish CLI
├── docs/               # ТЗ, reference architecture, заметки по ElevenLabs
├── nginx/              # Обратный прокси + SSL для production Compose
├── docker-compose.yml           # Общее: postgres, redis, backend, frontend
├── docker-compose.dev.yml       # Hot-reload, порты локально
├── docker-compose.prod.yml      # nginx + certbot поверх базового compose
├── Makefile            # См. команды ниже
└── .env.example        # Образец переменных (скопировать в .env в корень)
```

## Быстрый старт (Docker)

Из **корня** репозитория:

1. Скопируйте переменные: `copy .env.example .env` (Windows) или `cp .env.example .env`.
2. Заполните секреты (`SECRET_KEY`, `ELEVENLABS_*`, при необходимости `ANTHROPIC_*`).
3. Запуск разработки: `make dev` (или `make dev-d`).
4. Приложение: `http://localhost:3000` → редирект на `/space-chess`. API: `http://localhost:8000`, health — `GET /health`.

Production на VPS (`space-chess.agartu.space` и т.п.): `make prod`, первичный выпуск сертификата — см. секцию про SSL в этом файле ниже после настройки DNS.

## Локальный фронтенд без Docker

```powershell
cd frontend
npm install
npm run dev
```

Для того чтобы запросы к API шли на тот же origin и не упирались в CORS, используйте переменную `NEXT_PUBLIC_API_URL=http://localhost:8000`, либо оставьте пустым и положитесь на `rewrites` в `frontend/next.config.ts` (режим без Docker подставляет backend на `:8000`).

## Основные Make-команды

| Команда | Назначение |
| -------- | ----------- |
| `make dev` / `make dev-d` | Compose dev с hot reload |
| `make prod` | Compose prod (+ nginx/certbot профиль) |
| `make migrate` | `alembic upgrade head` в контейнере backend |
| `make seed` | Заготовка данных (stub) |
| `make logs` | Логи всех сервисов |

## Продукт

**Space Chess** — обучение шахматам в стиле Agartu Space: доска «Aurora», голосовой наставник **Ustaz** (ElevenLabs Conversational Agent + Stockfish/Web на клиенте и сервере), онбординг с калибровкой по задачам, журнал прогресса (по мере реализации API).

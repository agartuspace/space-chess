# Space Chess — полный гайд по запуску

Документ описывает запуск **через Docker (dev и prod)**, **переменные окружения**, **ElevenLabs (в т.ч. где взять system prompt для Ustaz)**, **Anthropic**, **типичные проблемы**. Вариант «всё на машине без Docker» здесь не разбирается — ориентир один: `make dev`.

Все команды ниже выполняются из **корня репозитория** `chess-learning/`, если не указано иное.

---

## 0. Что должно быть установлено

| Инструмент | Зачем |
|------------|--------|
| **Git** | клонирование репозитория |
| **Docker Desktop** (или Docker Engine + Compose v2) | весь стек: Postgres, Redis, backend, frontend в dev |
| **Make** (опционально) | короткие команды `make dev`; иначе — те же `docker compose ...` вручную |

На Windows удобно: **PowerShell**, для `make` — [GnuWin32 make](https://gnuwin32.sourceforge.net/packages/make.htm), **Git for Windows**, или запускать те же команды вручную через `docker compose`.

---

## 1. Переменные окружения (файл `.env`)

1. Скопируйте образец в корень проекта (рядом с `docker-compose.yml`):

   ```powershell
   Copy-Item .env.example .env
   ```

2. **Важно:** `docker-compose.yml` у backend указано `env_file: .env` — файл **обязан** лежать в **корне** монорепо, не в `backend/` и не в `frontend/`.

3. Минимально отредактируйте `.env`:

   | Переменная | Обязательность | Назначение |
   |------------|----------------|------------|
   | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Для Docker | Учётка и имя БД в контейнере Postgres |
   | `SECRET_KEY` | **Обязательно** в проде | JWT и подписи; минимум ~32 случайных символа |
   | `DATABASE_URL` | В Compose для backend задаётся автоматически из `POSTGRES_*` | В `.env` можно оставить как в примере для совместимости с документацией |
   | `REDIS_URL` | Docker: уже `redis://redis:6379` | Rate limit коуч-сессий, квоты |
   | `ELEVENLABS_API_KEY` | Для голоса Ustaz | Ключ из [ElevenLabs](https://elevenlabs.io/) |
   | `ELEVENLABS_AGENT_ID` | Для голоса Ustaz | ID Conversational Agent |
   | `ANTHROPIC_API_KEY` | Рекомендуется | Текстовый fallback коуча (`/api/v1/chess/coach/text-turn`) |
   | `NEXT_PUBLIC_API_URL` | В **docker-dev** в `docker-compose.dev.yml` уже пусто | Браузер бьёт в `/api` на `:3000`, Next проксирует на backend |
   | `NEXT_PUBLIC_USE_API_REWRITE` | Локально / docker-dev: `1` | Проксирование `/api` через Next |
   | `BACKEND_INTERNAL_URL` | В docker-dev: `http://backend:8000` | Куда Next проксирует `/api` с сервера |

---

## 2. Запуск через Docker

### 2.1. Разработка (hot reload)

Из корня:

```powershell
make dev
```

Или в фоне:

```powershell
make dev-d
```

Что поднимается (см. `docker-compose.yml` + `docker-compose.dev.yml`):

- **postgres** — порт `5432` наружу (в dev)
- **redis** — порт `6379`
- **backend** — FastAPI на `http://localhost:8000`, код смонтирован с `./backend`, `uvicorn --reload`
- **frontend** — образ `node:20-alpine`, внутри контейнера `npm install && npm run dev`, порт `3000`

При первом старте **backend** в `entrypoint.sh` выполняет `alembic upgrade head` — таблицы создаются автоматически.

**Открыть в браузере:**

- UI: `http://localhost:3000` → редирект на `/space-chess`
- API health: `http://localhost:8000/health`
- Через браузер к API с фронта: запросы идут на **тот же origin** `http://localhost:3000/api/...` (rewrites → `http://backend:8000` внутри сети Docker).

**Полезные команды:**

```powershell
make logs              # все сервисы
make logs-backend
make logs-frontend
make stop              # docker compose down
make migrate           # вручную alembic upgrade (если нужно)
make shell-backend     # bash внутри backend-контейнера
make shell-db          # psql
```

### 2.2. Production-подобный стек (nginx + SSL)

```powershell
make prod
```

Используется `docker-compose.prod.yml` (nginx, certbot). Нужны DNS и сертификаты; первый выпуск — см. `make ssl-init` в `Makefile` и комментарии в `nginx/`.

Для чисто локальной проверки prod-образов чаще достаточно `make dev-d`.

---

## 3. ElevenLabs (голосовой Ustaz)

### 3.1. Где взять **system prompt** для Ustaz

Промпт для агента в ElevenLabs **не подставляется из кода при каждом запросе** — он задаётся **в настройках Conversational Agent** в кабинете ElevenLabs (или создаётся/обновляется через их API).

**Готовый текст, который можно скопировать в System prompt агента:**

1. **Полный драфт** (роль, `{{user_name}}` и др. dynamic variables, список инструментов, first message) — в плане проекта:  
   [`docs/main-setup-plan.md`](./main-setup-plan.md) → раздел **«### System prompt Ustaz (финальный драфт)»** (блок в тройных backticks начиная с «Ты — Ustaz…»).

2. **Короче, в виде константы Python** (удобно держать рядом с описанием client tools для скрипта создания агента):  
   [`backend/app/scripts/setup_elevenlabs_agent.py`](../backend/app/scripts/setup_elevenlabs_agent.py) — переменная **`SYSTEM_PROMPT`**.

Скопируйте один из вариантов в поле **System prompt** при создании/редактировании агента. Имена **client tools** в кабинете должны совпадать с тем, что регистрирует фронт: [`frontend/app/space-chess/lib/coach/use-ustaz.ts`](../frontend/app/space-chess/lib/coach/use-ustaz.ts) и [`client-tools.ts`](../frontend/app/space-chess/lib/coach/client-tools.ts).

**Опционально:** из корня, с установленными зависимостями backend и переменной `ELEVENLABS_API_KEY`, можно попробовать скрипт (если реализован до конца под актуальный ElevenLabs API):

```powershell
docker compose exec backend python -m app.scripts.setup_elevenlabs_agent
```

Он должен вывести или создать агента и подсказать `ELEVENLABS_AGENT_ID` для `.env` (см. комментарии в начале файла скрипта).

### 3.2. Зачем что нужно в `.env`

- **`ELEVENLABS_API_KEY`** — секретный ключ API (не класть в клиентский код; используется только на **backend** при вызове `get_signed_url`).
- **`ELEVENLABS_AGENT_ID`** — идентификатор **Conversational Agent**, созданного в кабинете ElevenLabs.

Без этих переменных эндпоинт `POST /api/v1/chess/coach/session` вернёт **503** с текстом о необходимости настройки. Сайт при этом может работать; для коуча остаётся **текстовый режим**, если задан `ANTHROPIC_API_KEY`.

### 3.3. Пошагово в кабинете ElevenLabs

1. Зарегистрируйтесь / войдите на [elevenlabs.io](https://elevenlabs.io/).
2. **API key:** раздел Developers / API keys → создайте ключ, вставьте в `.env` как `ELEVENLABS_API_KEY=xi_...`.
3. **Conversational AI / Agents:** создайте агента (персона Ustaz, язык, system prompt, **Client tools** под ваши имена инструментов — см. фронт `use-ustaz.ts` / `client-tools.ts`).
4. Скопируйте **Agent ID** (в URL или в настройках агента), в `.env`: `ELEVENLABS_AGENT_ID=...`.
5. Перезапустите backend (или `docker compose up` заново).

Подписанный URL для браузера backend получает запросом к ElevenLabs; длительность жизни URL ограничена (на стороне ElevenLabs).

### 3.4. Подстановка **{{user_name}}** и других dynamic variables

Если агент **буквально говорит** «`{{user_name}}`», обычно одно из двух:

1. **В опубликованной версии агента не объявлены переменные.** В кабинете ElevenLabs для агента откройте раздел **Personalization / Dynamic variables** (или аналог в вашей версии UI) и задайте **placeholders** для тех же имён, что в промпте и в первом сообщении: `user_name`, `user_level`, `opponent_level`, `current_opening`, `recent_principles`, `game_id` (значения по умолчанию — для теста в UI; в приложении их перезапишет клиент). Официально это же поле можно задать в API как `conversation_config.agent.dynamic_variables.dynamic_variable_placeholders` — см. [`setup_elevenlabs_agent.py`](../backend/app/scripts/setup_elevenlabs_agent.py) в блоке `AGENT_CONFIG` (после правки перезапустите скрипт **осознанно**: он патчит агента).

2. **Не опубликован черновик** — в разговор попадает старая **Public**-конфигурация без плейсхолдеров. Нажмите **Publish** в агенте.

Со стороны приложения при старте сессии уходят те же ключи из [`frontend/app/space-chess/lib/coach/use-ustaz.ts`](../frontend/app/space-chess/lib/coach/use-ustaz.ts) (`startSession({ dynamicVariables: { ... } })`). Имена должны **точно** совпадать с `{{...}}` в тексте агента (регистр и подчёркивания).

Документация ElevenLabs: [Dynamic variables](https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables).

---

## 4. Anthropic (текстовый коуч)

1. Ключ: [console.anthropic.com](https://console.anthropic.com/) → API Keys.
2. В `.env`: `ANTHROPIC_API_KEY=sk-ant-...`.
3. Эндпоинт: `POST /api/v1/chess/coach/text-turn` (используется как fallback без голоса).

Модель в коде задана в `backend/app/chess/service.py` (`text_turn`); при смене модели правьте там же.

---

## 5. Stockfish

- **На сервере (Docker backend):** в образ ставится бинарник `stockfish`; анализ партий/ходов в Python идёт через `python-chess` + Stockfish.
- **В браузере (опционально):** в `frontend/public/stockfish/` положите WASM-сборку (см. `frontend/public/stockfish/README.md`). Если файлов нет, клиент использует упрощённый движок на `chess.js`.

---

## 6. Проверка, что всё живо

| Проверка | URL / команда |
|----------|----------------|
| Backend | `curl http://localhost:8000/health` → `{"status":"ok"}` |
| Frontend | браузер `http://localhost:3000/space-chess` |
| БД из Docker | `make shell-db` → `\dt` в psql |

---

## 7. Частые проблемы

| Симптом | Что сделать |
|---------|-------------|
| `push` в Git огромный | Убедиться, что `node_modules/` и `.next/` в `.gitignore`; снять с индекса: `git rm -r --cached frontend/node_modules` |
| Frontend не достучится до API в Docker | В dev для frontend заданы `NEXT_PUBLIC_API_URL=""` и `BACKEND_INTERNAL_URL=http://backend:8000` — не переопределяйте их на `http://localhost:8000` внутри контейнера |
| CORS при локальном фронте на 3000 и API на 8000 | Либо пустой `NEXT_PUBLIC_API_URL` + rewrites, либо добавьте origin в `CORS_ORIGINS` в `backend/app/core/config.py` / `.env` (для списков в Pydantic v2 иногда нужен JSON в env — проще использовать rewrites) |
| `make migrate-new` не работает в PowerShell | Цель в Makefile использует `read` (bash); используйте Git Bash / WSL или создайте ревизию вручную: `docker compose exec backend alembic revision --autogenerate -m "описание"` |
| ElevenLabs 401/403 | Проверить ключ, billing, права агента |
| Alembic «relation already exists» | БД не пустая; либо `docker compose down -v` (удалит volumes!), либо выровнять версию миграций вручную |

---

## 8. Windows / PowerShell — без `make`

На Windows `make` часто не установлен. Все цели из [`Makefile`](../Makefile) — это обёртки над **`docker compose`**. Работайте из **корня** репозитория (где лежат `docker-compose.yml` и `.env`).

Общий префикс для dev (чтобы не повторять):

```powershell
$dc = "docker compose -f docker-compose.yml -f docker-compose.dev.yml"
```

| Было (`make`) | PowerShell (эквивалент) |
|---------------|-------------------------|
| `make dev` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build` |
| `make dev-d` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d` |
| `make prod` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d` |
| `make stop` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml down` *(если поднимали dev; иначе см. ниже)* |
| `make logs` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f` |
| `make logs-backend` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend` |
| `make logs-frontend` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend` |
| `make migrate` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend alembic upgrade head` |
| `make seed` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python -m app.scripts.seed` |
| `make shell-backend` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend bash` |
| `make shell-frontend` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend sh` |
| `make shell-db` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U chess -d chess_db` |

**Остановить стек:** используйте те же `-f`, что и при `up`, иначе Compose может не найти проект:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Для **prod**-профиля замените второй файл на `docker-compose.prod.yml` в `up` / `down` / `logs`.

**Новая миграция (вместо `make migrate-new` с bash `read`):**

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend alembic revision --autogenerate -m "краткое_описание"
```

**Очистка с удалением volumes** (как `make clean` — осторожно, сотрёт данные БД в Docker):

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
docker system prune -f
```

---

## 9. Краткая шпаргалка (PowerShell)

```powershell
cd путь\к\chess-learning

Copy-Item .env.example .env
# отредактировать .env

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# в другом окне или после старта:
start http://localhost:3000/space-chess
```

Дополнительно: корневой [`README.md`](../README.md), [`docker-compose.dev.yml`](../docker-compose.dev.yml).

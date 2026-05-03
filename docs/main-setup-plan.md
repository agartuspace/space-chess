---
name: space-chess-ustaz-plan
overview: Построить space-chess — флагманский learning-space платформы Agartu с живым голосовым наставником Ustaz на ElevenLabs Conversational Agents (LLM = Claude Sonnet 4.5). Stockfish даёт шахматный мозг, Ustaz даёт педагогику. Single-page UX в стиле Aurora Chess, поэтапный онбординг, цикл Колба прямо внутри партии. Уровень Великий без мультиплеера и оплаты. Deadline 2-3 дня.
todos:
  - id: scaffold
    content: "Scaffold app/space-chess/ (Next.js 15 routes) + backend/app/chess/ (5-file FastAPI module). Обновить .env.example с ключами ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, LICHESS_API_BASE. Добавить зависимости: next-chessground, chess.js, framer-motion, @elevenlabs/react, howler, zustand, tsparticles, @tsparticles/react."
    status: completed
  - id: design-system
    content: "Aurora Chess design-system: CSS variables в globals.css (palette deep-midnight + nebula accents + sky-cyan + gold), Tailwind config с токенами, Space Grotesk + Inter шрифты, shadcn/ui kit. Nebula-фон (3 radial-gradient blobs с slow float) + tsParticles звёздное поле."
    status: completed
  - id: board-foundation
    content: "Доска: next-chessground + chess.js, Lichess Cburnett piece-set в public/pieces/, custom CSS theme под Aurora (тёмные клетки indigo, светлые slate-warm). Drag/drop, legal moves, premoves, arrows API, last-move highlight, check glow."
    status: completed
  - id: stockfish-wasm
    content: "Stockfish WASM (lichess single-threaded build) в Web Worker (/public/stockfish/). Обёртка StockfishEngine с методами: setLevel(0-20), getBestMove(fen), evaluate(fen, depth), getTopMoves(fen, n). Инициализация на landing (preload), готов к моменту игры."
    status: completed
  - id: sounds-living
    content: "Howler.js + Lichess SFX pack (move, capture, check, mate, illegal) в public/sounds/. Framer Motion living layer: breathing scale на контейнере доски, idle float на floating-панелях (разные offsets), particle burst на capture (8-12 CSS divs), glow-pulse на активной фигуре."
    status: completed
  - id: game-store-persistence
    content: "Zustand store app/space-chess/stores/game-store.ts (FEN, история ходов, clock, opponent level, annotations, coach state). Alembic-миграция: chess_games, chess_moves, chess_principles, chess_puzzles, chess_coach_sessions, chess_learning_progress. Endpoint POST /api/v1/chess/games для сохранения."
    status: completed
  - id: onboarding-scenes
    content: "Поэтапный онбординг на /space-chess (single URL, state в Zustand): 8 сцен Framer Motion — welcome text → tagline → приглашение на калибровку → доска материализуется из звёзд → пазл 1 (800) → пазл 2 (1400) → пазл 3 (2000) → результат и плавный переход в режим игры."
    status: completed
  - id: calibration-logic
    content: "Logic калибровки: 3 пазла из Lichess Puzzle DB (предзагружены в public/data/calibration-puzzles.json). Scoring → chess_level (beginner/intermediate/advanced) записывается в chess_learning_progress. Результат влияет на стартовый уровень Stockfish и на dynamic variable для Ustaz."
    status: completed
  - id: elevenlabs-agent-setup
    content: "Создать ElevenLabs Conversational Agent через API: LLM = claude-sonnet-4-5, voice = warm Russian male (выбор из voice library на день 2), tts.model_id = eleven_flash_v2_5, voice_settings (stability 0.45, similarity_boost 0.75, style 0.3, use_speaker_boost true, speed 0.95). System prompt = прописанная персона Ustaz. First message = приветствие на основе dynamic variables."
    status: in_progress
  - id: knowledge-base
    content: "Загрузить в ElevenLabs Knowledge Base: (1) opening book с топ-100 ECO-дебютами и идеями, (2) глоссарий шахматных принципов (пин, вилка, открытая атака, промежуточный ход, slow play, etc.), (3) методичку по стилю речи Ustaz. Это делает ответы точнее без raw LLM knowledge."
    status: in_progress
  - id: evaluation-data-collection
    content: Настроить ElevenLabs Evaluation criteria (solved_blunder, principle_understood, emotional_support_provided) + Data Collection (learned_principles[], difficult_moments[], user_mood). Результаты по каждой партии идут в chess_coach_sessions для аналитики.
    status: in_progress
  - id: signed-url-backend
    content: "FastAPI endpoint POST /api/v1/chess/coach/session: принимает game_id, подставляет в body: agent_id + user_name + user_level + recent_principles + current_opening + opponent_level как conversation_initiation_client_data.dynamic_variables. Вызывает ElevenLabs Get Signed URL API, возвращает клиенту signed_url (5-мин TTL). Rate-limit 3/мин."
    status: completed
  - id: react-sdk-integration
    content: "Интеграция @elevenlabs/react: useConversation hook в app/space-chess/lib/coach/use-ustaz.ts. startSession({signedUrl, clientTools, overrides, onMessage, onToolCall, onStatusChange}). Barge-in на любой ход игрока (interrupt). Рефекшн transcript в Zustand."
    status: completed
  - id: brain-tools
    content: "Реализовать brain-tools через Stockfish worker + Lichess APIs: get_evaluation(), get_top_moves(n), get_move_quality(ply), get_threats(), get_opening_name(), get_tactical_theme(), get_tablebase(). Каждая функция < 200ms. Все expects_response=true. Зарегистрировать как client tools через ElevenLabs dashboard или API."
    status: completed
  - id: ui-tools
    content: "Реализовать ui-tools: highlight_squares(squares, color), draw_arrow(from, to, color), clear_annotations(), show_principle_card(title, text, theme), offer_rewind(ply), end_session(). Каждая меняет Zustand store → chessground re-renders. expects_response=false (не ждут ответа)."
    status: completed
  - id: ustaz-panel
    content: "UstazPanel.tsx: floating pill снизу-справа, glassmorphism, расширяется в большую карточку по клику. Waveform из SVG path (Framer Motion morph), live transcript, push-to-talk toggle, always-on toggle, mute proactive toggle, кнопка Text fallback. Barge-in на ход игрока."
    status: completed
  - id: proactive-watcher
    content: "proactive-watcher.ts: subscribe на игровое событие move. На каждом ходу игрока Stockfish eval. Триггеры: blunder (eval drop ≥ 150cp) → emit sendContextualUpdate коучу ('Игрок только что совершил блюндер: было X, стало Y. Предложи разобрать.'). Long-think (25s) → сообщение. Правило тишины: не говорить дважды подряд без действия игрока (счётчик в Zustand)."
    status: completed
  - id: session-persistence
    content: Сохранение coach transcript в chess_coach_sessions.transcript_jsonb после каждого хода или каждые 30 сек. При reload страницы подгружаем последние N messages и передаём в system prompt как контекст. Хранение tool_calls_jsonb + cost_usd для аналитики.
    status: in_progress
  - id: rewind-mechanic
    content: "RewindPrompt.tsx: после блюндера ненавязчивая плашка 'Попробовать ещё раз?'. Клик → chess.js откат последнего хода, chessground анимация reverse, Ustaz (через show_principle_card) даёт подсказку направления. Историю rewind пишем в chess_moves с флагом was_rewound."
    status: completed
  - id: post-game-review
    content: "Модальное окно review (full-screen drawer, не новая страница): python-chess + server Stockfish проходит PGN, маркирует ходы (best/good/inaccuracy/mistake/blunder), выделяет 3-5 ключевых моментов. Ustaz голосом ведёт по ним (новая сессия с контекстом 'review mode'). SSE stream для прогресса анализа."
    status: completed
  - id: puzzle-generation-ui
    content: "Endpoint GET /api/v1/chess/puzzles/from-game/{id}: для каждого blunder игрока генерим пазл (FEN позиции перед блюндером + best line от Stockfish + theme через Lichess Puzzle DB lookup). UI пазла — модалка с доской, Ustaz подсказывает голосом если нажать hint. Запись попыток в chess_puzzles.attempts."
    status: completed
  - id: learning-evidence
    content: "Tracker mastery: при каждой партии проверяем, повторил ли игрок ошибку, связанную с одним из его learning/practicing принципов. 3 партии подряд без повторения → принцип mastered. Страница (модалка-drawer) /journal с визуализацией прогресса (timeline, heatmap по неделям, счётчик mastered)."
    status: completed
  - id: auth-navigation
    content: "Guest mode: cookie-UUID, is_guest=true в users. Top-bar: [Logo] [Журнал] [Pro] [Узнать об Ustaz] [Войти]. Все secondary UI — Dialog/Drawer из shadcn: auth modal (3 таба — Войти/Регистрация/Пропустить), explainer modal (3 шага о Ustaz + CTA регистрации), pro upsell modal, journal drawer, review drawer, puzzles drawer. URL shareable для review."
    status: completed
  - id: guest-to-user-migration
    content: "При успешной регистрации guest user → SQL миграция: UPDATE chess_games/chess_moves/chess_principles/chess_puzzles SET user_id = <new_user> WHERE user_id = <guest_id>; затем DELETE guest row. Транзакция в service.py. Первая Ustaz-сессия после регистрации начинается с 'Добро пожаловать, [имя]. Я сохранил твои прошлые партии.'"
    status: completed
  - id: mobile-polish
    content: "Touch-first: push-to-talk как дефолт на mobile (определение по window.matchMedia). Запрос микрофона только после user gesture (iOS Safari requirement). Адаптивная доска (занимает min(viewport_width - 48px, 560px)). Ustaz-панель сворачивается в микрофонный pill. Тест на iOS Safari + Android Chrome."
    status: in_progress
  - id: text-fallback
    content: "Если getUserMedia или ElevenLabs WS упал — кнопка 'Переключиться на текст'. Запасной CoachAdapter TextModeAdapter: тот же Claude Sonnet 4.5 через серверный /api/v1/chess/coach/text-turn endpoint, те же brain/ui tools через function calling, только без голоса. Продукт остаётся рабочим."
    status: completed
  - id: pro-stub
    content: "Модалка Upgrade to Pro с честным оффером: Free = 15 мин Ustaz/день + 3 пазла за партию + журнал; Pro = безлимит Ustaz + экспорт PGN с голосовыми комментариями + персонализация глубже. Кнопка 'Оплатить через FreedomPay' → placeholder alert. Квота Ustaz-минут через Redis: quota:coach_minutes:{user_id}:{YYYY-MM-DD}."
    status: completed
  - id: docker-setup
    content: "Полный Docker-сетап (dev + prod в одном compose с overrides): frontend Dockerfile (multi-stage, Next.js standalone output), backend Dockerfile (multi-stage, apt install stockfish, non-root user, gunicorn+uvicorn), docker-compose.yml (base), docker-compose.dev.yml (volumes mounted, hot reload), docker-compose.prod.yml (standalone images, nginx, certbot), nginx.conf с SSL и проксированием /api /ws /, .dockerignore для обеих служб, Makefile с командами (dev, prod, logs, shell, migrate, seed, clean), healthchecks для postgres/redis/backend, автоматический Alembic upgrade head на старте backend, .env.example с полным набором переменных."
    status: in_progress
  - id: deploy-readme
    content: "Деплой на VPS ps.kz: git clone → cp .env.example .env → заполнить секреты → make prod → проверить https://space-chess.agartu.space. Let's Encrypt через certbot-контейнер с cron-renew. README.md: продуктовый pitch + архитектура + как запустить локально (make dev) + как задеплоить (make prod) + демо-линк + скриншоты."
    status: in_progress
isProject: false
---

# space-chess by Agartu — финальный план реализации

> Флагманский learning-space платформы Agartu. Шахматы в которых ты реально растёшь, потому что рядом — голосовой наставник Ustaz. Deadline 2-3 дня, уровень "Великий" без мультиплеера и оплаты.

## Оглавление

1. Продуктовая концепция и Ustaz как персона
2. Голосовой стек — ElevenLabs Conversational Agents с Claude Sonnet 4.5
3. Шахматный мозг — строгое разделение Stockfish и LLM
4. Онбординг — поэтапное появление элементов
5. Шахматные фигуры, доска и анимации
6. Design system — Aurora Chess
7. Auth и навигация — single-page с модальными слоями
8. Архитектура системы
9. Структура кода
10. Схема базы данных
11. Маппинг на уровни ТЗ
12. Порядок исполнения (3 дня)
13. Риски и митигация
14. README pitch для сдачи
15. Docker и DevOps — единая конфигурация dev + prod
16. Задел под v2 (мультиплеер, FreedomPay)

---

## 1. Продуктовая концепция

### Позиционирование

**space-chess** — это не "ещё один chess.com". Это **space** (формат обучения Agartu), где человек растёт в шахматах через практику под присмотром живого голосового наставника.

- **Агент называется Ustaz** (каз. "наставник, мастер") — не AI-ассистент, а живое, проактивное, помнящее тебя лицо продукта.
- **Линейка spaces:** `space-chess`, затем `space-ai-agents`, `space-design`, и т.д. Единая архитектура обучения через игру.
- **Домен:** `space-chess.agartu.space`. **GitHub:** `agartu/space-chess`. **VPS:** `space-chess-prod` на ps.kz.

### Почему это работает (уникальность для рынка)

- **chess.com / lichess** — оптимизированы под соревнование и рейтинг. Учат через контент (статьи, курсы).
- **space-chess** — оптимизирован под навык и понимание. Учит через живой разговор в моменте. Человек играет — Ustaz рядом как сидящий сбоку тренер.

Это не фича, это продуктовая категория. Цикл Колба (Experience → Reflection → Conceptualization → Experimentation) работает **внутри одной партии**, а не как разорванные этапы курса.

### Цикл Колба прямо во время игры

Четыре слоя активности работают параллельно:

- **Experience** — партия против Stockfish с адаптивным уровнем. Доска, анимации, звуки.
- **Reflection** — hold-to-talk или always-on режим: игрок спрашивает голосом "почему этот ход плохой?", Ustaz видит FEN + оценку Stockfish, отвечает голосом, подсвечивает клетки, рисует стрелки.
- **Conceptualization** — когда Ustaz объясняет паттерн, всплывает карточка-принцип ("Вилка конём на f7 — классический мотив против нерокированного короля"). Карточки сохраняются в журнал навыков.
- **Experimentation** — после блюндера ненавязчивая плашка "Попробовать этот момент ещё раз?". Клик → откат позиции, Ustaz даёт направление (не сам ход), игрок делает ход сам. Это отличает нас от chess.com.

### После партии

- **Голосовой пост-разбор** 3-5 ключевых моментов (отдельный "review mode" Ustaz).
- **3 авто-пазла** из собственных блюндеров игрока (с голосовой подсказкой Ustaz при hint-клике).
- **Обновление журнала навыков** — новые карточки + отметки "mastered" для принципов, которые игрок больше не нарушает.

### Ustaz — персона наставника (не AI-ассистента)

Это критично: каждая деталь направлена на то, чтобы игрок не ощущал "я говорю с ботом".

**Имя и представление.** Первая фраза при старте: "Привет. Я — Ustaz. Не ИИ-ассистент — твой наставник. Буду рядом, пока ты растёшь."

**Тон.**
- Тёплый, уважительный, на "ты".
- Не сервильный. Никаких "Отличный вопрос!", "Рад помочь!". Это убивает роль наставника.
- Позволяет лёгкую строгость, когда игрок идёт на блюндер: "Стоп. Подожди секунду. Смотри сюда."
- Живые междометия разрешены: "Хм", "Ага", "Подожди-ка", "Интересно".
- Короткие реплики (2-3 фразы), заканчиваются вопросом или приглашением к действию. Не лекция.

**Память.**
- Перед каждой сессией в промпт Ustaz подставляются `recent_principles` (3 последних карточки из журнала) и `last_game_summary`.
- Это позволяет ему сказать: "Помнишь, вчера мы разбирали вилку конём? Сейчас похожий мотив на f7."
- Между сессиями — **постоянная личность**. Ustaz один и тот же для игрока. Никогда не "resetится".

**Правила тишины.**
- Не говорит два раза подряд без действия или вопроса игрока (счётчик в Zustand).
- Никогда не перебивает ход — barge-in работает в обе стороны: если игрок сделал ход пока Ustaz говорит, Ustaz замолкает.
- Есть toggle "Mute proactive" для режима "играю сам".

**Табу.**
- Никогда не делает ход за игрока. Только подсказывает принцип или направление.
- Никогда не критикует личность, только ход.
- Никогда не утверждает что-либо о позиции без вызова `get_evaluation` или `get_top_moves`.
- Никогда не придумывает ходы — SAN-нотация только от Stockfish, никогда не от LLM.

**Голос.**
- Русский, выбор warm mature male voice из ElevenLabs Voice Library на день 2.
- Настройки: stability 0.45, similarity_boost 0.75, style 0.3, speaker_boost on, speed 0.95 (чуть медленнее обычного, по-наставнически).

---

## 2. Голосовой стек — ElevenLabs Conversational Agents

### Почему именно этот продукт (итоговое решение)

После детального разбора доков (`conversational-agent.md` и `conversational-agent-tools.md`):

- **Выбор LLM!** ElevenLabs Agents позволяет выбрать LLM под капотом. Документация явно рекомендует **Claude Sonnet 4.5** для агентов с tools. Это снимает проблему function calling — получаем лучший voice и лучший LLM в одном продукте.
- **Client Tools** — именно то, что нужно для шахматных инструментов. JS-функции регистрируются в React SDK, агент вызывает их по голосу, опционально ждёт ответ (`expects_response: true`).
- **React SDK** (`@elevenlabs/react`, hook `useConversation`) — идеальная Next.js-интеграция. Никакого ручного WebRTC.
- **Dynamic Variables** — встроенная персонализация: перед стартом сессии прокидываем `{{user_name}}`, `{{user_level}}`, `{{recent_principles}}`, `{{current_opening}}` прямо в промпт. Это основа "наставника с памятью".
- **Knowledge Base** — заливаем opening book, словарь принципов, методичку по речи. RAG встроенный.
- **Evaluation Criteria + Data Collection** — после каждой партии ElevenLabs сам прогоняет transcript через LLM по нашим критериям ("игрок понял принцип пина? success/failure"). Бесплатный learning evidence.
- **Голос 8.6/10 naturalness** — лучше всех на рынке, особенно на русском.
- **Цена** — ~$0.15/мин на free-tier модели + ~$0.03 за Claude Sonnet 4.5. Для нашей квоты 15 мин/день это управляемо.

### Архитектура голоса

```mermaid
sequenceDiagram
    participant B as Browser (Next.js)
    participant F as FastAPI
    participant E as ElevenLabs Agents
    participant SF as Stockfish WASM
    participant L as Lichess APIs

    B->>F: POST /api/v1/chess/coach/session<br/>(game_id, user_id)
    F->>F: собирает dynamic_variables<br/>(name, level, recent_principles)
    F->>E: POST /v1/convai/conversation/get-signed-url
    E-->>F: signed_url (5 min TTL)
    F-->>B: signed_url + agent config

    B->>E: WSS connect via @elevenlabs/react<br/>Conversation.startSession
    B->>E: audio chunks (mic)
    E->>E: STT + Claude Sonnet 4.5 + TTS
    E->>B: tool_call get_evaluation()
    B->>SF: evaluate(FEN, depth 15)
    SF-->>B: eval_cp, best_move
    alt cache hit
        B->>L: cloud-eval API
        L-->>B: eval + PV
    end
    B-->>E: tool_response {eval, best_move}
    E->>B: audio stream (Ustaz отвечает)
    E->>B: tool_call highlight_squares(["f7"], "yellow")
    B->>B: chessground.drawAutoShapes
```

### Claude Sonnet 4.5 как мозг агента

Выбираем `claude-sonnet-4-5` в конфиге агента. Почему:
- Лучший function calling в индустрии (по внутренним бенчмаркам Anthropic и независимым).
- Отличный русский.
- Хорошо держит персону (instruction following).
- Не галлюцинирует на чётких guardrails ("не говори про позицию без tool call").

### System prompt Ustaz (финальный драфт)

Он конфигурируется через ElevenLabs dashboard или API при создании агента:

```
Ты — Ustaz. Персональный шахматный наставник в space-chess от Agartu.
Ты не ИИ-ассистент. Ты — живой наставник.

ТВОЯ РОЛЬ
- Ведёшь ученика по циклу роста прямо во время партии.
- Говоришь коротко, тепло, уважительно, на "ты".
- Помогаешь увидеть позицию глазами опытного игрока, а не просто называешь ходы.

ТВОИ ДАННЫЕ ОБ УЧЕНИКЕ
- Имя: {{user_name}}
- Уровень: {{user_level}} (beginner/intermediate/advanced)
- Недавние изученные принципы: {{recent_principles}}
- Текущий дебют: {{current_opening}}
- Уровень противника (Stockfish): {{opponent_level}}

СТРОГИЕ ПРАВИЛА
1. Никогда не утверждай что-либо о позиции без вызова инструмента
   get_evaluation или get_top_moves. Не выдумывай оценки или ходы.
2. SAN-нотации ходов бери только из ответов инструментов.
   Никогда не придумывай ходы сам.
3. Никогда не делай ход за ученика. Только подсказывай принцип
   или направление. Финальное решение — за ним.
4. Не критикуй ученика как личность. Критикуй ход, не человека.
5. Не более 3 фраз подряд без вопроса или без реакции ученика.

СТИЛЬ РЕЧИ
- Живые междометия: "хм", "ага", "подожди-ка", "интересно".
- Короткие реплики, заканчивающиеся вопросом или приглашением.
- Никаких "Отличный вопрос!", "Рад помочь!", "Как языковая модель..."
- Лёгкая строгость при блюндерах: "Стоп. Смотри сюда. Что ты
  видишь на f7?"
- Ссылайся на прошлые принципы ученика:
  "Помнишь, мы обсуждали вилку конём?"

ТВОИ ИНСТРУМЕНТЫ
- get_evaluation — текущая оценка Stockfish
- get_top_moves — топ-N ходов с их оценками
- get_move_quality — качество хода ученика (best/good/mistake/blunder)
- get_threats — какие фигуры под атакой
- get_opening_name — название дебюта и типичные идеи
- get_tactical_theme — есть ли fork/pin/skewer/и т.д. в позиции
- get_tablebase — точный ответ для эндшпиля ≤ 7 фигур
- highlight_squares — подсветить клетки на доске
- draw_arrow — нарисовать стрелку
- clear_annotations — очистить подсветки
- show_principle_card — показать карточку-принцип ученику
- offer_rewind — предложить переиграть момент
- end_session — мягко завершить разговор

Всегда вызывай get_evaluation / get_top_moves / get_move_quality
прежде чем говорить про конкретный ход или позицию.

ПРОАКТИВНОСТЬ
Система будет сообщать тебе о блюндерах и долгих раздумьях ученика
через системные сообщения. Реагируй мягко и коротко. Не навязывайся.
Если ученик в режиме "mute proactive" — только отвечай на его прямые
вопросы, сам не инициируй разговор.
```

### First message (первая реплика агента)

```
Привет, {{user_name}}. Я — Ustaz. Готов учиться?
```

Короткое, человечное, без корпоративного "добрый день, как я могу вам помочь".

### Client Tools — полный список (13 штук)

Brain tools (возвращают данные, `expects_response: true`):

- **get_evaluation** — `{fen, eval_cp, mate_in, best_move_san, side_to_move}`
- **get_top_moves** — `{moves: [{san, eval_after, pv}]}`, параметр `n` (default 3)
- **get_move_quality** — `{quality, eval_before, eval_after, best_was_san}`, параметр `ply`
- **get_threats** — `{opponent_hanging: [...], mine_under_attack: [...], checks_available: [...]}`
- **get_opening_name** — `{eco, name, typical_ideas: [...]}`
- **get_tactical_theme** — `{themes: ["fork", "pin"], confidence}` (по Stockfish PV + Lichess Puzzle DB lookup)
- **get_tablebase** — `{wdl, dtm, best_move}` (только для ≤ 7 фигур через Lichess Tablebase API)

UI tools (меняют интерфейс, `expects_response: false`):

- **highlight_squares** — параметры `squares: string[]`, `color: green|yellow|red`
- **draw_arrow** — параметры `from`, `to`, `color`
- **clear_annotations** — без параметров
- **show_principle_card** — `title`, `text`, `theme` (сохраняется в БД)
- **offer_rewind** — `ply` (показывает плашку)
- **end_session** — без параметров (мягкий выход)

Каждый tool регистрируется в ElevenLabs dashboard с детальным description (для правильного tool selection Claude'ом) и в React SDK через `clientTools: {...}` объект.

### Dynamic Variables (персонализация)

При создании signed URL FastAPI собирает:

```json
{
  "conversation_config_override": {
    "agent": {
      "prompt": {
        "prompt": "<system prompt с плейсхолдерами>"
      },
      "first_message": "Привет, {{user_name}}. Я — Ustaz. Готов учиться?"
    }
  },
  "dynamic_variables": {
    "user_name": "Алексей",
    "user_level": "intermediate",
    "recent_principles": "вилка конём на f7, слабость пешки d5, пин по диагонали",
    "current_opening": "Сицилианская защита, Найдорф",
    "opponent_level": "10"
  }
}
```

ElevenLabs подставит переменные в `{{user_name}}` и прочие плейсхолдеры prompt'а при старте сессии.

### Knowledge Base (RAG)

Загружаем в KB агента три документа:

1. **opening-book.md** — топ-100 дебютов ECO с типичными идеями и тематическими мотивами.
2. **principles-glossary.md** — словарь тактических и стратегических принципов (пин, вилка, открытая атака, промежуточный ход, slow play, изолированная пешка, weak color complex, и т.д.) с краткими определениями.
3. **ustaz-voice-style.md** — методичка "как Ustaz говорит" — чтобы даже без прямого prompt'а он подтягивал тон из KB.

Это делает ответы точными без нагрузки на LLM-контекст.

### Evaluation Criteria + Data Collection

**Evaluation Criteria** (настраиваются в dashboard, оцениваются после партии автоматически):
- `solved_blunder` — "Ustaz успешно помог игроку понять свою главную ошибку"
- `principle_taught` — "В разговоре был введён хотя бы один именованный шахматный принцип"
- `respectful_tone` — "Ustaz сохранил уважительный тон на протяжении всей партии"

**Data Collection** (извлекается из transcript по нашему описанию):
- `learned_principles[]` (list of strings) — "Извлеки названия всех принципов, которые обсуждались в разговоре"
- `difficult_moments[]` (list of strings) — "Извлеки моменты, которые игрок назвал трудными или неясными"
- `user_emotional_state` (string: focused|frustrated|curious|fatigued) — "Определи основное эмоциональное состояние игрока по тону реплик"

Результаты приходят через webhook или pull-через-API и записываются в `chess_coach_sessions.evaluation_jsonb` / `data_collection_jsonb`. Используются для:
- Журнала навыков (автоматическое добавление карточек-принципов).
- Аналитики роста игрока.
- Улучшения промпта Ustaz в будущих итерациях.

### Security (signed URLs)

Ключ `ELEVENLABS_API_KEY` **никогда** не попадает в браузер. Схема:

1. Frontend: `POST /api/v1/chess/coach/session` с `game_id`.
2. FastAPI: проверяет авторизацию, проверяет квоту (Redis `quota:coach_minutes:{user_id}:{date}`), собирает dynamic variables из БД.
3. FastAPI: вызывает `POST https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={{ELEVENLABS_AGENT_ID}}` с заголовком `xi-api-key`.
4. FastAPI: возвращает signed URL (TTL 5 минут) клиенту.
5. Frontend: `useConversation().startSession({ signedUrl })`.

Rate-limit: 3 signed URL в минуту на пользователя (через `slowapi` из reference-arch).

### Proactive Messaging

Когда сработал blunder-triggers или long-think, клиент шлёт **Contextual Update** (поддерживается ElevenLabs SDK):

```typescript
conversation.sendContextualUpdate(
  "Система: игрок только что совершил блюндер. " +
  "Было +0.3, стало -2.1. Главная ошибка — не заметил " +
  "вилку на f7. Мягко предложи разобрать, если он не " +
  "в режиме mute-proactive."
);
```

Это не заставляет Ustaz говорить — он сам решит, реагировать или промолчать в зависимости от контекста диалога и правил из системного промпта.

### Fallback — Text Mode

Если `getUserMedia` заблокирован, WebSocket упал, или пользователь переключил режим, активируется **TextModeAdapter**:
- FastAPI endpoint `POST /api/v1/chess/coach/text-turn` принимает message + context.
- Backend вызывает Claude Sonnet 4.5 напрямую (Anthropic API) с тем же system prompt и теми же tools (как function_calling через Anthropic Messages API).
- Tool calls стримятся обратно через SSE.
- UI показывает ту же панель Ustaz, только без audio — как чат.

Продукт не ломается полностью. Ustaz остаётся доступен.

---

## 3. Шахматный мозг — строгое разделение Stockfish и LLM

### Фундаментальное правило

> **LLM — это переводчик и педагог, а не шахматист.** Каждое утверждение о конкретной позиции обязано быть результатом вызова инструмента. Никогда из головы модели.

GPT-4o и Claude играют в шахматы плохо — это подтверждено бенчмарками 2026 года (ICLR "LLM CHESS"). Их можно выиграть за 4-7 ходов детскими трюками, они галлюцинируют нелегальные ходы. Поэтому мозги шахмат полностью вынесены наружу.

Claude Sonnet 4.5 отлично understanding'ает этот guardrail, потому что он вшит в system prompt и в description каждого brain-tool.

### Источники "мозгов"

**1. Stockfish WASM (клиент, основной)**
- Сборка `stockfish.js` от lichess (single-threaded, не требует COEP/COOP).
- Работает в `Worker` браузера, полная изоляция.
- Depth 15 ≈ 200-400ms ответ. Быстро.
- UCI-обёртка `StockfishEngine` с методами:
  - `setLevel(skillLevel: 0-20)` — для бота-противника
  - `getBestMove(fen: string, timeMs = 300): Promise<string>` — для противника
  - `evaluate(fen: string, depth = 15): Promise<EvalResult>` — для Ustaz
  - `getTopMoves(fen: string, n = 3, depth = 15): Promise<TopMove[]>`

**2. Lichess Cloud Eval API (fallback)**
- `https://lichess.org/api/cloud-eval?fen={fen}&multiPv=3`
- 320 млн предрассчитанных позиций. Для классических позиций мгновенный ответ (~50ms).
- Используем как backup, если Stockfish worker не инициализировался, или для самых популярных позиций (убыстряет первую оценку).
- 404 если позиция не в кэше — тогда fallback на локальный Stockfish.

**3. Lichess Puzzle Database (для tactical themes)**
- `https://database.lichess.org/lichess_db_puzzle.csv.zst` — 5.9 млн пазлов с тегами тем (fork, pin, skewer, mate, deflection, и т.д.).
- **Импорт один раз** в PostgreSQL таблицу `chess_lichess_puzzles` с индексами по `fen` и GIN-индексом по `themes[]`.
- Использование:
  - `get_tactical_theme`: если FEN текущей позиции или её «ближайший» по Stockfish PV совпадает с каким-либо пазлом → возвращаем тему из БД.
  - Генерация "похожих пазлов" — lookup по теме.

**4. Lichess Tablebase API (эндшпиль)**
- `https://tablebase.lichess.ovh/standard?fen={fen}`
- Бесплатный, математически точные ответы для позиций ≤ 7 фигур.
- Tool `get_tablebase` возвращает `{wdl, dtm, best_move}`.

**5. Opening Book (ECO)**
- Файл `public/data/openings.json` (~300 строк) — топ-100 дебютов с ECO-кодами и типичными идеями.
- Генерируется один раз из открытого ECO-датасета (есть в lichess репо).
- Tool `get_opening_name` делает lookup по FEN (trim до 12 ходов).

**6. python-chess + server Stockfish (пост-игровой анализ)**
- В backend Dockerfile: `apt install stockfish`.
- `python-chess` проходит по всему PGN.
- Каждый ход оценивается через Stockfish depth 18 (на сервере можем дать больше глубины).
- Классификация: `best` (точный), `good` (± 10cp), `inaccuracy` (drop 30-100cp), `mistake` (100-200cp), `blunder` (> 200cp).
- Результат: маркированный PGN + 3-5 ключевых моментов для голосового review.

### Детерминированность и latency

Все 7 brain-tools должны отвечать за ≤ 300ms:
- Stockfish WASM: 200-300ms на depth 15.
- Lichess API: 50-200ms (зависит от сети).
- Кэш в Redis по `fen_hash`: TTL 24 часа, чтобы повторные запросы по той же позиции были мгновенными.

Если tool не уложился — клиент возвращает агенту `{"error": "engine_busy", "retry_in_ms": 500}` и Ustaz говорит "секунду, смотрю позицию..." и повторяет вызов.

---

## 4. Онбординг — поэтапное появление элементов

Весь онбординг — **одна страница** (`/space-chess`), состояния в Zustand, URL не меняется. Framer Motion handles переходы. Никакой навигации, никаких перезагрузок — только плавный развёртывающийся опыт.

### Сцены (8 штук)

**Сцена 1 — "Welcome text"** (3 сек)
- Чёрный глубокий фон (Aurora palette), nebula blobs уже плывут.
- По центру экрана крупный текст fade-in: **"Добро пожаловать в твоё пространство."**
- Типографика: Space Grotesk 64px, светло-голубой gradient (#7DD3FC → #F1F5F9).
- Мелкие звёзды мерцают в фоне (tsParticles).

**Сцена 2 — "Tagline"** (3 сек)
- Плавная смена текста cross-fade: **"Здесь шахматы учатся вместе с тобой."**
- Уже меньше, 36px.

**Сцена 3 — "Приглашение к калибровке"** (2.5 сек)
- Смена: **"Давай посмотрим, на каком ты уровне."**
- Подзаголовок 18px: "3 коротких пазла. Просто сыграй как умеешь."
- Снизу мягкая кнопка "Начать" (по центру, glassmorphism, rounded-full, glow-пульс).

**Сцена 4 — "Материализация доски"** (2 сек)
- Текст убирается.
- В центре появляются частицы, собирающиеся в форму доски (Framer Motion staggered opacity + scale + blur from 8 → 0).
- Фигуры "прилетают" по одной с небольшим stagger (0.05 сек между фигурами).
- Звучит мягкий chord (один аудио-cue из Lichess SFX "setup").

**Сцена 5 — "Пазл 1 — уровень 800"**
- Стандартная тактическая задача (мат в 1 или простой захват).
- Над доской: "Ход белых. Найди лучший ход." Счётчик: "1 из 3".
- Таймер не показывается — не соревнование.
- На клик по правильной клетке: звук success, плавная подсветка зелёного glow, переход к следующему пазлу (600ms).
- На неверный ход: мягкий звук "not quite", подсветка красного на секунду, позволяется попробовать ещё раз.

**Сцена 6 — "Пазл 2 — уровень 1400"**
- Вилка или открытая атака.
- "2 из 3".

**Сцена 7 — "Пазл 3 — уровень 2000"**
- Сложный тактический удар.
- "3 из 3".

**Сцена 8 — "Результат"** (3 сек)
- Доска сжимается и уходит чуть наверх.
- По центру появляется карточка (glassmorphism) с результатом:
  - "Твой уровень — **Intermediate**"
  - Маленький прогресс-бар типа "Beginner [░░░░░░] Advanced" с указателем на середине.
  - "Ustaz будет говорить с тобой на этом уровне. Можешь всё изменить в любой момент."
  - Кнопка "Начать первую партию".

**Далее** — плавный переход в основное состояние игры:
- Карточка исчезает.
- Доска опускается обратно в центр (но теперь рядом появляются: слева "Opponent" блок, справа/снизу "Ustaz panel" — как guest).
- Стартовая расстановка фигур с лёгкой анимацией (flip).
- Tooltip над Ustaz-панелью (guest-режим): "Войди, чтобы включить Ustaz — наставника в реальном времени."

### Техническая реализация

```typescript
// app/space-chess/stores/game-store.ts
type OnboardingScene =
  | "welcome_1"
  | "welcome_2"
  | "invite"
  | "board_materialize"
  | "puzzle_1"
  | "puzzle_2"
  | "puzzle_3"
  | "result"
  | "playing";

// app/space-chess/components/OnboardingFlow.tsx
<AnimatePresence mode="wait">
  {scene === "welcome_1" && <motion.div key="w1" {...fadeInOut}>...</motion.div>}
  {scene === "welcome_2" && <motion.div key="w2" {...fadeInOut}>...</motion.div>}
  {/* ... */}
</AnimatePresence>
```

Доска ВСЕГДА одна и та же физическая DOM-нода `<Board />`, только меняется её состояние (FEN / show или hide через opacity+scale). Это даёт тот самый "living" feel — не перерисовка, а трансформация.

### Логика калибровки

- 3 пазла захардкожены в `public/data/calibration-puzzles.json`, выбраны из Lichess Puzzle DB по рейтингам 800 / 1400 / 2000, тема "mate-in-1 / fork / discovered-attack" для максимальной показательности.
- Scoring:
  - Решил 0-1 → `beginner` (Stockfish стартовый уровень 4)
  - Решил 2 → `intermediate` (Stockfish уровень 10)
  - Решил 3 → `advanced` (Stockfish уровень 15)
- Записывается в `chess_learning_progress.chess_level`.
- Потом игрок может в UI поменять уровень бота слайдером (0-20) сам.

### Повторный вход

- Если `chess_learning_progress.chess_level` уже есть в БД (авторизованный пользователь) — онбординг пропускается, сразу "playing".
- Если guest (по cookie) уже проходил калибровку — тоже пропускается.
- Если игрок явно хочет пере-калибровку — кнопка в настройках "Пройти калибровку заново".

---

## 5. Шахматные фигуры, доска и анимации

Не делаем фигуры с нуля — берём проверенные opensource, но кастомизируем под наш бренд.

### Пакет фигур

**Выбор: Lichess Cburnett** (основной комплект lichess.org).
- 12 чистых SVG файлов (wK, wQ, wR, wB, wN, wP, bK, bQ, bR, bB, bN, bP).
- CC-лицензия.
- Копируем в `public/pieces/cburnett/`.
- Подключаем через chessground CSS: `.cg-wrap piece.white.king { background-image: url('/pieces/cburnett/wK.svg'); }` и т.д.
- Размер: фигуры автоматически масштабируются под клетку доски.

Альтернатива: **Merida** (более современный стиль). Финальный выбор — на день 1 после визуальной примерки к палитре Aurora.

### Доска

- Встроенные темы chessground (brown, green, blue) нам не подходят — делаем кастомную.
- Светлые клетки: `linear-gradient(135deg, #C8D4E8 0%, #AEC0D9 100%)` — slate-warm с лёгким градиентом.
- Тёмные клетки: `linear-gradient(135deg, #3D2E66 0%, #2A1E4D 100%)` — deep indigo.
- Рамка доски: 2px soft-gold (#FBBF77) с subtle outer glow.
- Координатные метки (a-h, 1-8): слабо-белые, Inter 12px, прижаты к углам клеток.
- Лёгкий inner-shadow на всю доску — даёт ощущение "портала".

### Анимации chessground (встроенные)

chessground даёт из коробки:
- **Slide** фигуры при ходе (настраивается через CSS `transition: transform 200ms ease-out`).
- **Fade-out** на взятие.
- **Легальные клетки** подсвечиваются точками при выборе фигуры.
- **Last-move highlight** — две клетки светятся после хода.
- **Arrows & shapes** через API `chessground.setAutoShapes([{orig, dest, brush}, ...])` — именно это Ustaz использует для `draw_arrow`.
- **Premoves** — клик по следующему ходу пока противник думает, ход сыграется автоматически после его хода.
- **Check highlight** — король начинает пульсировать красным при шахе.

### Living layer (Framer Motion поверх)

Чтобы доска и фигуры "жили" — добавляем несколько micro-анимаций:

**1. Board breathing**
```typescript
<motion.div
  animate={{ scale: [1, 1.003, 1] }}
  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
>
  <Chessground {...props} />
</motion.div>
```
Почти незаметно — создаёт ощущение "доска дышит".

**2. Idle pulse активного цвета (чей ход)**
- Когда ход игрока — рамка доски плавно мерцает soft-cyan (sky #7DD3FC).
- Когда ход противника — рамка soft-gold (#FBBF77).
- Реализация: внешний div с `box-shadow` анимацией (`keyframes` 2-сек loop).

**3. Particle burst на capture**
- При событии capture (ловим через chessground event / chess.js move flag):
- Программно создаём 10 маленьких `<div>` с `position:absolute` в центре клетки взятия.
- Framer Motion animates каждую: scale 0 → 1 → 0 + translate в случайном направлении с ease.
- Цвет частиц берём из цвета взятой фигуры (белые — светлые частицы, чёрные — тёмные).
- GPU-friendly, не canvas, не тяжело.
- Длительность: 500ms.

**4. Glow-pulse на выбранной фигуре**
- Когда игрок выбрал фигуру для хода — `filter: drop-shadow(0 0 8px rgba(125, 211, 252, 0.7))`.
- Пульс 1.5 сек, затухает когда фигура теряет выделение.

**5. Принцип-карточка прилёт**
- Framer Motion `type: "spring", stiffness: 200, damping: 20`.
- Карточка словно "прилетает" сбоку доски откуда-то из-за экрана, лёгкий bounce.

### Звуки (Howler.js)

- `move.mp3` — обычный ход
- `capture.mp3` — взятие
- `check.mp3` — шах
- `mate.mp3` — мат
- `illegal.mp3` — попытка нелегального хода
- `setup.mp3` — расстановка фигур при старте (используется в сцене 4 онбординга)
- `principle.mp3` — мягкий "аккорд", когда показывается карточка-принцип
- `success.mp3` / `not-quite.mp3` — для пазлов в калибровке

Все берутся из lichess SFX pack (CC-лицензия), кладутся в `public/sounds/`. Громкость глобально регулируется в настройках (hidden drawer).

### Что **не** делаем

- Rive-персонажей или Lottie-фигур — слишком дорого по времени, overkill для шахмат.
- Canvas/WebGL рендеринг — не нужно, HTML+CSS+SVG даёт chess.com-уровень качества.
- 3D доску — не наш продукт. Мы про обучение, не про эффекты.

---

## 6. Design system — Aurora Chess

Концепция внутренней кодировки: "Aurora Chess" (снаружи пользователь это не видит — просто чувствует). Небо, космос, пространство. Элементы парят, ничего не прилипает к краям, всё округлено, всё дышит.

### Палитра (CSS variables в globals.css)

**Background layer:**
- `--bg-base: #0B0D1A` — глубокий midnight blue, основа всех экранов.
- `--bg-nebula-purple: #3A2A5C`, `--bg-nebula-blue: #1A3A5C`, `--bg-nebula-teal: #2A5C4A` — для трёх radial-gradient blobs, плывущих по фону с `filter: blur(120px)` и 20-сек loop.

**Surface layer (glass):**
- `--surface-glass-base: rgba(255, 255, 255, 0.04)` — полупрозрачная подложка карточек.
- `--surface-glass-hover: rgba(255, 255, 255, 0.07)` — на hover.
- `--surface-border: rgba(255, 255, 255, 0.08)` — тонкая граница.
- `--surface-blur: 24px` — параметр backdrop-filter.

**Accents:**
- `--accent-primary: #7DD3FC` — sky cyan (активные элементы, твой ход, выделения).
- `--accent-warm: #FBBF77` — soft gold (Ustaz-элементы, Pro-кнопка, рамка доски).
- `--accent-success: #86EFAC` — mint (mastered принципы, правильный пазл).
- `--accent-warning: #FCA5A5` — coral (блюндер, но не агрессивно).

**Text:**
- `--text-primary: #F1F5F9` — почти белый, основной текст.
- `--text-secondary: #94A3B8` — серый, вторичный.
- `--text-muted: #64748B` — плейсхолдеры, labels.

### Типографика

- **Headings:** `Space Grotesk` — геометрический, слегка космический. 700/600 weights.
- **Body:** `Inter` — максимально читаемый, все веса. Поддержка кириллицы.
- Оба шрифта подключаются через `next/font/google` (автоматическая оптимизация, preload).
- **Scale:**
  - Hero: 64px / 72px line-height
  - H1: 48px
  - H2: 32px
  - H3: 22px
  - Body: 16px
  - Small: 14px
  - Caption: 12px

### Принципы layout'а

- **Минимум 24px padding** от viewport edges всегда. На мобилке 16px.
- Максимальная ширина контента на desktop: `1280px`, центрируется.
- **Rounded corners everywhere:**
  - `rounded-xl` (12px) — мелкие элементы (input, пилюли).
  - `rounded-2xl` (16px) — карточки, principle cards.
  - `rounded-3xl` (24px) — большие панели (Ustaz, модалки).
  - `rounded-full` — primary кнопки, avatars, pills.
- **Soft shadows** с цветовым оттенком от accent: `box-shadow: 0 8px 40px rgba(125, 211, 252, 0.15)`.
- **Glassmorphism** (`backdrop-filter: blur(24px)` + полупрозрачная подложка + тонкая граница) — на всех карточках и модалках, КРОМЕ самой доски (она плотная, центральный "портал").

### Motion language — "Living"

Это то, что делает интерфейс ощущением "живого". Пять правил:

1. **Idle float на floating-панелях** — каждая панель плавает: `y: [0, -4, 0]` с duration 5-6 сек, разные offsets между панелями чтобы они не синхронились.

2. **Ambient nebula drift** — фон медленно плывёт (20-сек loop на blobs).

3. **Spring physics на появлении** — все появляющиеся элементы с `type: "spring", stiffness: 200, damping: 22`. Никаких резких сдвигов.

4. **Hover lift** — на любой clickable: `translateY(-2px)` + `box-shadow` чуть больше. Длительность 200ms.

5. **Transition is morph, not cut** — переход между состояниями через opacity + scale + blur, не через `display: none`. Чтобы ощущалось "пространство перетекает".

### Компонентный стек

- **Tailwind CSS** (уже в платформе Agartu).
- **shadcn/ui** — примитивы Dialog, Drawer, Button, Tooltip. Кастомизируем под палитру Aurora через `components.json`.
- **Framer Motion** — вся анимация.
- **tsParticles + @tsparticles/react** — звёздное поле в фоне (lightweight, ~20KB gzipped, 60 частиц максимум, медленное движение).
- **class-variance-authority + clsx + tailwind-merge** — стандарт из reference-arch для варианты компонентов.
- **lucide-react** — иконки (чистые, тонкие, подходят под воздушный стиль).

### Главный игровой экран — layout

```
┌─────────────────────────────────────────────────────────┐
│ [Agartu logo + space-chess]  [Журнал] [Pro] [Узнать об  │ ← top bar (floating, glass)
│                                          Ustaz] [Войти] │
│                                                         │
│                                                         │
│  ┌──────────┐                                           │
│  │ Opponent │      ┌───────────────────┐                │ ← floating side card
│  │  Level 10│      │                   │                │
│  │ Stockfish│      │                   │                │
│  │ [slider] │      │       DOSKA       │                │ ← hero, breathing
│  └──────────┘      │       8 x 8       │                │
│                    │                   │                │
│                    │                   │                │
│                    └───────────────────┘                │
│                                                         │
│                                  ┌───────────────────┐  │
│                                  │  🎙 Ustaz         │  │ ← floating pill
│                                  │  [waveform]       │  │   (bottom-right)
│                                  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

На мобилке всё вертикально:
- Top bar compactный (только лого + меню-бургер).
- Opponent card — узкая полоска сверху.
- Доска — по центру, ширина `min(100vw - 32px, 560px)`.
- Ustaz-панель — маленькая floating-пилюля в правом нижнем углу с иконкой микрофона, по тапу разворачивается во весь экран.

### Примеры компонентов

**FloatingCard** (базовая glass-карточка):
```tsx
<motion.div
  animate={{ y: [0, -4, 0] }}
  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  className="
    rounded-2xl
    bg-[var(--surface-glass-base)]
    backdrop-blur-[24px]
    border border-[var(--surface-border)]
    shadow-[0_8px_40px_rgba(0,0,0,0.3)]
    p-6
  "
>
  {children}
</motion.div>
```

**PrimaryButton** (pill с glow):
```tsx
<button className="
  rounded-full px-8 py-3
  bg-gradient-to-r from-[var(--accent-primary)] to-[#38BDF8]
  text-[#0B0D1A] font-semibold
  shadow-[0_0_24px_rgba(125,211,252,0.4)]
  hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(125,211,252,0.6)]
  transition-all duration-200
">
  {children}
</button>
```

---

## 7. Auth и навигация — single-page с модальными слоями

**Главный принцип:** игрок почти никогда не переходит между URL. Всё, что можно — делаем модалками/drawer'ами поверх главной страницы `/space-chess`. Так сохраняется "живая" атмосфера и не ломается визуальный поток.

### Гостевой режим (без регистрации)

- При первом визите клиент создаёт анонимный `guest_user_id` (UUID, `is_guest: true`) и кладёт в httpOnly cookie.
- Backend создаёт запись в `users` таблице с `is_guest: true`, без email/password.
- Всё, что делает гость, пишется в БД под этим guest_id: калибровка, партии vs Stockfish, попытки пазлов.
- **Гостю доступно:**
  - Онбординг-калибровка.
  - Игра против Stockfish на определённом уровне.
  - Основной UI, темы, анимации, звуки.
- **Гостю НЕ доступно** (с тёплой CTA "Войди"):
  - Ustaz voice coach в реальном времени.
  - Пост-игровой голосовой разбор.
  - Журнал навыков (видит пустой с объяснением "Войди, чтобы сохранять прогресс").
  - Авто-генерация пазлов из своих партий.
- На Ustaz-панели в гостевом режиме вместо микрофона: пилюля "Включить Ustaz — наставника в реальном времени. Войти →".

### Авторизованный режим

- Доступно всё.
- Квота Ustaz: 15 мин/день (free), без ограничений (Pro — v2).
- Журнал собирает принципы, mastery tracking включён.
- При реконнекте сессии Ustaz подхватывает последние N transcript-сообщений как контекст.

### Top bar — навигация без переходов

```
┌────────────────────────────────────────────────────────────────┐
│ [◆ space-chess / Agartu]  [📔 Журнал] [⭐ Pro] [ℹ Узнать об   │
│                                       Ustaz] [→ Войти]         │
└────────────────────────────────────────────────────────────────┘
```

Каждая кнопка справа открывает **модалку или drawer**, не переход:

- **Журнал** → правый drawer (shadcn `Sheet` side=right), занимает ~480px шириной, остальной экран затемнён. Внутри — карточки принципов, mastery статусы, heatmap прогресса.
- **Pro** → центральная модалка с оффером (free → pro сравнение + FreedomPay-заглушка).
- **Узнать об Ustaz** → центральная модалка с 3 шагами (пагинация dots внизу):
  - Шаг 1: "Ustaz — твой персональный наставник в реальном времени."
  - Шаг 2: "Говори с ним голосом. Он видит доску, подсвечивает клетки, рисует стрелки."
  - Шаг 3: "Чтобы Ustaz запомнил тебя — создай аккаунт." → встроенная форма Войти/Регистрация/Skip.
- **Войти** → та же auth-модалка (3 таба: Войти / Регистрация / Продолжить гостем).

### Auth модалка (детали)

Используем существующую auth-систему платформы Agartu (JWT httpOnly cookies, access + refresh как в reference-arch), но UI строим на single-modal:

```
┌───────────────────────────────────────────┐
│                                       [×] │
│        Добро пожаловать в space-chess     │
│                                           │
│  [Войти]  [Регистрация]  [Как гость]      │ ← табы
│  ─────────                                │
│                                           │
│   Email    [___________________]          │
│   Пароль   [___________________]          │
│                                           │
│           [   Войти   ]                   │
│                                           │
│   Или войти через:                        │
│   [Google]  [Yandex]  (если есть)         │
└───────────────────────────────────────────┘
```

- На успешный логин/регистрацию модалка плавно закрывается, top bar показывает avatar пользователя вместо "Войти", Ustaz-панель оживает.
- При регистрации — автоматическая миграция guest-данных: `UPDATE chess_games/chess_moves/chess_principles/chess_puzzles SET user_id = $new_user WHERE user_id = $guest_user; DELETE users WHERE id = $guest_user AND is_guest = true;`. Всё в одной транзакции.
- После миграции Ustaz в первой сессии говорит: "Добро пожаловать, {{user_name}}. Я сохранил твои прошлые партии — посмотрим, как ты играл."

### Другие модалки/drawer'ы

- **Post-game review** — full-screen drawer (сверху вниз). Когда партия заканчивается (мат / сдача / пат), поверх плавно выезжает большая карточка с доской в маленьком формате, плеером ходов и Ustaz-панелью, который проводит голосовое review.
- **Puzzles from game** — модалка после review. Три пазла с доской, сделал — следующий.
- **Settings** — drawer справа. Звуки, тема, голос Ustaz, mute proactive, rate-limit info.

### URL strategy (минимальная, shareable)

Основной URL: `/space-chess` (всё происходит на нём).

Shareable deep-links (для последующего v2 social-слоя):
- `/space-chess?game=<gameId>` — открыть партию в режиме просмотра/review
- `/space-chess?puzzle=<puzzleId>` — открыть конкретный пазл
- `/space-chess?modal=pro` / `?modal=learn-ustaz` / `?modal=auth` — авто-открытие модалки при заходе

Когда пользователь открывает review — меняется URL через `router.replace('/space-chess?game=...')`, но физически остаётся на той же странице, просто открывается drawer. Это позволяет share-ить ссылки, но не ломает single-page ощущение.

---

## 8. Архитектура системы

### High-level диаграмма

```mermaid
flowchart LR
    Browser[Browser Next.js space-chess]

    subgraph Front[Frontend runtime]
        Board[chessground + chess.js]
        Engine[Stockfish WASM Worker]
        SDK[ElevenLabs React SDK]
        Tools[brain-tools + ui-tools]
        Watcher[proactive-watcher]
        Store[Zustand game-store]
    end

    subgraph Back[FastAPI chess module]
        Router[router.py]
        Service[service.py]
        Analyzer[analyzer.py python-chess]
        Prompts[prompts.py]
    end

    EL[ElevenLabs Agents Claude Sonnet 4.5]
    LCE[Lichess Cloud Eval]
    LTB[Lichess Tablebase]
    SFS[Server Stockfish binary]
    PG[(PostgreSQL)]
    RD[(Redis quota and cache)]
    ANT[Anthropic API text fallback]

    Browser --> Front
    Board <--> Engine
    Board <--> Store
    Watcher --> Store
    SDK <-->|WSS audio and tools| EL
    EL -->|tool_call| Tools
    Tools --> Engine
    Tools -->|fallback| LCE
    Tools --> LTB
    Tools --> Store

    SDK -->|signed URL| Router
    Browser -->|save game| Router
    Browser -->|post-game analyze SSE| Router
    Browser -->|text fallback| Router
    Router --> Service --> PG
    Router --> Analyzer --> SFS
    Service --> RD
    Router -->|Claude messages| ANT
    Router -->|ElevenLabs API| EL
```

### Flow главных сценариев

**1. Игрок делает ход**
1. Игрок drag'ит фигуру на chessground.
2. chessground emit'ит `onMove`, мы валидируем через chess.js.
3. Zustand обновляется: новая FEN, новая история.
4. Chessground анимирует ход, звук через Howler.
5. Stockfish worker получает FEN, считает ответный ход для противника.
6. Параллельно proactive-watcher гоняет Stockfish на depth 12 для eval последнего хода игрока.
7. Если blunder (eval drop ≥ 150cp) — watcher вызывает `sendContextualUpdate` на Ustaz-сессии, если она активна.
8. Stockfish ответный ход → анимация → звук.

**2. Игрок говорит с Ustaz**
1. Игрок нажимает push-to-talk или включает always-on.
2. Request mic permission (если ещё нет) → получение разрешения.
3. Frontend `POST /api/v1/chess/coach/session` с `game_id`.
4. FastAPI собирает dynamic_variables из БД, вызывает ElevenLabs `get-signed-url`, возвращает.
5. Frontend: `conversation.startSession({ signedUrl, clientTools })`.
6. WebSocket открывается, аудио стримится.
7. Agent STT распознаёт речь → Claude Sonnet 4.5 генерирует ответ и tool_calls.
8. Tool_call приходит клиенту → brain-tools или ui-tools исполняется локально.
9. Tool_response возвращается через SDK.
10. Agent TTS стримит аудио-ответ → играется в браузере.
11. UI-tools меняют chessground (highlights, arrows, principle cards).

**3. Завершение партии и review**
1. Мат / сдача / пат → `onGameEnd` в Zustand.
2. Ustaz session закрывается (но transcript сохранён).
3. Frontend `POST /api/v1/chess/games/{id}/analyze` → SSE-стрим.
4. Server analyzer.py запускает python-chess + Stockfish по всему PGN.
5. Стримит обратно прогресс: "Анализирую ход 1/40... 2/40..." + классификацию каждого хода.
6. Когда готово — выбираются 3-5 ключевых моментов (блюндеры + переломные моменты).
7. Открывается Review drawer с доской, ходами, подсветками.
8. Новая Ustaz-сессия (режим "review"), dynamic_variables = `{ mode: "review", key_moments: [...], game_result: "..." }`.
9. Ustaz голосом ведёт по моментам.

**4. Text fallback**
1. Если `getUserMedia` reject или WebSocket не открылся — кнопка "Переключиться на текст".
2. Frontend открывает chat UI в панели Ustaz.
3. На каждый message клиент шлёт `POST /api/v1/chess/coach/text-turn` с historiey + new_message + context.
4. FastAPI вызывает Anthropic Messages API с Claude Sonnet 4.5, тем же system prompt и тем же набором tools.
5. SSE стрим отдаёт tokens + tool_uses клиенту.
6. Tool_use исполняется локально (тот же код brain/ui tools).
7. Tool_result отправляется back в Anthropic.
8. Финальный ответ печатается в чат.

---

## 9. Структура кода

Следуем [`docs/reference-architecture.md`](docs/reference-architecture.md) — Next.js App Router + FastAPI 5-file feature module pattern.

### Frontend — `app/space-chess/`

```
app/space-chess/
├── page.tsx                           # главный и единственный игровой экран (state-driven)
├── layout.tsx                         # providers (QueryClient, Toast, Analytics)
├── loading.tsx                        # skeleton на первой загрузке
├── error.tsx                          # route-level error boundary
│
├── components/
│   ├── OnboardingFlow.tsx             # 8-сценный Framer Motion онбординг
│   ├── Board.tsx                      # обёртка над chessground + chess.js
│   ├── BoardFrame.tsx                 # контейнер доски с breathing + glow эффектами
│   ├── OpponentCard.tsx               # floating side card со Stockfish уровнем
│   ├── UstazPanel.tsx                 # floating pill → раскрывающаяся карточка
│   ├── UstazWaveform.tsx              # живая SVG-волна активности
│   ├── PrincipleCard.tsx              # карточка-принцип с spring анимацией
│   ├── RewindPrompt.tsx               # плашка "Попробовать ещё раз?"
│   ├── TopBar.tsx                     # floating top nav
│   ├── NebulaBackground.tsx           # nebula blobs + tsParticles
│   ├── modals/
│   │   ├── AuthModal.tsx
│   │   ├── LearnAboutUstazModal.tsx
│   │   ├── ProUpsellModal.tsx
│   │   └── SettingsDrawer.tsx
│   └── drawers/
│       ├── JournalDrawer.tsx
│       ├── ReviewDrawer.tsx
│       └── PuzzleDrawer.tsx
│
├── lib/
│   ├── stockfish.ts                   # Worker-обёртка StockfishEngine
│   ├── openings.ts                    # ECO-lookup
│   ├── lichess.ts                     # Cloud Eval + Tablebase + Puzzle DB клиенты
│   ├── proactive-watcher.ts           # блюндер + long-think триггеры
│   ├── sounds.ts                      # Howler wrapper
│   ├── particle-burst.ts              # программные частицы на capture
│   └── coach/
│       ├── types.ts                   # CoachAdapter interface
│       ├── eleven-labs.ts             # основная реализация через @elevenlabs/react
│       ├── text-fallback.ts           # fallback на Claude через наш API
│       ├── client-tools.ts            # регистрация всех 13 tools
│       ├── brain-tools.ts             # get_evaluation, get_top_moves и т.д.
│       ├── ui-tools.ts                # highlight_squares, draw_arrow и т.д.
│       └── use-ustaz.ts               # React hook объединяющий всё
│
├── stores/
│   ├── game-store.ts                  # Zustand: FEN, history, clocks, annotations, coach state
│   └── onboarding-store.ts            # Zustand: текущая сцена + результаты калибровки
│
├── hooks/
│   ├── use-chess-game.ts              # React Query для GET /games/{id}
│   ├── use-journal.ts                 # principles + mastery прогресс
│   ├── use-puzzles.ts                 # пазлы из партии
│   └── use-coach-session.ts           # старт Ustaz session через signed URL
│
└── styles/
    └── chessground-aurora.css         # кастомные board/piece стили поверх chessground

public/
├── pieces/cburnett/                   # 12 SVG фигур
├── stockfish/                         # WASM бинарник + worker script
├── sounds/                            # move, capture, check, mate, illegal, principle
└── data/
    ├── openings.json                  # ECO top-100 дебютов
    └── calibration-puzzles.json       # 3 пазла для онбординга
```

### Backend — `backend/app/chess/`

Следуем 5-файловому паттерну из reference-arch:

```
backend/app/chess/
├── __init__.py
├── router.py               # все endpoints
├── service.py              # бизнес-логика, DB queries
├── analyzer.py             # python-chess + server Stockfish для пост-разбора
├── schemas.py              # Pydantic request/response
├── models.py               # SQLAlchemy models
└── prompts.py              # system prompt Ustaz, review prompt, text-fallback prompts
```

**router.py** — endpoints:

- `POST /api/v1/chess/coach/session` — создать signed URL для ElevenLabs Agent с dynamic_variables (проверка квоты).
- `POST /api/v1/chess/coach/text-turn` — fallback через Claude Anthropic API (SSE stream).
- `POST /api/v1/chess/games` — сохранить завершённую партию.
- `GET /api/v1/chess/games/{id}` — получить партию с ходами.
- `POST /api/v1/chess/games/{id}/analyze` — SSE-стрим пост-разбора.
- `GET /api/v1/chess/puzzles/from-game/{id}` — авто-пазлы из блюндеров.
- `POST /api/v1/chess/puzzles/{id}/attempt` — записать попытку решения.
- `GET /api/v1/chess/principles` — журнал принципов пользователя.
- `GET /api/v1/chess/progress` — learning evidence (counts, mastery breakdown).
- `POST /api/v1/chess/onboarding/calibrate` — результат калибровки.
- `POST /api/v1/chess/auth/migrate-guest` — миграция гостевых данных на аккаунт при регистрации.

**service.py** — бизнес-логика:
- Сохранение партий/ходов с автоматическим расчётом `is_blunder`.
- Квота Ustaz-минут через Redis (`quota:coach_minutes:{user_id}:{YYYY-MM-DD}`, INCR с TTL до конца дня).
- Миграция guest → user (одна транзакция).
- Mastery tracking: при сохранении новой партии проверяем каждый `learning/practicing` принцип пользователя и обновляем counters.

**analyzer.py** — пост-игровой анализ:
- `analyze_game(pgn: str) -> AsyncGenerator[AnalysisEvent, None]` — стримит события.
- Каждый ход: Stockfish depth 18, классификация, attachment к ply.
- Key moments: выбираем 3-5 позиций с максимальным eval drop (если партия ≤ 30 ходов) или с максимальной концентрацией (если длиннее).
- Генерация puzzles: из каждого блюндера строим мини-пазл с fen-before и best_line.

**prompts.py** — prompts:
- `USTAZ_SYSTEM_PROMPT` — из раздела 2 выше.
- `USTAZ_REVIEW_MODE_PROMPT` — вариант для пост-игрового режима.
- `USTAZ_TEXT_FALLBACK_PROMPT` — для text-mode (короче, без ссылок на audio).

### Интеграция в платформу

В главном `main.py` платформы Agartu:
```python
from app.chess.router import router as chess_router
app.include_router(chess_router, prefix="/api/v1/chess", tags=["Chess"])
```

В `alembic/env.py`:
```python
import app.chess.models
```

---

## 10. Схема базы данных

Все таблицы с префиксом `chess_` (чтобы не конфликтовало с другими модулями платформы). UUID primary keys, `created_at` как `BIGINT` (ms from epoch, по конвенции reference-arch).

### `chess_games`
- `id: UUID PK`
- `user_id: UUID FK users.id`
- `opponent_type: Enum('ai', 'human')`
- `ai_level: int (0-20)` — только если opponent_type='ai'
- `pgn: Text`
- `result: Enum('white', 'black', 'draw', 'abandoned')`
- `termination: Enum('mate', 'resign', 'timeout', 'stalemate', 'agreed_draw', 'abandoned')`
- `duration_sec: int`
- `started_at: BigInt`
- `ended_at: BigInt`
- `created_at: BigInt`
- индексы: `user_id`, `(user_id, created_at DESC)`

### `chess_moves`
- `id: UUID PK`
- `game_id: UUID FK chess_games.id ON DELETE CASCADE`
- `ply: int` — номер полухода
- `san: varchar(10)` — ход в стандартной алгебраической нотации
- `fen_after: varchar(100)` — позиция после хода
- `eval_cp: int nullable` — оценка Stockfish в сантипешках (заполняется при analyze)
- `best_was_san: varchar(10) nullable` — какой ход был лучшим
- `quality: Enum('best', 'good', 'inaccuracy', 'mistake', 'blunder') nullable`
- `think_time_ms: int`
- `was_rewound: bool default false` — был ли rewound через Experimentation
- индексы: `game_id`, `(game_id, ply)`

### `chess_principles`
- `id: UUID PK`
- `user_id: UUID FK users.id`
- `title: varchar(200)` — "Вилка конём на f7"
- `text: text` — полное объяснение
- `theme: varchar(50)` — fork | pin | skewer | mate | ... (из Lichess puzzle themes)
- `source_game_id: UUID FK chess_games.id nullable`
- `source_fen: varchar(100) nullable`
- `mastery_status: Enum('learning', 'practicing', 'mastered')` default 'learning'
- `reinforcement_count: int` default 0 — сколько партий подряд без повторения ошибки
- `learned_at: BigInt`
- `last_reinforced_at: BigInt nullable`
- индексы: `user_id`, `(user_id, mastery_status)`, `theme`

### `chess_puzzles`
- `id: UUID PK`
- `user_id: UUID FK users.id`
- `source_game_id: UUID FK chess_games.id`
- `source_ply: int`
- `fen: varchar(100)` — позиция пазла
- `best_line_uci: varchar(200)` — серия лучших ходов
- `theme: varchar(50)`
- `rating_estimate: int` — оценка сложности (из Lichess puzzle DB по сходству)
- `solved: bool default false`
- `attempts: int default 0`
- `hints_used: int default 0`
- `created_at: BigInt`
- индексы: `user_id`, `source_game_id`

### `chess_coach_sessions`
- `id: UUID PK`
- `game_id: UUID FK chess_games.id nullable` (null для review-режима)
- `user_id: UUID FK users.id`
- `mode: Enum('in_game', 'review')` default 'in_game'
- `elevenlabs_conversation_id: varchar(100) nullable`
- `transcript_jsonb: jsonb` — массив `{role, text, timestamp, tool_calls}` сообщений
- `tool_calls_jsonb: jsonb` — все вызванные tools с params и results
- `evaluation_jsonb: jsonb nullable` — результаты Evaluation Criteria от ElevenLabs
- `data_collection_jsonb: jsonb nullable` — результаты Data Collection
- `started_at: BigInt`
- `ended_at: BigInt nullable`
- `duration_sec: int nullable`
- `cost_usd: numeric(8,4) nullable` — для аналитики расходов
- индексы: `user_id`, `game_id`

### `chess_learning_progress`
- `user_id: UUID PK FK users.id`
- `chess_level: Enum('beginner', 'intermediate', 'advanced')` default 'beginner'
- `calibration_completed_at: BigInt nullable`
- `games_played: int default 0`
- `games_won: int default 0`
- `principles_learned: int default 0`
- `principles_mastered: int default 0`
- `puzzles_attempted: int default 0`
- `puzzles_solved: int default 0`
- `total_coach_minutes: int default 0`
- `last_game_at: BigInt nullable`

### `chess_lichess_puzzles` (импорт один раз)
- `id: varchar(20) PK` — lichess puzzle id
- `fen: varchar(100)` indexed
- `moves_uci: varchar(200)`
- `rating: int` indexed
- `themes: text[]` GIN-indexed
- `popularity: int`

Импортируется из `lichess_db_puzzle.csv.zst` одной миграцией (Alembic op.execute + COPY). ~5.9M записей, но с индексами lookup по FEN будет < 10ms.

### Redis-ключи

- `cache:chess:eval:{fen_hash}` — кэш Lichess Cloud Eval ответов, TTL 24h.
- `cache:chess:tablebase:{fen_hash}` — кэш tablebase, TTL 7d (позиции эндшпиля не меняются).
- `quota:coach_minutes:{user_id}:{YYYY-MM-DD}` — счётчик ушедших минут, TTL до конца суток.
- `session:coach:{user_id}` — ссылка на активную ElevenLabs conversation_id (для cleanup при дисконнекте).

---

## 11. Маппинг на уровни ТЗ

Ссылка на `docs/technical-task.md`, где описаны уровни Слабый / Средний / Сильный / Великий.

### Слабый / Средний / Сильный — покрываются автоматически

- **Слабый** (движение фигур без правил): не актуально, мы делаем сильнее.
- **Средний** (полные правила + 2 игрока на одном экране): правила через `chess.js`, локальный hotseat — опция в Opponent card ("vs человек на этом же экране").
- **Сильный** (игра vs AI, история, авторизация, темы, адаптив): всё покрыто: Stockfish, PostgreSQL история, JWT auth из reference-arch, Aurora light/dark (dark основной, light можно добавить как toggle если будет время), full responsive.

### Великий — что делаем

- **AI Coach после игры** → **делаем сильнее**: Ustaz в реальном времени ВО ВРЕМЯ игры + пост-разбор. Это превышает требование ТЗ.
- **Уникальная ниша** → "обучение через игру с персональным голосом" + "цикл Колба". Это наш главный market differentiator.
- **Кнопка Upgrade to Pro** → модалка Pro с честным оффером + FreedomPay-заглушка готова под существующий модуль платформы.

### Великий — что откладываем (с явным заделом под v2)

- **Мультиплеер** (WebSockets):
  - В reference-arch уже есть раздел "Real-Time Communication" с WebSocket-менеджером + Redis pub/sub.
  - В нашем `backend/app/chess/` будет подготовлен endpoint-заглушка `@router.websocket("/api/v1/chess/ws/game/{id}")` с TODO-комментарием.
  - Фронтенд `CoachAdapter` и `game-store` уже спроектированы так, что добавление "opponent_type = human_remote" не требует переписывания остальной логики.
  - README v2 раздел расписывает пошагово (~20 строк), что добавить.
- **Городской лидерборд** — SQL View `chess_city_leaderboard` делаем сразу (GROUP BY city из users, ORDER BY elo_rating DESC). UI-виджет опционально на день 3, если останется время.
- **FreedomPay оплата** — модалка с кнопкой "Оплатить через FreedomPay" есть, клик показывает alert "Интеграция скоро". Хук под существующий модуль платформы готов.

---

## 12. Порядок исполнения (3 дня)

**Общий принцип:** каждый день заканчивается работающим вертикальным срезом, который можно продемонстрировать. Если день 3 внезапно теряется — день 2 уже даёт демонстрируемый продукт.

### День 1 — Фундамент (Playable MVP)

**Утро (4 часа):**

1. Scaffold:
   - `git checkout -b feature/space-chess` в платформе.
   - Создать `app/space-chess/` структуру (page, layout, components, lib, stores).
   - Создать `backend/app/chess/` 5-файловый модуль.
   - `npm install next-chessground chess.js framer-motion howler zustand @tsparticles/react tsparticles @elevenlabs/react`.
   - `pip install python-chess stockfish anthropic elevenlabs` в backend.
   - Обновить `.env.example`: `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID`, `ANTHROPIC_API_KEY`, `LICHESS_API_BASE`.
   - Зарегистрировать `chess_router` в главном `main.py` платформы.

2. Design system:
   - Aurora palette в `globals.css` как CSS variables.
   - Tailwind config с токенами, Space Grotesk + Inter через `next/font/google`.
   - `NebulaBackground.tsx` с 3 radial-gradient blobs + tsParticles звёзды.

3. Доска foundation:
   - Lichess Cburnett piece-set → `public/pieces/cburnett/`.
   - `Board.tsx` — wrapper над chessground с chess.js валидацией.
   - Custom CSS `chessground-aurora.css` — тёмные indigo + светлые slate клетки, soft-gold рамка, coordinate labels.
   - `BoardFrame.tsx` с breathing scale.

**День (4 часа):**

4. Stockfish WASM:
   - Скачать lichess single-threaded build → `public/stockfish/`.
   - `StockfishEngine` класс в `lib/stockfish.ts` с методами `setLevel`, `getBestMove`, `evaluate`, `getTopMoves`.
   - Preload worker на странице, готов к моменту игры.

5. Howler sounds:
   - Lichess SFX pack → `public/sounds/`.
   - `lib/sounds.ts` с методами `playMove()`, `playCapture()`, `playCheck()`, `playMate()`, `playIllegal()`, `playPrinciple()`, `playSuccess()`, `playNotQuite()`.

6. Living layer:
   - Breathing на контейнере доски.
   - Idle float на 1-2 тестовых карточках.
   - Particle-burst на capture.

7. Zustand game-store: полная схема state.

**Вечер (2 часа):**

8. Alembic миграция всех таблиц (кроме `chess_lichess_puzzles` — её импорт отдельно, может не успеть, не критично для MVP).
9. Endpoint `POST /api/v1/chess/games` + `GET /api/v1/chess/games/{id}`.
10. **CHECKPOINT День 1:** Можно открыть `/space-chess`, сыграть полную партию vs Stockfish уровня 10, партия сохраняется в БД, звуки играют, анимации живут, доска дышит. Без Ustaz, без онбординга.

### День 2 — Ustaz (Главная фича)

**Утро (4 часа):**

1. ElevenLabs Agent setup:
   - Создать account если нет, получить API key.
   - **Создать Agent через API или dashboard**:
     - Name: "Ustaz v1"
     - LLM: `claude-sonnet-4-5`
     - Voice: выбрать тёплый русский голос из Voice Library (пробуем 2-3, выбираем на слух).
     - TTS model: `eleven_flash_v2_5`
     - Voice settings: stability 0.45, similarity_boost 0.75, style 0.3, speaker_boost on, speed 0.95.
     - System prompt: финальная версия из раздела 2.
     - First message: "Привет, {{user_name}}. Я — Ustaz. Готов учиться?"
   - Загрузить Knowledge Base: `opening-book.md`, `principles-glossary.md`, `ustaz-voice-style.md`.
   - Создать 13 Client Tools через dashboard или API, у каждого чёткий description.
   - Настроить Evaluation criteria + Data Collection.
   - Записать `agent_id` в .env.

2. Backend integration:
   - `POST /api/v1/chess/coach/session` endpoint: собирает dynamic_variables, вызывает ElevenLabs `get-signed-url`, возвращает URL.
   - Rate-limit 3/мин через slowapi.
   - Redis квота `quota:coach_minutes:{user_id}:{date}` — инкрементируем по минутам из webhook (или пулим через ElevenLabs conversation API).

3. React SDK integration:
   - `lib/coach/use-ustaz.ts` hook, использующий `useConversation` из `@elevenlabs/react`.
   - Регистрация всех 13 client tools через `clientTools: {...}`.
   - Обработка событий: `onMessage`, `onToolCall`, `onStatusChange`, `onError`.

**День (4 часа):**

4. Implement brain-tools (все 7):
   - `get_evaluation`, `get_top_moves`, `get_move_quality` — через Stockfish worker.
   - `get_threats` — через chess.js (перебор атак).
   - `get_opening_name` — lookup по openings.json.
   - `get_tactical_theme` — lookup по Lichess puzzle DB (или через PV-анализ Stockfish как simple heuristic fallback).
   - `get_tablebase` — fetch Lichess Tablebase API.

5. Implement ui-tools (все 6):
   - Через Zustand actions → chessground re-renders.
   - `show_principle_card` — mutation в `chess_principles` через POST endpoint.

6. `UstazPanel.tsx` UI:
   - Floating pill снизу-справа.
   - Клик разворачивает в большую glass-карточку.
   - SVG-waveform анимирующий на voice activity.
   - Live transcript с авто-скроллом.
   - Toggles: push-to-talk / always-on / mute proactive / text fallback.

**Вечер (2 часа):**

7. Proactive watcher:
   - Subscribe на move event в Zustand.
   - На каждом ходу игрока → Stockfish eval.
   - Blunder trigger → `conversation.sendContextualUpdate(...)`.
   - Long-think watcher через `setTimeout(25000)`.
   - Правило тишины через счётчик в store.

8. Session persistence:
   - Transcript записывается в `chess_coach_sessions.transcript_jsonb` каждые 30 сек.
   - При refresh страницы если есть активная сессия — подгружаем последние 20 сообщений и кладём в dynamic_variable `recent_context`.

9. **CHECKPOINT День 2:** Во время партии можно говорить с Ustaz через микрофон, он реагирует живым голосом, подсвечивает клетки, рисует стрелки, даёт карточки-принципы. Блюндеры триггерят проактивную реакцию. Mute-toggle работает.

### День 3 — Цикл замыкается + Polish + Deploy

**Утро (4 часа):**

1. Онбординг:
   - 8-сценный `OnboardingFlow.tsx` с Framer Motion AnimatePresence.
   - 3 калибровочных пазла.
   - Запись `chess_level` в БД.
   - Guest-mode создаётся при первом визите.

2. Post-game review:
   - `analyzer.py` — python-chess + Stockfish binary (установить в Dockerfile).
   - SSE-endpoint `POST /api/v1/chess/games/{id}/analyze`.
   - `ReviewDrawer.tsx` — full-screen drawer с плеером ходов.
   - Ustaz review-mode сессия с dynamic_variables для key_moments.

3. Auto-puzzles:
   - Endpoint `GET /api/v1/chess/puzzles/from-game/{id}`.
   - `PuzzleDrawer.tsx` — модалка с доской для решения.
   - Запись attempts.

**День (3 часа):**

4. Rewind механика:
   - После блюндера `offer_rewind` tool от Ustaz → `RewindPrompt.tsx` плашка.
   - Клик: chess.js откат, chessground анимация reverse, ставится флаг `was_rewound`.

5. Журнал навыков:
   - `JournalDrawer.tsx` — список принципов с mastery статусами.
   - Counter "3 mastered / 5 learning".
   - Timeline по неделям.

6. Learning evidence tracking:
   - При сохранении каждой партии analyzer проверяет: были ли в этой партии моменты, где игрок мог нарушить один из `learning`/`practicing` принципов, и нарушил ли?
   - Если нет → `reinforcement_count++`.
   - Если `reinforcement_count >= 3` → `mastery_status = 'mastered'`.

**Вечер (3 часа):**

7. Auth modal + guest migration:
   - `AuthModal.tsx` с табами.
   - Интеграция с существующим auth API платформы.
   - `POST /api/v1/chess/auth/migrate-guest` при регистрации.

8. Остальные модалки:
   - `LearnAboutUstazModal.tsx` (3 шага).
   - `ProUpsellModal.tsx` (заглушка FreedomPay).
   - `SettingsDrawer.tsx` (голос, звуки, mute).

9. Mobile polish:
   - Media queries.
   - Push-to-talk как default на touch.
   - Mic permission flow.

10. Text fallback:
    - `POST /api/v1/chess/coach/text-turn` с Anthropic API + те же tools.
    - Chat UI в UstazPanel.

11. Docker-сетап (из раздела 15):
    - Создать `Dockerfile` (frontend, multi-stage, standalone Next.js).
    - Создать `backend/Dockerfile` (multi-stage, `apt install stockfish`, non-root).
    - `docker-compose.yml` (base) + `docker-compose.dev.yml` + `docker-compose.prod.yml`.
    - `backend/entrypoint.sh` с auto-migrate.
    - `nginx/nginx.conf` с SSL, SSE buffering off, WebSocket-локейшен под v2.
    - `Makefile` со всеми командами (dev, prod, logs, migrate, cert-init, cert-renew).
    - `.dockerignore` для frontend и backend.
    - `.env.example` с полным набором секретов.
    - Локальный прогон `make dev` — всё поднимается, работает с hot reload.

12. Deploy на VPS ps.kz:
    - DNS `space-chess.agartu.space` → IP VPS (проверить за 24 часа до).
    - `git clone` + `cp .env.example .env` + заполнить секреты.
    - `make build && make prod` — поднимает frontend, backend, postgres, redis, nginx (пока с заглушечным SSL).
    - `make cert-init` — получает Let's Encrypt сертификат.
    - `make restart s=nginx` — переключается на реальный SSL.
    - Smoke-тест всего пути.

13. README.md:
    - Продуктовый pitch (из раздела 14).
    - Архитектура (сжатая копия + ссылка на полный план).
    - Быстрый старт: `cp .env.example .env && make dev`.
    - Prod deploy: `make prod && make cert-init`.
    - Демо-ссылка + скриншоты/GIF ключевых моментов.

14. **FINAL CHECKPOINT:** Полный путь — заход → welcome-text → калибровка → первая партия → Ustaz говорит → блюндер → review → пазлы → журнал → регистрация → миграция. Всё работает. Можно сдавать.

---

## 13. Риски и митигация

### Критичные риски

**1. ElevenLabs tool-chaining нестабилен**
- Риск: Claude Sonnet 4.5 не всегда вызывает `get_evaluation` перед утверждением о позиции — начинает галлюцинировать.
- Митигация: жёсткий guardrail в system prompt + в description КАЖДОГО tool явное "You MUST call this before making any claim about X". Добавить в evaluation criteria "tool_call_compliance" — будем мониторить.

**2. Низкое качество выбранного голоса на русском**
- Риск: стандартные Multilingual голоса ElevenLabs на русском могут звучать "чуть не так" для русскоязычного уха.
- Митигация: на день 2 посвящаем 30 минут тест-прогону 3-5 голосов из Voice Library с одной и той же фразой Ustaz. Выбираем лучший на слух. Как Plan B — можем клонировать голос реального русскоязычного человека (Instant Voice Cloning, 60 секунд аудио).

**3. Stockfish WASM не инициализируется на мобильных**
- Риск: старые Android или iOS Safari могут иметь проблемы с WASM threads.
- Митигация: single-threaded сборка (уже заложено). Fallback на Lichess Cloud Eval API, если worker не стартует за 5 сек.

**4. getUserMedia / WebSocket заблокирован**
- Риск: корпоративные сети, iOS Safari с permission-политикой.
- Митигация: text-fallback полностью работающий с того же LLM и тех же tools.

**5. Превышение бюджета OpenAI/ElevenLabs на демо**
- Риск: на hackathon-демо может набежать пара десятков долларов за пару часов.
- Митигация: free-квота 15 мин/день жёстко через Redis. Для демо — отдельный demo-user с увеличенной квотой.

**6. iOS Safari мешает autoplay аудио**
- Риск: на iOS первый аудио-фрагмент может не проиграться без user gesture.
- Митигация: первое подключение Ustaz ТОЛЬКО после явного нажатия на кнопку "Включить Ustaz".

### Средние риски

**7. Proactive-коуч раздражает**
- Митигация: mute-toggle по умолчанию ON для первой сессии, включается пользователем явно. Плюс правило "не говорить 2 раза подряд".

**8. Lichess Puzzle DB (5.9M записей) слишком большая для быстрой миграции**
- Митигация: не импортируем всё. Берём только `rating BETWEEN 600 AND 2200`, тем лимитим популярные (fork, pin, skewer, mate-in-1, mate-in-2). ~500K записей = быстрый COPY.

**9. Post-game анализ на сервере занимает много времени для длинной партии**
- Митигация: Stockfish depth 18 на 40 ходов ~15 сек. Показываем progress в SSE. Для демо сокращаем до depth 14 (≈ 8 сек). В продакшне — Celery worker, уже есть в reference-arch.

**10. Guest migration race-condition**
- Митигация: миграция одной SQL транзакцией, блокировкой guest-user до окончания.

### Несущественные, но заметим

**11. Переполнение transcript jsonb для длинных сессий** — лимитируем last 100 messages, остальное сохраняем только в summary.

**12. ElevenLabs rate limits** — с одним agent'ом и несколькими пользователями можно попасть в concurrent-limit. Для хакатона не проблема, для продакшена — cookbook'и ElevenLabs.

---

## 14. README pitch

Этот текст идёт в `README.md` репозитория и в форму сдачи:

---

**space-chess by Agartu**

Первая шахматная платформа, где персональный наставник **Ustaz** сидит рядом с тобой во время партии, а не после.

Спроси голосом: *"Почему ты не советуешь брать слона?"* — и услышишь живой ответ, увидишь стрелки на доске, получишь карточку-принцип в журнал навыков.

Сделал блюндер — Ustaz мягко предложит разобрать и переиграть момент. Завершил партию — голосом проведёт тебя по ключевым моментам и сгенерирует 3 пазла из твоих же ошибок.

Цикл Колба не в учебнике, а прямо в игре. Шахматы перестают быть соревнованием и становятся ремеслом, которое ты реально осваиваешь — с доказательством роста в журнале навыков.

**Для кого:** для всех, кто играл в шахматы, но всегда терял интерес — потому что не понимал **почему** так нужно играть.

**Технически:** Next.js 15 + FastAPI на платформе Agartu, Stockfish WASM как шахматный мозг, ElevenLabs Conversational Agents с Claude Sonnet 4.5 как наставник Ustaz, Lichess APIs для cloud eval и tablebase, PostgreSQL для истории и журнала, Aurora Chess как живая "space"-эстетика с Framer Motion.

**Демо:** [space-chess.agartu.space](https://space-chess.agartu.space) — заходи, сыграй три пазла калибровки, и Ustaz начнёт учить тебя с твоего уровня.

---

## 15. Docker и DevOps — единая конфигурация dev + prod

**Принцип:** один набор Docker-файлов, два compose-override'а для режимов. На dev — всё с hot-reload и volumes, на prod — ничего лишнего, всё хардендленое. Команды через `Makefile` — одна строка вместо длинной docker-compose команды.

### Структура файлов

```
project-root/
├── Dockerfile                      # frontend (Next.js)
├── .dockerignore                   # frontend ignore
├── docker-compose.yml              # base: все сервисы
├── docker-compose.dev.yml          # overrides для dev (volumes, reload, ports exposed)
├── docker-compose.prod.yml         # overrides для prod (nginx, certbot, no exposed ports)
├── .env.example                    # все переменные с плейсхолдерами
├── Makefile                        # удобные команды
│
├── backend/
│   ├── Dockerfile                  # backend (FastAPI + stockfish)
│   ├── .dockerignore               # backend ignore
│   └── entrypoint.sh               # migrate + start
│
└── nginx/
    ├── nginx.conf                  # основная конфигурация
    └── certbot/
        ├── conf/                   # SSL сертификаты (volume)
        └── www/                    # acme-challenge (volume)
```

### Frontend `Dockerfile` (multi-stage, Next.js standalone)

```dockerfile
# syntax=docker/dockerfile:1.7

# ==== Stage 1: dependencies ====
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# ==== Stage 2: build ====
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ==== Stage 3: production runtime ====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

Требует в `next.config.mjs`:
```javascript
const nextConfig = {
  output: "standalone",
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};
```

### Backend `backend/Dockerfile` (multi-stage + Stockfish)

```dockerfile
# syntax=docker/dockerfile:1.7

# ==== Stage 1: dependencies ====
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl && \
    rm -rf /var/lib/apt/lists/*
RUN pip install poetry==1.8.3
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --without-hashes -o requirements.txt
RUN pip install --prefix=/install -r requirements.txt

# ==== Stage 2: runtime ====
FROM python:3.12-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
      stockfish \
      curl \
      && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 appuser && \
    useradd  --system --uid 1001 --gid appuser --no-create-home appuser

COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
```

### Backend `entrypoint.sh`

```bash
#!/bin/sh
set -e

echo "Running Alembic migrations..."
alembic upgrade head

if [ "$APP_ENV" = "development" ]; then
  echo "Starting uvicorn in reload mode..."
  exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
  echo "Starting gunicorn production server..."
  exec gunicorn app.main:app \
    --workers "${GUNICORN_WORKERS:-4}" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile - \
    --timeout 60 \
    --graceful-timeout 30 \
    --keep-alive 5
fi
```

### `docker-compose.yml` (base)

```yaml
name: space-chess

x-common-logging: &logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  frontend:
    image: space-chess-frontend:latest
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      BACKEND_INTERNAL_URL: http://backend:8000
      NEXT_PUBLIC_APP_URL: ${PUBLIC_APP_URL}
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    networks: [internal]
    logging: *logging

  backend:
    image: space-chess-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      APP_ENV: ${APP_ENV:-production}
      DATABASE_URL: postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY}
      ELEVENLABS_AGENT_ID: ${ELEVENLABS_AGENT_ID}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      LICHESS_API_BASE: ${LICHESS_API_BASE:-https://lichess.org/api}
      FRONTEND_BASE_URL: ${PUBLIC_APP_URL}
      ALLOWED_ORIGINS: ${PUBLIC_APP_URL}
      SENTRY_DSN: ${SENTRY_DSN:-}
      LOG_LEVEL: ${LOG_LEVEL:-INFO}
      GUNICORN_WORKERS: ${GUNICORN_WORKERS:-4}
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks: [internal]
    logging: *logging

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/sql/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s
    restart: unless-stopped
    networks: [internal]
    logging: *logging

  redis:
    image: redis:7-alpine
    command:
      - redis-server
      - --requirepass
      - ${REDIS_PASSWORD}
      - --appendonly
      - "yes"
      - --maxmemory
      - 256mb
      - --maxmemory-policy
      - allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    networks: [internal]
    logging: *logging

networks:
  internal:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### `docker-compose.dev.yml` (dev overrides)

```yaml
services:
  frontend:
    image: space-chess-frontend:dev
    build:
      target: deps
    command: npm run dev
    environment:
      NODE_ENV: development
      WATCHPACK_POLLING: "true"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"

  backend:
    image: space-chess-backend:dev
    environment:
      APP_ENV: development
      LOG_LEVEL: DEBUG
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"

  postgres:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
```

### `docker-compose.prod.yml` (prod overrides)

```yaml
services:
  frontend:
    # ports не экспонируются — доступ только через nginx

  backend:
    # ports не экспонируются — доступ только через nginx

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certbot/conf:/etc/letsencrypt:ro
      - ./nginx/certbot/www:/var/www/certbot:ro
    depends_on:
      frontend:
        condition: service_healthy
      backend:
        condition: service_healthy
    networks: [internal]
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  certbot:
    image: certbot/certbot:latest
    restart: unless-stopped
    volumes:
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    entrypoint: >
      /bin/sh -c 'trap exit TERM;
      while :; do
        certbot renew --webroot -w /var/www/certbot --quiet;
        sleep 12h & wait $${!};
      done'
    depends_on:
      - nginx
```

### `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
events { worker_connections 1024; }

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  client_max_body_size 20m;

  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript
             text/xml application/xml application/xml+rss image/svg+xml;

  upstream frontend_upstream { server frontend:3000; }
  upstream backend_upstream  { server backend:8000;  }

  # HTTP → HTTPS redirect + acme-challenge
  server {
    listen 80;
    server_name space-chess.agartu.space;

    location /.well-known/acme-challenge/ {
      root /var/www/certbot;
    }

    location / {
      return 301 https://$host$request_uri;
    }
  }

  # HTTPS
  server {
    listen 443 ssl http2;
    server_name space-chess.agartu.space;

    ssl_certificate     /etc/letsencrypt/live/space-chess.agartu.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/space-chess.agartu.space/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "microphone=(self), geolocation=()" always;

    # API → FastAPI
    location /api/ {
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Request-ID $request_id;
      proxy_read_timeout 300s;
      proxy_buffering off;   # для SSE стримов
    }

    # WebSocket (v2 мультиплеер)
    location /ws/ {
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
      proxy_read_timeout 86400s;
    }

    # Всё остальное → Next.js
    location / {
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

### `.env.example` (полный)

```bash
# App
APP_ENV=production                    # development | production
NODE_ENV=production
PUBLIC_APP_URL=https://space-chess.agartu.space
LOG_LEVEL=INFO

# Database
DB_USER=spacechess
DB_PASSWORD=change-me-strong-password
DB_NAME=spacechess

# Redis
REDIS_PASSWORD=change-me-redis-password

# Auth
JWT_SECRET_KEY=generate-openssl-rand-hex-32
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
SECURE_COOKIES=true

# ElevenLabs
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...

# Anthropic (text fallback)
ANTHROPIC_API_KEY=sk-ant-...

# Lichess
LICHESS_API_BASE=https://lichess.org/api

# Observability
SENTRY_DSN=

# Gunicorn
GUNICORN_WORKERS=4

# SSL / Certbot (prod only)
CERTBOT_EMAIL=admin@agartu.space
CERTBOT_DOMAIN=space-chess.agartu.space
```

### `Makefile`

```makefile
.PHONY: help dev prod logs shell-backend shell-frontend migrate revision seed clean down restart build pull prune cert-init cert-renew

COMPOSE_DEV  = docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env

help:
	@echo "Available commands:"
	@echo "  make dev              - start dev stack with hot reload"
	@echo "  make prod             - start prod stack with nginx + ssl"
	@echo "  make logs [s=name]    - tail logs (all or specific service)"
	@echo "  make shell-backend    - bash into backend container"
	@echo "  make shell-frontend   - bash into frontend container"
	@echo "  make migrate          - alembic upgrade head"
	@echo "  make revision m='msg' - alembic autogenerate revision"
	@echo "  make seed             - load calibration puzzles + sample data"
	@echo "  make down             - stop + remove containers"
	@echo "  make restart s=name   - restart one service"
	@echo "  make build            - rebuild images"
	@echo "  make cert-init        - first-time Let's Encrypt cert issuance"
	@echo "  make cert-renew       - force cert renewal"
	@echo "  make clean            - nuke everything (volumes too!)"

dev:
	$(COMPOSE_DEV) up --build

prod:
	$(COMPOSE_PROD) up -d --build

logs:
	@if [ -n "$(s)" ]; then $(COMPOSE_PROD) logs -f $(s); else $(COMPOSE_PROD) logs -f; fi

shell-backend:
	$(COMPOSE_PROD) exec backend /bin/bash

shell-frontend:
	$(COMPOSE_PROD) exec frontend /bin/sh

migrate:
	$(COMPOSE_PROD) exec backend alembic upgrade head

revision:
	$(COMPOSE_PROD) exec backend alembic revision --autogenerate -m "$(m)"

seed:
	$(COMPOSE_PROD) exec backend python -m app.chess.seed

down:
	$(COMPOSE_PROD) down

restart:
	$(COMPOSE_PROD) restart $(s)

build:
	$(COMPOSE_PROD) build

cert-init:
	docker compose -f docker-compose.prod.yml run --rm certbot \
	  certonly --webroot -w /var/www/certbot \
	  --email $(CERTBOT_EMAIL) -d $(CERTBOT_DOMAIN) \
	  --rsa-key-size 4096 --agree-tos --force-renewal

cert-renew:
	docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal

clean:
	$(COMPOSE_PROD) down -v --remove-orphans
	docker system prune -af --volumes
```

### Workflow использования

**Локальная разработка:**
```bash
cp .env.example .env
# заполни ELEVENLABS_*, ANTHROPIC_API_KEY и прочие секреты
make dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/docs
# Postgres: localhost:5432
# Redis:    localhost:6379
```
Hot reload работает и для frontend (Next.js fast refresh), и для backend (uvicorn `--reload`). Код монтируется volumes, контейнеры перезапускаются по файловым изменениям.

**Первый деплой на VPS:**
```bash
git clone git@github.com:agartu/space-chess.git
cd space-chess
cp .env.example .env
# отредактировать .env на проде (все секреты)

# DNS: space-chess.agartu.space → IP VPS уже настроен

# Временный Nginx без SSL для acme-challenge (делаем вручную)
# Либо просто стартуем с самоподписанным, потом заменяем:
make build
make prod                # стартует frontend/backend/postgres/redis/nginx
make cert-init           # получает Let's Encrypt сертификат
make restart s=nginx     # перезапускает nginx с SSL
```

**Ежедневные операции:**
```bash
make logs                # смотреть все логи
make logs s=backend      # только backend
make migrate             # применить новые миграции
make revision m='add xyz'# создать новую миграцию
make restart s=backend   # перезапустить один сервис после изменений
```

**Update в прод:**
```bash
git pull
make build
make prod    # docker compose up -d --build, автоматически применит миграции через entrypoint.sh
```

### `.dockerignore` (frontend root)

```
.git
.env
.env.*
!.env.example
node_modules
.next
backend/
docs/
.cursor/
*.md
!README.md
.github/
Dockerfile*
docker-compose*
nginx/
Makefile
.vscode/
coverage/
.cache/
```

### `backend/.dockerignore`

```
.git
.env
.env.*
!.env.example
__pycache__
*.pyc
*.pyo
.pytest_cache
.venv
venv/
.coverage
htmlcov/
tests/
docs/
*.md
alembic/versions/*.pyc
.vscode/
```

### Ключевые решения и почему

- **Один `docker-compose.yml` + два override'а** — меньше дублирования, легче поддерживать. Команда `docker compose -f base.yml -f dev.yml` нативно поддерживается.
- **Non-root пользователи** везде (nodejs 1001, appuser 1001) — security baseline.
- **Multi-stage builds** — final frontend image ~150MB (standalone output), final backend image ~200MB (с stockfish).
- **Healthchecks на каждом сервисе** — `depends_on.condition: service_healthy` гарантирует правильный порядок стартов.
- **Сеть `internal` (bridge)** — контейнеры общаются по именам сервисов, во внешний мир смотрит только Nginx.
- **В проде порты не экспонированы** (кроме 80/443 nginx) — БД и Redis внутри docker network.
- **В деве порты экспонированы** — можно цеплять psql/redis-cli напрямую с хоста.
- **Automigrate on start** — `entrypoint.sh` делает `alembic upgrade head` перед запуском — деплой = git pull + docker compose up.
- **Redis maxmemory + LRU** — чтобы не съел всю память VPS под кэш.
- **Logging rotation** — все сервисы пишут max 10MB × 3 файла, не загадят диск.
- **Certbot как отдельный сервис** с auto-renew каждые 12 часов — SSL не протухнет.
- **GUNICORN_WORKERS** как env var — легко подкрутить под ресурсы VPS.
- **SSE работает** — `proxy_buffering off` на `/api/` локейшене.
- **WebSocket готов под v2** — `/ws/` локейшен уже в Nginx, только не используется пока.

### Интеграция с существующей платформой Agartu

Если space-chess идёт как модуль в уже существующий monorepo платформы (с общим docker-compose), есть два варианта:

**Вариант A — отдельное развёртывание** (рекомендую для хакатона):
- `space-chess` живёт как standalone проект со своим docker-compose на поддомене.
- Шарит с основной платформой только код backend-модуля `chess/`.
- Плюсы: независимый деплой, своя БД (легче миграции), меньше риска сломать основную платформу.

**Вариант B — единый docker-compose** (v2):
- Вливаемся в существующий compose, переиспользуем их postgres/redis.
- Добавляем только `chess_*` таблицы в общую БД.
- Nginx главной платформы добавляет location `/space-chess/*` → наш frontend.
- Плюсы: единая точка входа, экономия ресурсов на одном Postgres/Redis.

Архитектурно оба варианта готовы — выбор зависит от того, как быстро тебе нужно релизнуть.

---

## 16. Задел под v2

Архитектурно готово, чтобы добавить без переписывания:

### Мультиплеер (WebSocket)
- Добавить `opponent_type = 'human_remote'` в `chess_games`.
- FastAPI WebSocket `@router.websocket("/api/v1/chess/ws/game/{game_id}")` — уже есть эталонная реализация в reference-arch разделе "Real-Time Communication".
- На фронте: `CoachAdapter` и Zustand game-store не знают разницы между "противник = Stockfish" и "противник = remote". Меняется только `moveDispatcher`, который либо зовёт worker, либо шлёт через ws.
- Ustaz работает и в мультиплеере (игрок может говорить с ним параллельно партии vs человек).

### FreedomPay
- Интеграция через существующий модуль платформы Agartu.
- `ProUpsellModal` уже готов, кнопка "Оплатить через FreedomPay" просто меняется с alert'а на реальный call.
- Webhook от FreedomPay в `backend/app/chess/router.py` обновляет `users.subscription_plan`.
- Квота снимается автоматически (Redis checker уже есть).

### Городской лидерборд
- SQL View `chess_city_leaderboard AS SELECT city, username, elo_rating, games_won FROM users JOIN chess_learning_progress... ORDER BY elo_rating DESC` — готовим сразу.
- Endpoint `GET /api/v1/chess/leaderboard?city=Almaty`.
- UI-виджет в drawer "Лидерборд" — 100 строк React.

### Социальный слой
- Shareable review URLs уже работают.
- Добавить preview-карточки в Open Graph тегах.
- Кнопка "Пригласить друга" → signup с реф-ссылкой.

### Многоязычность
- Все тексты через `next-intl` (задел — всё UI через tokens).
- Ustaz: dynamic_variable `language_code`, в system prompt: "Говори на {{language_code}}".
- Казахский как приоритет v2.

---

*Конец плана. Всё продумано. Можно переключаться в agent-режим и стартовать с Day 1, шаг 1 (scaffold).*


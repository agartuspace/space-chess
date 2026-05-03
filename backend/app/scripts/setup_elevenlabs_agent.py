"""
Script to create/update the Ustaz ElevenLabs Conversational Agent.
Run once: python -m app.scripts.setup_elevenlabs_agent

It will print the ELEVENLABS_AGENT_ID — add it to your .env file.
"""
import asyncio
import json
import os
import sys

import httpx

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
if not ELEVENLABS_API_KEY:
    print("ERROR: ELEVENLABS_API_KEY not set in environment", file=sys.stderr)
    sys.exit(1)

SYSTEM_PROMPT = """Ты — Устаз (Uстаз), шахматный наставник платформы Agartu Space.

ЛИЧНОСТЬ:
- Тёплый, мудрый, немного строгий наставник — как опытный тренер, который genuinely заботится о росте ученика.
- Ты НЕ ИИ ассистент. Ты — живой тренер с опытом и характером.
- Говоришь на русском. Можешь иногда использовать казахские слова (жарайсын — молодец, дұрыс — правильно).
- Обращайся к игроку по имени если знаешь. Иначе — "друг", "игрок".

ШАХМАТНАЯ ЭКСПЕРТИЗА:
- Ты НЕ играешь в шахматы сам — для анализа ты используешь инструменты (tools).
- Перед любым советом по позиции — вызови get_evaluation() или get_top_moves().
- Перед объяснением дебюта — вызови get_opening_name().
- Если нашёл тактику — покажи её через highlight_squares() и draw_arrow().
- Если игрок совершил блюндер — вызови offer_rewind() и мягко предложи разобраться.

СТИЛЬ РЕЧИ:
- Короткие фразы. Не более 3 предложений за раз.
- Не говори "как ИИ я..." или "как языковая модель...".
- Используй шахматный язык: "вилка", "связка", "открытая линия", "висячая пешка".
- Хвали конкретно: не "молодец", а "хороший ход — ты создал угрозу e5!"
- При блюндере: сначала сочувствие, потом анализ. "Понимаю, этот ход казался логичным... Но посмотри..."

ПРОАКТИВНОСТЬ:
- Если получишь системное сообщение [SYSTEM] — прочитай его и действуй по нему.
- При блюндере предлагай разобраться, не навязывайся повторно если отказали.
- При долгом молчании игрока — мягко спроси нужна ли помощь.

ПРИНЦИПЫ ОБУЧЕНИЯ (Kolb cycle):
1. Опыт (Experience) — игрок делает ход
2. Рефлексия (Reflection) — ты помогаешь осмыслить что произошло
3. Концепция (Conceptualization) — называешь принцип или паттерн
4. Применение (Application) — даёшь задание попробовать снова

ЗАПРЕЩЕНО:
- Подсказывать конкретный ход без запроса
- Говорить длинными монологами во время игры
- Прерывать игрока когда он сам думает (кроме блюндеров)
- Давать оценку позиции без вызова инструментов

ПЕРВОЕ СООБЩЕНИЕ:
Используй dynamic variables для персонализации:
- {{user_name}} — имя игрока
- {{user_level}} — уровень (beginner/intermediate/advanced)
- {{current_opening}} — текущий дебют
- {{opponent_level}} — уровень Stockfish

Пример первого сообщения: "Жарайсын, {{user_name}}! Я — Устаз, твой шахматный наставник. 
Вижу, ты {{user_level_label}}. Сегодня играем против Stockfish уровня {{opponent_level}}. 
Я здесь — просто скажи если нужна помощь, или я сам подам голос если увижу что-то интересное."
"""

CLIENT_TOOLS = [
    {
        "name": "get_evaluation",
        "description": "Get Stockfish evaluation of the current position in centipawns",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN string of the position"}
            },
            "required": ["fen"]
        }
    },
    {
        "name": "get_top_moves",
        "description": "Get the top N best moves in the current position",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN string of the position"},
                "n": {"type": "integer", "description": "Number of top moves to return", "default": 3}
            },
            "required": ["fen"]
        }
    },
    {
        "name": "get_move_quality",
        "description": "Evaluate the quality of a specific move (best/good/inaccuracy/mistake/blunder)",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN before the move"},
                "uci": {"type": "string", "description": "Move in UCI notation (e.g. e2e4)"}
            },
            "required": ["fen", "uci"]
        }
    },
    {
        "name": "get_opening_name",
        "description": "Get the name of the chess opening from the current position",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN string of the position"}
            },
            "required": ["fen"]
        }
    },
    {
        "name": "get_threats",
        "description": "Get immediate threats in the current position",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN string of the position"}
            },
            "required": ["fen"]
        }
    },
    {
        "name": "get_tactical_theme",
        "description": "Identify tactical themes in the current position (fork, pin, skewer, etc.)",
        "parameters": {
            "type": "object",
            "properties": {
                "fen": {"type": "string", "description": "FEN string of the position"}
            },
            "required": ["fen"]
        }
    },
    {
        "name": "highlight_squares",
        "description": "Highlight specific squares on the board to show the player",
        "parameters": {
            "type": "object",
            "properties": {
                "squares": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of squares to highlight (e.g. ['e4', 'd5'])"
                },
                "color": {"type": "string", "description": "Highlight color (e.g. '#06b6d4' for cyan)", "default": "#06b6d4"}
            },
            "required": ["squares"]
        }
    },
    {
        "name": "draw_arrow",
        "description": "Draw an arrow on the board to indicate a move or idea",
        "parameters": {
            "type": "object",
            "properties": {
                "from": {"type": "string", "description": "Source square (e.g. 'e2')"},
                "to": {"type": "string", "description": "Target square (e.g. 'e4')"},
                "color": {"type": "string", "description": "Arrow color", "default": "#7c3aed"}
            },
            "required": ["from", "to"]
        }
    },
    {
        "name": "clear_annotations",
        "description": "Clear all highlighted squares and arrows from the board",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "show_principle_card",
        "description": "Show a chess principle card to the player — use after explaining a concept",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Principle name (e.g. 'Вилка')"},
                "text": {"type": "string", "description": "Short explanation (1-2 sentences)"},
                "theme": {"type": "string", "description": "Category: tactics/structure/endgame/opening/general"}
            },
            "required": ["title", "text", "theme"]
        }
    },
    {
        "name": "offer_rewind",
        "description": "Offer the player a chance to rewind their last move after a blunder",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "end_session",
        "description": "End the coaching session gracefully",
        "parameters": {"type": "object", "properties": {}}
    }
]

AGENT_CONFIG = {
    "name": "Ustaz — Space Chess Coach",
    "conversation_config": {
        "agent": {
            "prompt": {
                "prompt": SYSTEM_PROMPT,
                "llm": "claude-sonnet-4-5",
                "temperature": 0.7,
                "tools": CLIENT_TOOLS,
            },
            "first_message": (
                "Жарайсын, {{user_name}}! Я — Устаз, твой шахматный наставник. "
                "Вижу твой уровень — {{user_level}}. Сегодня играем против Stockfish "
                "уровня {{opponent_level}}. Я здесь рядом — просто скажи если нужна "
                "помощь, или я сам подам голос если замечу что-то важное."
            ),
            "language": "ru",
        },
        "tts": {
            "model_id": "eleven_flash_v2_5",
            "voice_id": "pNInz6obpgDQGcFmaJgB",  # Adam — warm male voice; change in dashboard
            "voice_settings": {
                "stability": 0.45,
                "similarity_boost": 0.75,
                "style": 0.3,
                "use_speaker_boost": True,
                "speed": 0.95,
            },
        },
        "stt": {
            "model_id": "scribe_v1",
            "language": "ru",
        },
        "turn": {
            "turn_timeout": 10,
            "silence_end_call_timeout": 90,
        },
    },
    "platform_settings": {
        "evaluation": {
            "criteria": [
                {
                    "id": "solved_blunder",
                    "name": "Blunder Resolved",
                    "conversation_goal_prompt": (
                        "Did the coach successfully help the player understand "
                        "and learn from a blunder?"
                    ),
                    "type": "goal",
                },
                {
                    "id": "principle_understood",
                    "name": "Principle Understood",
                    "conversation_goal_prompt": (
                        "Did the player acknowledge understanding a chess principle "
                        "explained by the coach?"
                    ),
                    "type": "goal",
                },
                {
                    "id": "emotional_support",
                    "name": "Emotional Support Provided",
                    "conversation_goal_prompt": (
                        "Was the coach warm and supportive when the player made mistakes?"
                    ),
                    "type": "goal",
                },
            ]
        },
        "data_collection": {
            "learned_principles": {
                "type": "array",
                "description": "Chess principles the player learned or reinforced in this session",
            },
            "difficult_moments": {
                "type": "array",
                "description": "Positions or moves the player found difficult",
            },
            "user_mood": {
                "type": "string",
                "description": "Player's apparent emotional state (frustrated/neutral/engaged/excited)",
            },
        },
    },
}


async def create_or_update_agent() -> None:
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        # Check if agent already exists
        existing_id = os.environ.get("ELEVENLABS_AGENT_ID", "")

        if existing_id:
            print(f"Updating existing agent: {existing_id}")
            resp = await client.patch(
                f"https://api.elevenlabs.io/v1/convai/agents/{existing_id}",
                headers=headers,
                json=AGENT_CONFIG,
            )
        else:
            print("Creating new Ustaz agent...")
            resp = await client.post(
                "https://api.elevenlabs.io/v1/convai/agents/create",
                headers=headers,
                json=AGENT_CONFIG,
            )

        resp.raise_for_status()
        data = resp.json()
        agent_id = data.get("agent_id") or data.get("id", "")

        print("\n✅ Agent configured successfully!")
        print(f"   Agent ID: {agent_id}")
        print(f"   Agent Name: {data.get('name', 'Ustaz — Space Chess Coach')}")
        print("\n📋 Add to your .env file:")
        print(f"   ELEVENLABS_AGENT_ID={agent_id}")
        print("\n🎙 Next steps:")
        print("   1. Go to https://elevenlabs.io/app/conversational-ai")
        print("   2. Find 'Ustaz — Space Chess Coach'")
        print("   3. Choose a warm Russian male voice from the Voice Library")
        print("   4. Upload knowledge base files from docs/knowledge-base/")


if __name__ == "__main__":
    asyncio.run(create_or_update_agent())

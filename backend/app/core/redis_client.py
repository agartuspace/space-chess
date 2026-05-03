import time

import redis.asyncio as aioredis

from app.core.config import settings

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def check_coach_quota(user_id: str, limit_minutes: int = 15) -> bool:
    """
    Track cumulative coach session time for a user within a rolling 24-hour window.
    Returns True if the user is within quota, False if they have exceeded it.
    """
    redis = await get_redis()

    window_seconds = 24 * 60 * 60
    key = f"coach_quota:{user_id}"
    limit_seconds = limit_minutes * 60

    now = int(time.time())
    window_start = now - window_seconds

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, "-inf", window_start)
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    results = await pipe.execute()

    used_seconds: int = results[1]

    if used_seconds >= limit_seconds:
        return False

    await redis.zadd(key, {str(now): now})
    return True

from redis.asyncio import Redis

from app.core.redis import redis_client


def get_redis_client() -> Redis:
    return redis_client

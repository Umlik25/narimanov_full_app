from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import session_scope


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in session_scope():
        yield session

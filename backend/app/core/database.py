# In app/core/database.py, change:
# DATABASE_URL=mysql+asyncmy://user:pass@localhost:3306/taskit_db
# To:
# DATABASE_URL=mysql+aiomysql://user:pass@localhost:3306/taskit_db

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Use aiomysql instead of asyncmy
engine = create_async_engine(
    settings.DATABASE_URL.replace("mysql+asyncmy://", "mysql+aiomysql://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
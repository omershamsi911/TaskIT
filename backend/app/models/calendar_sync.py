from sqlalchemy import Column, BigInteger, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class CalendarSyncToken(Base):
    __tablename__ = "calendar_sync_tokens"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    provider_type = Column(Enum("google"), default="google")
    access_token = Column(Text)
    refresh_token = Column(Text)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
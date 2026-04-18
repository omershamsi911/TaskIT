from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class PlatformSetting(Base):
    __tablename__ = "platform_settings"
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(300))
    updated_by = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
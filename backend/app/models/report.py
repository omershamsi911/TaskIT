from sqlalchemy import Column, BigInteger, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"
    id = Column(BigInteger, primary_key=True)
    reporter_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    reported_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    entity_type = Column(Enum("user", "provider", "review", "booking", "service"))
    entity_id = Column(String(20))
    reason = Column(Enum(
        "fake_profile", "fake_review", "fraud", "inappropriate_content",
        "spam", "harassment", "other"
    ))
    description = Column(Text)
    status = Column(Enum("pending", "reviewed", "action_taken", "dismissed"), default="pending")
    handled_by = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    admin_note = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
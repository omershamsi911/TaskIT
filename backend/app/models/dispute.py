from sqlalchemy import Column, BigInteger,Integer, String, Text, DECIMAL, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Dispute(Base):
    __tablename__ = "disputes"
    id = Column(BigInteger, primary_key=True)
    booking_id = Column(BigInteger, ForeignKey("bookings.id"), unique=True)
    raised_by = Column(BigInteger, ForeignKey("users.id"))
    dispute_type = Column(Enum("no_show", "poor_quality", "overcharged", "damage", "fraud", "other"))
    description = Column(Text, nullable=False)
    status = Column(Enum("open", "under_review", "resolved_for_user", "resolved_for_provider", "closed"), default="open")
    assigned_to = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    resolution_note = Column(Text)
    refund_amount = Column(DECIMAL(12,2))
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking", back_populates="dispute")
    raised_by_user = relationship("User", foreign_keys=[raised_by])
    assigned_admin = relationship("AdminUser")
    messages = relationship("DisputeMessage", back_populates="dispute", cascade="all, delete-orphan")


class DisputeMessage(Base):
    __tablename__ = "dispute_messages"
    id = Column(BigInteger, primary_key=True)
    dispute_id = Column(BigInteger, ForeignKey("disputes.id", ondelete="CASCADE"))
    sender_id = Column(BigInteger, nullable=True)
    sender_type = Column(Enum("user", "admin"), nullable=False)
    message = Column(Text, nullable=False)
    attachment_url = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    dispute = relationship("Dispute", back_populates="messages")
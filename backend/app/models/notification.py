from sqlalchemy import Column, BigInteger, String, Text, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(
        Enum(
            'booking_request', 'booking_accepted', 'booking_declined', 'booking_started',
            'booking_completed', 'booking_cancelled', 'payment_received', 'payment_released',
            'review_received', 'dispute_opened', 'dispute_resolved', 'chat_message',
            'badge_earned', 'promo', 'system',
            name='notification_type'
        )
    )
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    ref_id = Column(String(50))
    ref_type = Column(String(50))
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
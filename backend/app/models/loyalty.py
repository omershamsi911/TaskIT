from sqlalchemy import Column, BigInteger, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class UserLoyaltyPoints(Base):
    __tablename__ = "user_loyalty_points"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    event_type = Column(Enum(
        "booking_completed", "review_given", "referral_success",
        "signup_bonus", "redeemed", "expired", "manual_award"
    ))
    points = Column(Integer)
    balance_after = Column(Integer)
    ref_id = Column(String(50))
    note = Column(String(300))
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
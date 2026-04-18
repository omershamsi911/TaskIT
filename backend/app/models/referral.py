from sqlalchemy import Column, BigInteger, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Referral(Base):
    __tablename__ = "referrals"
    id = Column(BigInteger, primary_key=True)
    referrer_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    referred_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(Enum("pending", "qualified", "rewarded"), default="pending")
    points_awarded = Column(Integer)
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="SET NULL"))
    created_at = Column(DateTime, server_default=func.now())
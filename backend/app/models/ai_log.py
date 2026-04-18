from sqlalchemy import Column, BigInteger, Integer, DECIMAL, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class AIMatchLog(Base):
    __tablename__ = "ai_match_logs"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="SET NULL"))
    subcategory_id = Column(Integer)
    user_lat = Column(DECIMAL(10,7))
    user_lng = Column(DECIMAL(10,7))
    candidates_json = Column(JSON)
    selected_provider = Column(BigInteger)
    distance_score = Column(Float)
    rating_score = Column(Float)
    price_score = Column(Float)
    response_score = Column(Float)
    trust_score_used = Column(Float)
    final_score = Column(Float)
    user_accepted = Column(Boolean)
    created_at = Column(DateTime, server_default=func.now())
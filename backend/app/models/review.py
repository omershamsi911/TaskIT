from sqlalchemy import Column, BigInteger, String, Text, Integer, Enum, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"
    id = Column(BigInteger, primary_key=True)
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewee_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewer_role = Column(Enum("customer", "provider"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    is_flagged = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=True)
    sentiment_score = Column(Float)
    ai_summary = Column(String(500))
    helpful_count = Column(Integer, default=0)
    provider_reply = Column(Text)
    provider_replied_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking", back_populates="review")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
    helpful_votes = relationship("ReviewHelpfulVote", back_populates="review", cascade="all, delete-orphan")


class ReviewHelpfulVote(Base):
    __tablename__ = "review_helpful_votes"
    id = Column(BigInteger, primary_key=True)
    review_id = Column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE"))
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, server_default=func.now())

    review = relationship("Review", back_populates="helpful_votes")
    user = relationship("User")
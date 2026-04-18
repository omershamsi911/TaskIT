from sqlalchemy import Column, BigInteger, DECIMAL, Enum, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ListingBoost(Base):
    __tablename__ = "listing_boosts"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    service_id = Column(BigInteger, ForeignKey("provider_services.id", ondelete="CASCADE"), nullable=True)
    amount_paid = Column(DECIMAL(10,2))
    payment_id = Column(BigInteger, ForeignKey("payments.id", ondelete="SET NULL"))
    boost_type = Column(Enum("search_top", "category_featured", "homepage"))
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # Fix: Add relationship with string reference
    provider = relationship("Provider", back_populates="boosts")
    service = relationship("ProviderService", foreign_keys=[service_id])
    payment = relationship("Payment", foreign_keys=[payment_id])
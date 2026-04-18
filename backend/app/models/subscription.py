from sqlalchemy import Column, Integer, BigInteger, String, DECIMAL, Enum, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans_catalog"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    code = Column(String(50), unique=True)
    price_pkr = Column(DECIMAL(10,2))
    duration_days = Column(Integer)
    features = Column(JSON)
    is_active = Column(Boolean, default=True)

class ProviderSubscription(Base):
    __tablename__ = "provider_subscriptions"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    plan_id = Column(Integer, ForeignKey("subscription_plans_catalog.id"))
    status = Column(Enum("active", "expired", "cancelled"), default="active")
    payment_id = Column(BigInteger, ForeignKey("payments.id", ondelete="SET NULL"))
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Fix: Use string reference to avoid circular import
    provider = relationship("Provider", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan")
    payment = relationship("Payment", foreign_keys=[payment_id])
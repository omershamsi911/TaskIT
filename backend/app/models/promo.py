from sqlalchemy import Column, Integer, BigInteger, String, DECIMAL, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class PromoCode(Base):
    __tablename__ = "promo_codes"
    id = Column(Integer, primary_key=True)
    code = Column(String(30), unique=True)
    discount_type = Column(Enum("percentage", "fixed_pkr"))
    discount_value = Column(DECIMAL(10,2))
    min_booking_value = Column(DECIMAL(10,2), default=0)
    max_discount_pkr = Column(DECIMAL(10,2))
    max_uses = Column(Integer)
    used_count = Column(Integer, default=0)
    max_uses_per_user = Column(Integer, default=1)
    valid_from = Column(DateTime)
    valid_until = Column(DateTime)
    applicable_category = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, server_default=func.now())

class PromoCodeUsage(Base):
    __tablename__ = "promo_code_usages"
    id = Column(BigInteger, primary_key=True)
    promo_id = Column(Integer, ForeignKey("promo_codes.id", ondelete="CASCADE"))
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="CASCADE"))
    discount_applied = Column(DECIMAL(10,2))
    used_at = Column(DateTime, server_default=func.now())
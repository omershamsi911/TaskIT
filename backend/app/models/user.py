from sqlalchemy import Column, BigInteger, String, Enum, DECIMAL, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(180), nullable=True, unique=True)
    phone = Column(String(20), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("customer", "provider", "both"), nullable=False, default="customer")
    status = Column(Enum("active", "suspended", "banned", "pending_verification"), default="pending_verification")
    avatar_url = Column(String(500))
    referral_code = Column(String(20), default="")
    referred_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    wallet_balance = Column(DECIMAL(12,2), default=0.00)
    loyalty_points = Column(Integer, default=0)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_business_account = Column(Boolean, default=False)
    business_name = Column(String(200))
    business_ntn = Column(String(50))
    fcm_token = Column(String(500))
    preferred_language = Column(String(10), default="en")
    preferred_currency = Column(String(5), default="PKR")
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)
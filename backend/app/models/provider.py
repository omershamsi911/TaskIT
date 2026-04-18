from sqlalchemy import Column, BigInteger, String, Text, Integer, DECIMAL, Enum, DateTime, ForeignKey, Boolean, Float, Time, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Provider(Base):
    __tablename__ = "providers"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text)
    years_of_experience = Column(Integer)
    avg_rating = Column(DECIMAL(3,2), default=0.00)
    total_reviews = Column(Integer, default=0)
    total_completed_jobs = Column(Integer, default=0)
    total_cancelled_jobs = Column(Integer, default=0)
    response_rate = Column(DECIMAL(5,2), default=0.00)
    avg_response_minutes = Column(Integer, default=0)
    service_radius_km = Column(DECIMAL(6,2), default=10.00)
    lat = Column(DECIMAL(10,7))
    lng = Column(DECIMAL(10,7))
    availability_status = Column(Enum("available", "busy", "offline"), default="offline")
    is_featured = Column(Boolean, default=False)
    trust_score = Column(DECIMAL(5,2), default=0.00)
    ai_skill_score = Column(DECIMAL(5,2), default=0.00)
    profile_approved_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="provider_profile")
    services = relationship("ProviderService", back_populates="provider", cascade="all, delete-orphan")
    availabilities = relationship("ProviderAvailability", back_populates="provider", cascade="all, delete-orphan")
    overrides = relationship("ProviderAvailabilityOverride", back_populates="provider", cascade="all, delete-orphan")
    documents = relationship("ProviderDocument", back_populates="provider", cascade="all, delete-orphan")
    badges = relationship("ProviderBadge", back_populates="provider")
    subscriptions = relationship("ProviderSubscription", back_populates="provider")  # Add this line
    boosts = relationship("ListingBoost", back_populates="provider")
    earnings = relationship("Earning", back_populates="provider")
    withdrawals = relationship("WithdrawalRequest", back_populates="provider")


class ProviderService(Base):
    __tablename__ = "provider_services"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    pricing_type = Column(Enum("fixed", "hourly", "negotiable", "starting_from"), default="fixed")
    base_price = Column(DECIMAL(10,2), nullable=False)
    max_price = Column(DECIMAL(10,2))
    price_unit = Column(String(30))
    estimated_hours = Column(DECIMAL(4,1))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    provider = relationship("Provider", back_populates="services")
    subcategory = relationship("Subcategory")


class ProviderAvailability(Base):
    __tablename__ = "provider_availability"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)

    provider = relationship("Provider", back_populates="availabilities")


class ProviderAvailabilityOverride(Base):
    __tablename__ = "provider_availability_overrides"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    override_date = Column(Date, nullable=False)
    is_available = Column(Boolean, default=False)
    start_time = Column(Time)
    end_time = Column(Time)
    note = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())

    provider = relationship("Provider", back_populates="overrides")


class ProviderDocument(Base):
    __tablename__ = "provider_documents"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    document_type = Column(Enum("cnic_front", "cnic_back", "selfie_with_cnic", "police_verification", "professional_certificate", "business_license", "other"))
    file_url = Column(String(500), nullable=False)
    verification_status = Column(Enum("pending", "approved", "rejected"), default="pending")
    rejection_reason = Column(Text)
    verified_by = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    verified_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    provider = relationship("Provider", back_populates="documents")
    admin = relationship("AdminUser")


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon_url = Column(String(500))


class ProviderBadge(Base):
    __tablename__ = "provider_badges"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"))
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"))
    awarded_by = Column(Enum("system", "admin"), default="system")
    awarded_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)

    provider = relationship("Provider", back_populates="badges")
    badge = relationship("Badge")
from sqlalchemy import Column, BigInteger, String, Text, DECIMAL, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(BigInteger, primary_key=True)
    booking_ref = Column(String(20), unique=True, default="")
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    provider_id = Column(BigInteger, ForeignKey("providers.id"), nullable=False)
    service_id = Column(BigInteger, ForeignKey("provider_services.id"), nullable=False)
    address_id = Column(BigInteger, ForeignKey("addresses.id"), nullable=False)
    status = Column(Enum("requested", "accepted", "in_progress", "completed", "cancelled", "disputed"), default="requested")
    description = Column(Text)
    special_instructions = Column(Text)
    scheduled_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    quoted_price = Column(DECIMAL(10,2), nullable=False)
    final_price = Column(DECIMAL(10,2))
    platform_fee = Column(DECIMAL(10,2))
    platform_fee_pct = Column(DECIMAL(5,2), default=10.00)
    cancellation_reason = Column(Text)
    cancelled_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    is_group_booking = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="bookings")
    provider = relationship("Provider", foreign_keys=[provider_id], backref="bookings")
    service = relationship("ProviderService")
    address = relationship("Address")
    cancelled_by_user = relationship("User", foreign_keys=[cancelled_by])
    status_history = relationship("BookingStatusHistory", back_populates="booking", cascade="all, delete-orphan")
    photos = relationship("JobPhoto", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking")
    review = relationship("Review", back_populates="booking", uselist=False)
    chat = relationship("Chat", back_populates="booking", uselist=False)
    dispute = relationship("Dispute", back_populates="booking", uselist=False)


class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"
    id = Column(BigInteger, primary_key=True)
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="CASCADE"))
    from_status = Column(String(30))
    to_status = Column(String(30), nullable=False)
    changed_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    note = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    booking = relationship("Booking", back_populates="status_history")
    user = relationship("User")


class JobPhoto(Base):
    __tablename__ = "job_photos"
    id = Column(BigInteger, primary_key=True)
    booking_id = Column(BigInteger, ForeignKey("bookings.id", ondelete="CASCADE"))
    uploaded_by = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    photo_type = Column(Enum("before", "after", "in_progress", "other"))
    url = Column(String(500), nullable=False)
    caption = Column(String(300))
    created_at = Column(DateTime, server_default=func.now())

    booking = relationship("Booking", back_populates="photos")
    user = relationship("User")
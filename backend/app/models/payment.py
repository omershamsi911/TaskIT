# ✅ CORRECT - separate lines
from sqlalchemy import Column, BigInteger, Integer, DECIMAL, Enum, DateTime, ForeignKey, String, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(BigInteger, primary_key=True)
    booking_id = Column(BigInteger, ForeignKey("bookings.id"), unique=True, nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    amount = Column(DECIMAL(12,2), nullable=False)
    platform_fee = Column(DECIMAL(10,2), default=0.00)
    provider_payout = Column(DECIMAL(12,2), default=0.00)
    method = Column(Enum("cash", "wallet", "jazzcash", "easypaisa", "bank_transfer", "card"))
    status = Column(Enum("pending", "authorised", "captured", "refunded", "partially_refunded", "failed", "cancelled"), default="pending")
    gateway_txn_id = Column(String(255))
    gateway_response = Column(JSON)
    escrow_status = Column(Enum("held", "released", "refunded"))
    escrow_released_at = Column(DateTime)
    refund_amount = Column(DECIMAL(12,2))
    refund_reason = Column(Text)
    refunded_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking", back_populates="payments")
    user = relationship("User")
    invoice = relationship("Invoice", back_populates="payment", uselist=False)
    earning = relationship("Earning", back_populates="payment", uselist=False)


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    type = Column(Enum("credit", "debit", "refund", "withdrawal", "referral_bonus", "loyalty_redemption", "platform_fee"))
    amount = Column(DECIMAL(12,2), nullable=False)
    balance_after = Column(DECIMAL(12,2), nullable=False)
    ref_id = Column(String(50))
    ref_type = Column(String(50))
    note = Column(String(300))
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", backref="wallet_transactions")


class Earning(Base):
    __tablename__ = "earnings"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id"), nullable=False)
    booking_id = Column(BigInteger, ForeignKey("bookings.id"), unique=True, nullable=False)
    payment_id = Column(BigInteger, ForeignKey("payments.id"), nullable=False)
    gross_amount = Column(DECIMAL(12,2), nullable=False)
    platform_fee = Column(DECIMAL(10,2), nullable=False)
    net_amount = Column(DECIMAL(12,2), nullable=False)
    status = Column(Enum("pending", "available", "withdrawn", "on_hold"), default="pending")
    available_at = Column(DateTime)
    payout_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    provider = relationship("Provider", back_populates="earnings")
    booking = relationship("Booking")
    payment = relationship("Payment", back_populates="earning")


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"
    id = Column(BigInteger, primary_key=True)
    provider_id = Column(BigInteger, ForeignKey("providers.id"), nullable=False)
    amount = Column(DECIMAL(12,2), nullable=False)
    method = Column(Enum("bank_transfer", "jazzcash", "easypaisa"))
    account_details = Column(JSON, nullable=False)
    status = Column(Enum("pending", "processing", "completed", "rejected"), default="pending")
    processed_by = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    rejection_reason = Column(Text)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    provider = relationship("Provider", back_populates="withdrawals")
    admin = relationship("AdminUser")


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(BigInteger, primary_key=True)
    payment_id = Column(BigInteger, ForeignKey("payments.id"), unique=True, nullable=False)
    booking_id = Column(BigInteger, ForeignKey("bookings.id"), nullable=False)
    invoice_number = Column(String(30), unique=True, nullable=False)
    subtotal = Column(DECIMAL(12,2), nullable=False)
    platform_fee = Column(DECIMAL(10,2), nullable=False)
    total = Column(DECIMAL(12,2), nullable=False)
    status = Column(Enum("draft", "issued", "void"), default="issued")
    pdf_url = Column(String(500))
    issued_at = Column(DateTime, server_default=func.now())

    payment = relationship("Payment", back_populates="invoice")
    booking = relationship("Booking")
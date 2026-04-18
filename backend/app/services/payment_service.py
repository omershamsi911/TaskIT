from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment import Payment, WalletTransaction
from app.models.booking import Booking
from app.models.user import User
from app.utils.wallet import update_wallet_balance
from decimal import Decimal
from fastapi import HTTPException

class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_payment(self, booking_id: int, user_id: int, method: str):
        booking = await self.db.get(Booking, booking_id)
        if booking.user_id != user_id:
            raise HTTPException(403, "Not your booking")
        if booking.status != "accepted":
            raise HTTPException(400, "Booking not accepted yet")
        # Calculate fees
        platform_fee_pct = Decimal("10.00")  # from settings
        quoted = booking.quoted_price
        platform_fee = quoted * platform_fee_pct / 100
        provider_payout = quoted - platform_fee
        payment = Payment(
            booking_id=booking_id,
            user_id=user_id,
            amount=quoted,
            platform_fee=platform_fee,
            provider_payout=provider_payout,
            method=method,
            status="pending",
            escrow_status="held"
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        # In real integration, call payment gateway
        return payment

    async def process_payment_success(self, payment_id: int, gateway_txn_id: str):
        payment = await self.db.get(Payment, payment_id)
        payment.status = "captured"
        payment.gateway_txn_id = gateway_txn_id
        # Create earning record
        from app.models.payment import Earning
        earning = Earning(
            provider_id=payment.booking.provider_id,
            booking_id=payment.booking_id,
            payment_id=payment.id,
            gross_amount=payment.amount,
            platform_fee=payment.platform_fee,
            net_amount=payment.provider_payout,
            status="pending"
        )
        self.db.add(earning)
        await self.db.commit()

    async def release_escrow(self, booking_id: int):
        # Called after job completion
        stmt = select(Payment).where(Payment.booking_id == booking_id, Payment.escrow_status == "held")
        result = await self.db.execute(stmt)
        payment = result.scalar_one_or_none()
        if not payment:
            raise HTTPException(404, "No held payment found")
        payment.escrow_status = "released"
        payment.escrow_released_at = datetime.utcnow()
        # Update earning status to available
        earning = await self.db.execute(select(Earning).where(Earning.payment_id == payment.id))
        earning = earning.scalar_one()
        earning.status = "available"
        earning.available_at = datetime.utcnow()
        await self.db.commit()

    async def get_wallet_history(self, user_id: int):
        stmt = select(WalletTransaction).where(WalletTransaction.user_id == user_id).order_by(WalletTransaction.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def topup_wallet(self, user_id: int, amount: float):
        # In practice, integrate with payment gateway
        user = await self.db.get(User, user_id)
        new_balance = user.wallet_balance + Decimal(str(amount))
        await update_wallet_balance(self.db, user_id, amount, "credit", "Top-up", new_balance)
        return {"new_balance": new_balance}
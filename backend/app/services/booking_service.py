from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.booking import Booking
from app.models.provider import Provider
from app.models.provider import ProviderService 
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.utils.wallet import update_wallet_balance
from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from decimal import Decimal


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_booking(self, user_id: int, data: BookingCreate):
        provider = await self.db.get(Provider, data.provider_id)
        if not provider:
            raise HTTPException(400, "Provider not found")

        booking = Booking(
            user_id=user_id,
            provider_id=data.provider_id,
            service_id=data.service_id,
            address=data.address,
            scheduled_at=data.scheduled_at,
            description=data.description,
            status="requested",
        )
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def get_user_bookings(self, user_id: int, status: str = None):
        stmt = (
            select(Booking)
            .outerjoin(Provider, Booking.provider_id == Provider.id)
            .where(or_(Booking.user_id == user_id, Provider.user_id == user_id))
        )
        if status:
            stmt = stmt.where(Booking.status == status)
        stmt = stmt.order_by(Booking.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_booking(self, booking_id: int):
        stmt = (
            select(Booking)
            .options(
                selectinload(Booking.provider).selectinload(Provider.user),  # Load provider's user
                selectinload(Booking.user),  # Load customer
                selectinload(Booking.service),
            )
            .where(Booking.id == booking_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(self, booking_id: int, new_status: str, actor):
        booking = await self.get_booking(booking_id)

        if not booking:
            raise HTTPException(404, "Booking not found")

        # ✅ FIX: Access provider's user correctly
        provider_user_id = booking.provider.user.id  # Changed from booking.provider.user_id
        customer_user_id = booking.user_id  # This is the customer's user ID
        
        # Authorization: customer OR provider's user
        if actor.id != customer_user_id and actor.id != provider_user_id:
            raise HTTPException(403, "Not authorized")

        valid_statuses = ["requested", "accepted", "completed", "cancelled", "rejected"]
        if new_status not in valid_statuses:
            raise HTTPException(400, "Invalid status")

        # Additional validation: Only provider can accept/reject
        if new_status in ["accepted", "rejected"] and actor.id != provider_user_id:
            raise HTTPException(403, "Only the service provider can accept or reject bookings")

        # ── Wallet logic on acceptance ────────────────────────────────
        if new_status == "accepted" and booking.status == "requested":
            await self._process_wallet_on_accept(booking)

        booking.status = new_status
        await self.db.commit()
        await self.db.refresh(booking)  # Add this to refresh the object
        return booking

    async def _process_wallet_on_accept(self, booking: Booking):
        """Deduct service price from customer, credit provider."""

        # Load service to get price
        service = await self.db.get(ProviderService, booking.service_id)
        if not service:
            raise HTTPException(400, "Service not found")

        price = Decimal(str(service.price))

        # ── Customer: check balance and debit ─────────────────────────
        customer = await self.db.get(User, booking.user_id)  # This is correct
        if customer.wallet_balance < price:
            raise HTTPException(
                400,
                f"Customer has insufficient wallet balance. "
                f"Required: Rs.{price}, Available: Rs.{customer.wallet_balance}"
            )

        customer_new_balance = Decimal(str(customer.wallet_balance)) - price
        await update_wallet_balance(
            db=self.db,
            user_id=customer.id,
            amount=price,
            txn_type="debit",
            note=f"Payment for booking #{booking.id} — {service.title}",
            new_balance=customer_new_balance,
            booking_id=booking.id,
        )

        # ── Provider: credit earnings ─────────────────────────────────
        # ✅ FIX: Access provider's user correctly
        provider_user = await self.db.get(User, booking.provider.user.id)  # Changed from booking.provider.user_id
        provider_new_balance = Decimal(str(provider_user.wallet_balance)) + price
        await update_wallet_balance(
            db=self.db,
            user_id=provider_user.id,
            amount=price,
            txn_type="credit",
            note=f"Earnings from booking #{booking.id} — {service.title}",
            new_balance=provider_new_balance,
            booking_id=booking.id,
        )
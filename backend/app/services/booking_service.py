from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.booking import Booking, BookingStatusHistory, JobPhoto
from app.models.provider import Provider
from app.schemas.booking import BookingCreate
from fastapi import HTTPException
from datetime import datetime

class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_booking(self, user_id: int, data: BookingCreate):
        # Validate provider and service
        provider = await self.db.get(Provider, data.provider_id)
        if not provider or provider.availability_status == "offline":
            raise HTTPException(400, "Provider not available")
        booking = Booking(
            user_id=user_id,
            provider_id=data.provider_id,
            service_id=data.service_id,
            address_id=data.address_id,
            scheduled_at=data.scheduled_at,
            description=data.description,
            special_instructions=data.special_instructions,
            quoted_price=data.quoted_price,
            status="requested"
        )
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        # Log status
        await self._log_status(booking.id, None, "requested", user_id)
        return booking

    async def get_user_bookings(self, user_id: int, status: str = None):
        stmt = select(Booking).where(Booking.user_id == user_id)
        if status:
            stmt = stmt.where(Booking.status == status)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_booking(self, booking_id: int):
        booking = await self.db.get(Booking, booking_id)
        if not booking:
            raise HTTPException(404, "Booking not found")
        return booking

    async def update_status(self, booking_id: int, new_status: str, actor):
        booking = await self.get_booking(booking_id)
        # Authorization checks
        if actor.id != booking.user_id and actor.id != booking.provider.user_id:
            raise HTTPException(403, "Not authorized")
        # Validate transition (simplified)
        old_status = booking.status
        booking.status = new_status
        if new_status == "accepted":
            booking.accepted_at = datetime.utcnow()
        elif new_status == "in_progress":
            booking.started_at = datetime.utcnow()
        elif new_status == "completed":
            booking.completed_at = datetime.utcnow()
        await self.db.commit()
        await self._log_status(booking_id, old_status, new_status, actor.id)
        return booking

    async def cancel_booking(self, booking_id: int, user_id: int, reason: str):
        booking = await self.get_booking(booking_id)
        if booking.status in ["completed", "cancelled"]:
            raise HTTPException(400, "Cannot cancel")
        old = booking.status
        booking.status = "cancelled"
        booking.cancellation_reason = reason
        booking.cancelled_by = user_id
        await self.db.commit()
        await self._log_status(booking_id, old, "cancelled", user_id)
        return booking

    async def _log_status(self, booking_id: int, from_status: str, to_status: str, user_id: int):
        log = BookingStatusHistory(
            booking_id=booking_id,
            from_status=from_status,
            to_status=to_status,
            changed_by=user_id
        )
        self.db.add(log)
        await self.db.commit()

    async def add_photo(self, booking_id: int, user_id: int, photo_type: str, url: str, caption: str):
        booking = await self.get_booking(booking_id)
        if user_id not in [booking.user_id, booking.provider.user_id]:
            raise HTTPException(403, "Not authorized")
        photo = JobPhoto(
            booking_id=booking_id,
            uploaded_by=user_id,
            photo_type=photo_type,
            url=url,
            caption=caption
        )
        self.db.add(photo)
        await self.db.commit()
        await self.db.refresh(photo)
        return photo
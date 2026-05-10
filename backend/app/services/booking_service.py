from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.booking import Booking
from app.models.provider import Provider
from app.schemas.booking import BookingCreate
from fastapi import HTTPException
from sqlalchemy.orm import selectinload

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
            address=data.address, # This is a string in the new schema
            scheduled_at=data.scheduled_at,
            description=data.description,
            status="requested"
        )
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def get_user_bookings(self, user_id: int, status: str = None):
        stmt = select(Booking).outerjoin(Provider, Booking.provider_id == Provider.id).where(
            or_(
                Booking.user_id == user_id, 
                Provider.user_id == user_id
            )
        )
        if status:
            stmt = stmt.where(Booking.status == status)
        
        # Order by newest first
        stmt = stmt.order_by(Booking.created_at.desc())
        
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_booking(self, booking_id: int):
        stmt = (
            select(Booking)
            .options(
                selectinload(Booking.provider),
                selectinload(Booking.user)
            )
            .where(Booking.id == booking_id)
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(self, booking_id: int, new_status: str, actor):
        booking = await self.get_booking(booking_id)

        print("booking.user_id", booking.user_id)
        print("provider_id", booking.provider_id)
        print("actor_id", actor.id)
        
        if actor.id != booking.user_id and actor.id != booking.provider_id:
            raise HTTPException(403, "Not authorized")
            
        valid_statuses = ["requested", "accepted", "completed", "cancelled"]
        if new_status not in valid_statuses:
            raise HTTPException(400, "Invalid status")

        booking.status = new_status
        await self.db.commit()
        return booking
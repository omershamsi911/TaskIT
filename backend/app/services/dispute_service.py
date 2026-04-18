from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.dispute import Dispute, DisputeMessage
from app.models.booking import Booking
from datetime import datetime

class DisputeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_dispute(self, booking_id: int, user_id: int, dispute_type: str, description: str):
        # Verify booking exists and belongs to user
        stmt = select(Booking).where(Booking.id == booking_id)
        result = await self.db.execute(stmt)
        booking = result.scalar_one_or_none()
        
        if not booking:
            raise HTTPException(404, "Booking not found")
        if booking.user_id != user_id and booking.provider.user_id != user_id:
            raise HTTPException(403, "Not authorized to dispute this booking")
        if booking.status not in ["completed", "in_progress"]:
            raise HTTPException(400, "Can only dispute completed or in-progress bookings")
        
        # Check if dispute already exists
        stmt = select(Dispute).where(Dispute.booking_id == booking_id)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(400, "Dispute already exists for this booking")
        
        dispute = Dispute(
            booking_id=booking_id,
            raised_by=user_id,
            dispute_type=dispute_type,
            description=description,
            status="open"
        )
        self.db.add(dispute)
        await self.db.commit()
        await self.db.refresh(dispute)
        return dispute

    async def get_dispute(self, dispute_id: int, user):
        dispute = await self.db.get(Dispute, dispute_id)
        if not dispute:
            raise HTTPException(404, "Dispute not found")
        
        # Check if user is authorized (admin, customer, or provider involved)
        is_admin = getattr(user, "is_admin", False)
        is_involved = (
            dispute.booking.user_id == user.id or 
            dispute.booking.provider.user_id == user.id
        )
        if not is_admin and not is_involved:
            raise HTTPException(403, "Not authorized to view this dispute")
        
        return dispute

    async def add_message(self, dispute_id: int, sender_id: int, sender_type: str, message: str):
        dispute = await self.db.get(Dispute, dispute_id)
        if not dispute:
            raise HTTPException(404, "Dispute not found")
        if dispute.status == "closed":
            raise HTTPException(400, "Cannot add messages to closed dispute")
        
        dispute_message = DisputeMessage(
            dispute_id=dispute_id,
            sender_id=sender_id if sender_type == "user" else None,
            sender_type=sender_type,
            message=message
        )
        self.db.add(dispute_message)
        await self.db.commit()
        await self.db.refresh(dispute_message)
        return dispute_message

    async def get_messages(self, dispute_id: int):
        stmt = select(DisputeMessage).where(
            DisputeMessage.dispute_id == dispute_id
        ).order_by(DisputeMessage.created_at)
        result = await self.db.execute(stmt)
        return result.scalars().all()
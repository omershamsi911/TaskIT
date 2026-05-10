from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.review import Review
from app.models.booking import Booking
from app.models.provider import Provider
from app.schemas.review import ReviewCreate
from fastapi import HTTPException

class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_review(self, user_id: int, data: ReviewCreate):
        booking = await self.db.get(Booking, data.booking_id)
        if not booking or booking.user_id != user_id:
            raise HTTPException(403, "You can only review your own bookings")
            
        if booking.status != "completed":
            raise HTTPException(400, "Can only review completed jobs")

        reviewer_role = "customer" if booking.user_id == user_id else "provider"
        reviewee_id = booking.provider.user_id if reviewer_role == "customer" else booking.user_id

        stmt = select(Review).where(Review.booking_id == data.booking_id, Review.reviewer_id == user_id)
        if (await self.db.execute(stmt)).scalar_one_or_none():
            raise HTTPException(400, "Already reviewed")

        review = Review(
            booking_id=data.booking_id,
            reviewer_id=user_id,
            reviewee_id=reviewee_id,
            reviewer_role=reviewer_role,
            rating=data.rating,
            comment=data.comment
        )
        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def get_reviews_for_provider(self, provider_id: int):
        provider = await self.db.get(Provider, provider_id)
        if not provider:
            raise HTTPException(404, "Provider not found")
            
        stmt = select(Review).where(Review.reviewee_id == provider.user_id, Review.reviewer_role == "customer")
        result = await self.db.execute(stmt)
        return result.scalars().all()
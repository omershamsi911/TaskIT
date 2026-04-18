from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.review import Review, ReviewHelpfulVote
from app.models.booking import Booking
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
        # Determine reviewer_role
        if booking.user_id == user_id:
            reviewer_role = "customer"
            reviewee_id = booking.provider.user_id
        else:
            reviewer_role = "provider"
            reviewee_id = booking.user_id
        # Check if already reviewed
        stmt = select(Review).where(Review.booking_id == data.booking_id, Review.reviewer_id == user_id)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
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
        # Trigger provider stats update (handled by DB trigger)
        return review

    async def get_reviews_for_provider(self, provider_id: int):
        # Need provider's user_id
        from app.models.provider import Provider
        provider = await self.db.get(Provider, provider_id)
        if not provider:
            raise HTTPException(404, "Provider not found")
        stmt = select(Review).where(Review.reviewee_id == provider.user_id, Review.reviewer_role == "customer")
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def vote_helpful(self, review_id: int, user_id: int):
        # Check if already voted
        stmt = select(ReviewHelpfulVote).where(ReviewHelpfulVote.review_id == review_id, ReviewHelpfulVote.user_id == user_id)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(400, "Already voted")
        vote = ReviewHelpfulVote(review_id=review_id, user_id=user_id)
        self.db.add(vote)
        await self.db.commit()
        return {"success": True}

    async def add_provider_reply(self, review_id: int, provider_user_id: int, reply: str):
        review = await self.db.get(Review, review_id)
        if not review:
            raise HTTPException(404, "Review not found")
        if review.reviewee_id != provider_user_id:
            raise HTTPException(403, "Not your review to reply")
        review.provider_reply = reply
        review.provider_replied_at = datetime.utcnow()
        await self.db.commit()
        return review
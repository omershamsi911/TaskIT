from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService
from typing import List

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
async def create_review(
    data: ReviewCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = ReviewService(db)
    return await service.create_review(current_user.id, data)

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
async def get_provider_reviews(
    provider_id: int,
    db: AsyncSession = Depends(get_db)
):
    service = ReviewService(db)
    return await service.get_reviews_for_provider(provider_id)

@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = ReviewService(db)
    return await service.vote_helpful(review_id, current_user.id)

@router.post("/{review_id}/reply")
async def reply_to_review(
    review_id: int,
    reply: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = ReviewService(db)
    return await service.add_provider_reply(review_id, current_user.id, reply)
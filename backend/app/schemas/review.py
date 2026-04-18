from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str]

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewee_id: int
    reviewer_role: str
    rating: int
    comment: Optional[str]
    helpful_count: int
    provider_reply: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
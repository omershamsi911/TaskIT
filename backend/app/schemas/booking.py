from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class BookingCreate(BaseModel):
    provider_id: int
    service_id: int
    address_id: int
    scheduled_at: datetime
    description: Optional[str]
    special_instructions: Optional[str]
    quoted_price: Decimal

class BookingResponse(BaseModel):
    id: int
    booking_ref: str
    user_id: int
    provider_id: int
    service_id: int
    address_id: int
    status: str
    description: Optional[str]
    special_instructions: Optional[str]
    scheduled_at: datetime
    accepted_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    quoted_price: Decimal
    final_price: Optional[Decimal]
    platform_fee: Optional[Decimal]
    cancellation_reason: Optional[str]
    cancelled_by: Optional[int]
    created_at: datetime
    updated_at: datetime
    photos: List['JobPhotoResponse'] = []

    class Config:
        from_attributes = True

class JobPhotoResponse(BaseModel):
    id: int
    photo_type: str
    url: str
    caption: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
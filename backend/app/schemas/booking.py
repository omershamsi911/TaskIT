from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    provider_id: int
    service_id: int
    address: str
    scheduled_at: datetime
    description: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    user_id: int
    provider_id: int
    service_id: int
    status: str
    description: Optional[str] = None
    scheduled_at: datetime
    address: str
    created_at: datetime

    class Config:
        from_attributes = True
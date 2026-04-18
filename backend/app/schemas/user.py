from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: Optional[EmailStr]
    phone: str
    role: str
    status: str
    avatar_url: Optional[str]
    wallet_balance: float
    loyalty_points: int
    is_phone_verified: bool
    is_email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AddressCreate(BaseModel):
    label: str = "Home"
    address_line1: str
    address_line2: Optional[str]
    city: str
    province: str
    postal_code: Optional[str]
    lat: float
    lng: float
    is_default: bool = False

class AddressResponse(AddressCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, time, date
from decimal import Decimal

class ProviderProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: str
    avatar_url: Optional[str]
    bio: Optional[str]
    years_of_experience: Optional[int]
    avg_rating: float
    total_reviews: int
    total_completed_jobs: int
    response_rate: float
    service_radius_km: float
    lat: Optional[float]
    lng: Optional[float]
    availability_status: str
    trust_score: float
    is_featured: bool
    profile_approved_at: Optional[datetime]
    services: List['ProviderServiceResponse'] = []
    badges: List['BadgeResponse'] = []

    class Config:
        from_attributes = True

class ProviderServiceCreate(BaseModel):
    subcategory_id: int
    title: str
    description: Optional[str]
    pricing_type: str = "fixed"
    base_price: Decimal
    max_price: Optional[Decimal]
    price_unit: Optional[str]
    estimated_hours: Optional[float]
    is_active: bool = True

class ProviderServiceResponse(ProviderServiceCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class BadgeResponse(BaseModel):
    code: str
    name: str
    description: Optional[str]
    icon_url: Optional[str]
    awarded_at: datetime
    class Config:
        from_attributes = True

class ProviderAvailabilityCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time
    is_available: bool = True

class ProviderSearchFilters(BaseModel):
    lat: float
    lng: float
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    max_distance_km: float = 10.0
    min_rating: float = 0.0
    sort_by: str = "recommended"
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_current_active_user, get_current_provider
from app.core.database import get_db
from app.schemas.provider import ProviderProfileResponse, ProviderServiceCreate, ProviderServiceResponse, ProviderSearchFilters
from app.services.provider_service import ProviderService

router = APIRouter()

@router.get("/all-services")
async def get_all_provider_services(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all services from all providers (for customer browsing)"""
    try:
        from app.services.provider_service import ProviderService
        
        service = ProviderService(db)
        services = await service.get_all_services(skip=skip, limit=limit)
        
        # Convert to list of dictionaries
        services_list = []
        for s in services:
            services_list.append({
                "id": s.id,
                "provider_id": s.provider_id,
                "title": s.title,
                "description": s.description,
                "base_price": float(s.base_price) if s.base_price else None,
                "pricing_type": s.pricing_type,
            })
        
        return {
            "message": "Services retrieved successfully",
            "count": len(services_list),
            "data": services_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@router.get("/search", response_model=List[ProviderProfileResponse])
async def search_providers(
    lat: float,
    lng: float,
    category_id: Optional[int] = None,
    subcategory_id: Optional[int] = None,
    max_distance_km: float = 10.0,
    min_rating: float = 0.0,
    sort_by: str = "recommended",
    db: AsyncSession = Depends(get_db)
):
    service = ProviderService(db)
    filters = ProviderSearchFilters(
        lat=lat, lng=lng, category_id=category_id, subcategory_id=subcategory_id,
        max_distance_km=max_distance_km, min_rating=min_rating, sort_by=sort_by
    )
    return await service.search_providers(filters)

@router.get("/{provider_id}", response_model=ProviderProfileResponse)
async def get_provider_profile(provider_id: int, db: AsyncSession = Depends(get_db)):
    service = ProviderService(db)
    return await service.get_provider_details(provider_id)

@router.post("/me/services", response_model=ProviderServiceResponse)
async def add_service(
    data: ProviderServiceCreate,
    current_user = Depends(get_current_provider),
    db: AsyncSession = Depends(get_db)
):
    service = ProviderService(db)
    provider = await service.get_provider_by_user(current_user.id)
    return await service.create_service(provider.id, data)



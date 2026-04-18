from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.provider import Provider, ProviderService
from app.models.user import User
from app.schemas.provider import ProviderSearchFilters, ProviderServiceCreate
from geopy.distance import geodesic
from fastapi import HTTPException

class ProviderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_providers(self, filters: ProviderSearchFilters):
        # Build query
        stmt = select(Provider).join(User).where(
            User.status == "active",
            Provider.profile_approved_at.isnot(None),
            Provider.availability_status != "offline"
        )
        # Apply filters
        if filters.category_id:
            # Join services and subcategories
            stmt = stmt.join(ProviderService).join(Subcategory).where(Subcategory.category_id == filters.category_id)
        if filters.subcategory_id:
            stmt = stmt.join(ProviderService).where(ProviderService.subcategory_id == filters.subcategory_id)
        if filters.min_rating:
            stmt = stmt.where(Provider.avg_rating >= filters.min_rating)

        result = await self.db.execute(stmt)
        providers = result.scalars().all()

        # Distance filter & sort
        filtered = []
        for p in providers:
            if p.lat and p.lng:
                dist = geodesic((filters.lat, filters.lng), (float(p.lat), float(p.lng))).km
                if dist <= filters.max_distance_km:
                    p.distance = dist
                    filtered.append(p)
        # Sorting
        if filters.sort_by == "recommended":
            # AI scoring (simplified)
            filtered.sort(key=lambda x: (x.trust_score + x.avg_rating) / (x.distance + 0.1), reverse=True)
        elif filters.sort_by == "rating":
            filtered.sort(key=lambda x: x.avg_rating, reverse=True)
        elif filters.sort_by == "distance":
            filtered.sort(key=lambda x: x.distance)
        return filtered

    async def get_provider_details(self, provider_id: int):
        stmt = select(Provider).where(Provider.id == provider_id)
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if not provider:
            raise HTTPException(404, "Provider not found")
        return provider

    async def get_provider_by_user(self, user_id: int):
        stmt = select(Provider).where(Provider.user_id == user_id)
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if not provider:
            raise HTTPException(404, "Provider profile not found")
        return provider

    async def create_service(self, provider_id: int, data: ProviderServiceCreate):
        service = ProviderService(provider_id=provider_id, **data.dict())
        self.db.add(service)
        await self.db.commit()
        await self.db.refresh(service)
        return service
import numpy as np
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.provider import Provider
from app.models.user import User
from geopy.distance import geodesic

class AIMatchingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_top_providers(
        self,
        subcategory_id: int,
        user_lat: float,
        user_lng: float,
        budget: float = None,
        limit: int = 5
    ) -> List[Tuple[Provider, float]]:
        # Fetch eligible providers
        stmt = select(Provider).join(User).where(
            User.status == "active",
            Provider.profile_approved_at.isnot(None),
            Provider.availability_status == "available"
        )
        # Join with services to filter subcategory
        stmt = stmt.join(Provider.services).where(ProviderService.subcategory_id == subcategory_id)
        result = await self.db.execute(stmt)
        providers = result.scalars().all()

        scored = []
        for p in providers:
            if not p.lat or not p.lng:
                continue
            dist = geodesic((user_lat, user_lng), (float(p.lat), float(p.lng))).km
            if dist > p.service_radius_km:
                continue
            # Scoring factors (normalized)
            dist_score = max(0, 1 - dist / 20)  # 0-1
            rating_score = float(p.avg_rating) / 5.0
            trust_score = float(p.trust_score) / 100.0 if p.trust_score else 0.5
            response_score = p.response_rate / 100.0 if p.response_rate else 0.5
            # Price factor (if budget)
            price_score = 1.0
            if budget:
                # find cheapest service price
                prices = [float(s.base_price) for s in p.services if s.subcategory_id == subcategory_id]
                if prices:
                    avg_price = sum(prices)/len(prices)
                    price_score = max(0, 1 - abs(budget - avg_price) / budget) if budget>0 else 1.0

            final = (dist_score * 0.3 + rating_score * 0.25 + trust_score * 0.2 +
                     response_score * 0.15 + price_score * 0.1)
            scored.append((p, final))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]
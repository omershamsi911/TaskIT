from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.services.ai_matching import AIMatchingService
from app.schemas.provider import ProviderProfileResponse

router = APIRouter()

@router.get("/match-providers", response_model=list[ProviderProfileResponse])
async def match_providers(
    subcategory_id: int,
    lat: float,
    lng: float,
    budget: float = None,
    limit: int = 5,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = AIMatchingService(db)
    providers = await service.get_top_providers(subcategory_id, lat, lng, budget, limit)
    # Log the match
    await service.log_match(current_user.id, subcategory_id, lat, lng, providers)
    return [p[0] for p in providers]
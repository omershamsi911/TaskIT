from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.services.dispute_service import DisputeService

router = APIRouter()

@router.post("/")
async def raise_dispute(
    booking_id: int,
    dispute_type: str,
    description: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = DisputeService(db)
    return await service.create_dispute(booking_id, current_user.id, dispute_type, description)

@router.get("/{dispute_id}")
async def get_dispute(dispute_id: int, current_user = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    service = DisputeService(db)
    return await service.get_dispute(dispute_id, current_user)

@router.post("/{dispute_id}/messages")
async def send_dispute_message(
    dispute_id: int,
    message: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = DisputeService(db)
    return await service.add_message(dispute_id, current_user.id, "user", message)
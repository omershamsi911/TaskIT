from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.schemas.payment import PaymentResponse, WalletTransactionResponse
from app.services.payment_service import PaymentService
from typing import List

router = APIRouter()

@router.post("/bookings/{booking_id}/pay")
async def initiate_payment(
    booking_id: int,
    method: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = PaymentService(db)
    return await service.create_payment(booking_id, current_user.id, method)

@router.get("/wallet", response_model=List[WalletTransactionResponse])
async def get_wallet_transactions(
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = PaymentService(db)
    return await service.get_wallet_history(current_user.id)

@router.post("/wallet/topup")
async def topup_wallet(
    amount: float,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = PaymentService(db)
    return await service.topup_wallet(current_user.id, amount)
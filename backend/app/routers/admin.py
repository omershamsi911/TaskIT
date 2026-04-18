from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.services.admin_service import AdminService

router = APIRouter()

async def admin_required(current_user = Depends(get_current_user)):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(403, "Admin access required")
    return current_user

@router.get("/dashboard/stats")
async def get_dashboard_stats(admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_platform_stats()

@router.get("/users")
async def list_users(skip: int=0, limit: int=50, status: str=None, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_users(skip, limit, status)

@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: int, status: str, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.update_user_status(user_id, status)

@router.get("/providers/pending-approval")
async def pending_approvals(admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_pending_providers()

@router.post("/providers/{provider_id}/approve")
async def approve_provider(provider_id: int, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.approve_provider(provider_id, admin.id)

@router.get("/disputes")
async def list_disputes(status: str=None, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_disputes(status)

@router.post("/disputes/{dispute_id}/assign")
async def assign_dispute(dispute_id: int, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.assign_dispute(dispute_id, admin.id)

@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: int, resolution_note: str, refund_amount: float=None, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.resolve_dispute(dispute_id, admin.id, resolution_note, refund_amount)

@router.get("/reports")
async def list_reports(status: str=None, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_reports(status)

@router.post("/promo-codes")
async def create_promo_code(data: dict, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.create_promo_code(data, admin.id)

@router.get("/settings")
async def get_platform_settings(admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.get_settings()

@router.put("/settings/{key}")
async def update_setting(key: str, value: str, admin=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    return await service.update_setting(key, value, admin.id)
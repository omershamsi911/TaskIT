from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.schemas.user import UserResponse, AddressCreate, AddressResponse
from app.services.user_service import UserService
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_active_user)):
    return current_user

@router.get("/addresses", response_model=List[AddressResponse])
async def get_my_addresses(
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.get_user_addresses(current_user.id)

@router.post("/addresses", response_model=AddressResponse, status_code=201)
async def add_address(
    data: AddressCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.create_address(current_user.id, data)

@router.put("/addresses/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    data: AddressCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.update_address(address_id, current_user.id, data)

@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    await service.delete_address(address_id, current_user.id)
    return {"message": "Address deleted"}

@router.get("/stats")
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """Public platform stats — no auth required"""
    service = AdminService(db)
    return await service.get_platform_stats()
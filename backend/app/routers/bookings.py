from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse, JobPhotoResponse
from app.services.booking_service import BookingService
from app.services.notification_service import NotificationService

router = APIRouter()

@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(
    data: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    booking = await service.create_booking(current_user.id, data)
    # Background notification to provider
    background_tasks.add_task(NotificationService(db).notify_new_booking, booking)
    return booking

@router.get("/", response_model=List[BookingResponse])
async def get_my_bookings(
    status: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    return await service.get_user_bookings(current_user.id, status)

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    booking = await service.get_booking(booking_id)
    if booking.user_id != current_user.id and booking.provider.user_id != current_user.id:
        raise HTTPException(403, "Not authorized")
    return booking

@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    return await service.update_status(booking_id, status, current_user)

@router.post("/{booking_id}/photos", response_model=JobPhotoResponse)
async def upload_job_photo(
    booking_id: int,
    photo_type: str,
    url: str,
    caption: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    return await service.add_photo(booking_id, current_user.id, photo_type, url, caption)

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    reason: str,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = BookingService(db)
    return await service.cancel_booking(booking_id, current_user.id, reason)
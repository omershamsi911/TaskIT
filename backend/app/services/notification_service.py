from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.models.user import User
from app.models.booking import Booking

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def notify_new_booking(self, booking: Booking):
        # Get provider user ID
        provider_user_id = booking.provider.user_id
        
        notification = Notification(
            user_id=provider_user_id,
            type="booking_request",
            title="New Booking Request",
            body=f"You have a new booking request from {booking.user.full_name}",
            ref_id=str(booking.id),
            ref_type="booking"
        )
        self.db.add(notification)
        await self.db.commit()

    async def notify_booking_accepted(self, booking: Booking):
        notification = Notification(
            user_id=booking.user_id,
            type="booking_accepted",
            title="Booking Accepted",
            body=f"Your booking has been accepted by {booking.provider.user.full_name}",
            ref_id=str(booking.id),
            ref_type="booking"
        )
        self.db.add(notification)
        await self.db.commit()

    async def notify_booking_completed(self, booking: Booking):
        notification = Notification(
            user_id=booking.user_id,
            type="booking_completed",
            title="Booking Completed",
            body="Your booking has been marked as completed. Please leave a review!",
            ref_id=str(booking.id),
            ref_type="booking"
        )
        self.db.add(notification)
        await self.db.commit()

    async def send_notification(self, user_id: int, type: str, title: str, body: str, ref_id: str = None, ref_type: str = None):
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            ref_id=ref_id,
            ref_type=ref_type
        )
        self.db.add(notification)
        await self.db.commit()
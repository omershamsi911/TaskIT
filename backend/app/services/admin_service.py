from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.provider import Provider
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.dispute import Dispute
from app.models.report import Report
from app.models.settings import PlatformSetting
from app.models.promo import PromoCode
from datetime import datetime
from fastapi import HTTPException

class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_platform_stats(self):
        total_users = await self.db.scalar(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))
        total_providers = await self.db.scalar(select(func.count()).select_from(Provider).where(Provider.profile_approved_at.isnot(None)))
        completed_bookings = await self.db.scalar(select(func.count()).select_from(Booking).where(Booking.status == "completed"))
        total_revenue = await self.db.scalar(select(func.sum(Payment.platform_fee)).where(Payment.status == "captured"))
        return {
            "total_users": total_users,
            "total_providers": total_providers,
            "completed_bookings": completed_bookings,
            "total_revenue": float(total_revenue or 0)
        }

    async def get_users(self, skip: int, limit: int, status: str = None):
        stmt = select(User).where(User.deleted_at.is_(None))
        if status:
            stmt = stmt.where(User.status == status)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def update_user_status(self, user_id: int, status: str):
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(404, "User not found")
        user.status = status
        await self.db.commit()
        return user

    async def get_pending_providers(self):
        stmt = select(Provider).where(Provider.profile_approved_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def approve_provider(self, provider_id: int, admin_id: int):
        provider = await self.db.get(Provider, provider_id)
        if not provider:
            raise HTTPException(404, "Provider not found")
        provider.profile_approved_at = datetime.utcnow()
        await self.db.commit()
        # Optionally notify provider
        return provider

    async def get_disputes(self, status: str = None):
        stmt = select(Dispute)
        if status:
            stmt = stmt.where(Dispute.status == status)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def assign_dispute(self, dispute_id: int, admin_id: int):
        dispute = await self.db.get(Dispute, dispute_id)
        dispute.assigned_to = admin_id
        dispute.status = "under_review"
        await self.db.commit()
        return dispute

    async def resolve_dispute(self, dispute_id: int, admin_id: int, resolution_note: str, refund_amount: float = None):
        dispute = await self.db.get(Dispute, dispute_id)
        dispute.status = "resolved_for_user"  # or choose based on outcome
        dispute.resolution_note = resolution_note
        dispute.resolved_at = datetime.utcnow()
        if refund_amount:
            dispute.refund_amount = refund_amount
            # Trigger refund logic
        await self.db.commit()
        return dispute

    async def get_reports(self, status: str = None):
        stmt = select(Report)
        if status:
            stmt = stmt.where(Report.status == status)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create_promo_code(self, data: dict, admin_id: int):
        promo = PromoCode(**data, created_by=admin_id)
        self.db.add(promo)
        await self.db.commit()
        await self.db.refresh(promo)
        return promo

    async def get_settings(self):
        result = await self.db.execute(select(PlatformSetting))
        settings = result.scalars().all()
        return {s.key: s.value for s in settings}

    async def update_setting(self, key: str, value: str, admin_id: int):
        stmt = select(PlatformSetting).where(PlatformSetting.key == key)
        result = await self.db.execute(stmt)
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
            setting.updated_by = admin_id
        else:
            setting = PlatformSetting(key=key, value=value, updated_by=admin_id)
            self.db.add(setting)
        await self.db.commit()
        return setting
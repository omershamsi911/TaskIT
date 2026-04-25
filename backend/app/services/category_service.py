# services/category_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.category import Category, Subcategory

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_categories(self):
        stmt = (
            select(Category)
            .where(Category.is_active == True)
            .options(selectinload(Category.subcategories))
            .order_by(Category.sort_order)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_category_by_slug(self, slug: str):
        stmt = (
            select(Category)
            .where(Category.slug == slug, Category.is_active == True)
            .options(selectinload(Category.subcategories))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_subcategories(self, category_id: int):
        stmt = (
            select(Subcategory)
            .where(
                Subcategory.category_id == category_id,
                Subcategory.is_active == True
            )
            .order_by(Subcategory.sort_order)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
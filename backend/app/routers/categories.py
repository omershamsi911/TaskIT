# api/categories.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.schemas.category import CategoryResponse, SubcategoryResponse
from app.services.category_service import CategoryService

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all active categories with their subcategories"""
    service = CategoryService(db)
    return await service.get_all_categories()

@router.get("/{slug}", response_model=CategoryResponse)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a single category by slug"""
    service = CategoryService(db)
    category = await service.get_category_by_slug(slug)
    if not category:
        from fastapi import HTTPException
        raise HTTPException(404, "Category not found")
    return category

@router.get("/{category_id}/subcategories", response_model=List[SubcategoryResponse])
async def get_subcategories(category_id: int, db: AsyncSession = Depends(get_db)):
    """Get subcategories for a category"""
    service = CategoryService(db)
    return await service.get_subcategories(category_id)
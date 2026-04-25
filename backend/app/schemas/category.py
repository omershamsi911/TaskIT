# schemas/category.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubcategoryResponse(BaseModel):
    id: int
    category_id: int
    name: str
    slug: str
    icon_url: Optional[str]
    description: Optional[str]
    is_active: bool
    sort_order: int

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon_url: Optional[str]
    description: Optional[str]
    is_active: bool
    sort_order: int
    subcategories: List[SubcategoryResponse] = []

    class Config:
        from_attributes = True
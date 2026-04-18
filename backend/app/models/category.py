from sqlalchemy import Column, Integer, String, Text, Boolean, SmallInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    icon_url = Column(String(500))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    sort_order = Column(SmallInteger, default=0)
    created_at = Column(DateTime, server_default=func.now())
    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    icon_url = Column(String(500))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    sort_order = Column(SmallInteger, default=0)
    created_at = Column(DateTime, server_default=func.now())
    category = relationship("Category", back_populates="subcategories")
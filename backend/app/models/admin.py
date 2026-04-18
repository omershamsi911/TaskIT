from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(180), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum("super_admin", "support_agent", "finance_manager", "content_moderator"),
        nullable=False,
        default="support_agent"
    )
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
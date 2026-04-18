from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.admin import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    # Check if it's an admin or normal user
    role = payload.get("role")
    if role == "admin":
        result = await db.execute(select(AdminUser).where(AdminUser.id == int(user_id)))
        admin = result.scalar_one_or_none()
        if admin is None or not admin.is_active:
            raise credentials_exception
        # Attach a flag
        admin.is_admin = True
        return admin
    else:
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if user is None or user.deleted_at is not None or user.status == "banned":
            raise credentials_exception
        user.is_admin = False
        return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if getattr(current_user, "is_admin", False):
        return current_user
    if current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_provider(
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["provider", "both"]:
        raise HTTPException(status_code=403, detail="Provider role required")
    # Fetch provider profile
    # We'll do this in service layer
    return current_user

def require_role(*allowed_roles: str):
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.models.otp_token import OTPToken
from app.schemas.auth import SignupRequest, PhoneLoginRequest, EmailLoginRequest, LoginResponse, UserResponse
from app.utils.otp import generate_otp, send_sms_otp
from fastapi import HTTPException, status
import random
import string

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def signup(self, data: SignupRequest):
        # Check existing
        stmt = select(User).where(User.phone == data.phone)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone already registered")
        if data.email:
            stmt = select(User).where(User.email == data.email)
            result = await self.db.execute(stmt)
            if result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            full_name=data.full_name,
            phone=data.phone,
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=data.role,
            status="active"
        )
         # Mark as verified for testing
        user.is_phone_verified = True
        user.is_email_verified = True
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Generate referral code via trigger (handled by DB)
        # Create tokens
        return self.create_tokens_for_user(user)

    async def login_with_phone(self, data: PhoneLoginRequest):
        # OTP flow: if OTP provided, verify; else password
        if data.otp:
            user = await self.verify_otp(data.phone, data.otp)
        else:
            stmt = select(User).where(User.phone == data.phone)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user or not verify_password(data.password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            if user.status in ["suspended", "banned"]:
                raise HTTPException(status_code=403, detail="Account restricted")
        return self.create_tokens_for_user(user)
    
    def serialize_user(user: User):
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "phone": user.phone,
            "is_phone_verified": user.is_phone_verified,
            "is_email_verified": user.is_email_verified,
            "is_business_account": user.is_business_account,
            "fcm_token": user.fcm_token,
            "avatar_url": user.avatar_url
        }

    async def login_with_email(self, data: EmailLoginRequest):
        stmt = select(User).where(User.email == data.email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return LoginResponse(
            user=UserResponse.model_validate(user),
            tokens=self.create_tokens_for_user(user)
        )
    def create_tokens_for_user(self, user: User):
        payload = {"sub": str(user.id), "role": user.role}
        access = create_access_token(payload)
        refresh = create_refresh_token(payload)
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

    async def send_otp(self, phone: str):
        # Rate limit check (via Redis)
        otp = generate_otp()
        expires = datetime.utcnow() + timedelta(minutes=5)
        # Save OTP token
        token = OTPToken(user_id=None, type="login", token=otp, expires_at=expires)  # user_id may be null for pre-login
        self.db.add(token)
        await self.db.commit()
        await send_sms_otp(phone, otp)

    async def verify_otp(self, phone: str, otp: str) -> User:
        stmt = select(OTPToken).where(OTPToken.token == otp, OTPToken.expires_at > datetime.utcnow(), OTPToken.is_used == False)
        result = await self.db.execute(stmt)
        token = result.scalar_one_or_none()
        if not token:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        token.is_used = True
        # Find user by phone (or create if signup flow)
        stmt = select(User).where(User.phone == phone)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            # In signup flow, user might be created separately
            raise HTTPException(status_code=404, detail="User not found")
        await self.db.commit()
        return user

    async def refresh_access_token(self, refresh_token: str):
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = payload.get("sub")
        # Optionally verify user still exists
        new_access = create_access_token({"sub": user_id, "role": payload.get("role")})
        return {"access_token": new_access, "token_type": "bearer"}
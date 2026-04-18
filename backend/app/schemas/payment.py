from pydantic import BaseModel, EmailStr, Field, validator
from decimal import Decimal
from typing import Optional
from datetime import datetime

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal
    platform_fee: Decimal
    provider_payout: Decimal
    method: str
    status: str
    escrow_status: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class WalletTransactionResponse(BaseModel):
    id: int
    type: str
    amount: Decimal
    balance_after: Decimal
    note: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
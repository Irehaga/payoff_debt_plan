from pydantic import BaseModel, Field, validator
from typing import List, Literal, Optional
from decimal import Decimal
from uuid import uuid4
from datetime import datetime

class CreditCard(BaseModel):
    id: Optional[str] = None
    name: str
    balance: Decimal = Field(gt=0)
    interest_rate: Decimal = Field(gt=0)
    min_payment: Decimal = Field(gt=0)
    
    @validator('id', pre=True, always=True)
    def default_id(cls, v):
        return v or str(uuid4())
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }
        from_attributes = True

class DebtPayoffRequest(BaseModel):
    credit_cards: List[CreditCard]
    strategy: Literal["avalanche", "snowball"]
    monthly_payment: Decimal = Field(gt=0)
    
    @validator('monthly_payment')
    def validate_monthly_payment(cls, v, values):
        if 'credit_cards' in values:
            total_min = sum(card.min_payment for card in values['credit_cards'])
            if v < total_min:
                raise ValueError(f"Monthly payment must be at least {total_min}")
        return v

class CardPayment(BaseModel):
    card_id: str
    card_name: str
    payment: Decimal
    interest_paid: Decimal
    remaining_balance: Decimal
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }

class PaymentStep(BaseModel):
    month: int
    card_payments: List[CardPayment]
    total_payment: Decimal
    remaining_debt: Decimal
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }
    
class DebtPayoffResponse(BaseModel):
    total_months: int
    total_interest_paid: Decimal
    total_amount_paid: Decimal
    payment_schedule: List[PaymentStep]
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }


class PaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    credit_card_id: int
    interest_portion: Decimal
    principal_portion: Decimal

class Payment(PaymentCreate):
    id: int
    payment_date: datetime
    user_id: int

    class Config:
        from_attributes = True
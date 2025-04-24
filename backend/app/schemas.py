from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    date: datetime
    credit_card_id: Optional[int] = None
    balance_type: str  # "credit_card" or "cash" 
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.debt import PaymentCreate, Payment
from app.models.db_models import Payment as DBPayment, CreditCard
from app.services.auth import get_current_user
from datetime import datetime
from typing import List

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify card belongs to user
    card = db.query(CreditCard).filter(
        CreditCard.id == payment_data.credit_card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )
    
    # Create payment
    db_payment = DBPayment(
        amount=float(payment_data.amount),
        interest_portion=float(payment_data.interest_portion),
        principal_portion=float(payment_data.principal_portion),
        user_id=current_user.id,
        credit_card_id=payment_data.credit_card_id,
        payment_date=datetime.now()
    )
    
    # Update card balance
    card.balance -= float(payment_data.principal_portion)
    if card.balance <= 0:
        card.is_paid_off = True
        card.balance = 0
    
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return db_payment

@router.get("/", response_model=List[Payment])
async def get_user_payments(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payments = db.query(DBPayment).filter(
        DBPayment.user_id == current_user.id
    ).order_by(DBPayment.payment_date.desc()).all()
    
    return payments

@router.get("/cards/{card_id}", response_model=List[Payment])
async def get_card_payments(
    card_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify card belongs to user
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )
    
    payments = db.query(DBPayment).filter(
        DBPayment.credit_card_id == card_id
    ).order_by(DBPayment.payment_date.desc()).all()
    
    return payments
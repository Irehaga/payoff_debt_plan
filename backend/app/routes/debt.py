from fastapi import APIRouter, HTTPException, Depends
from app.models.debt import DebtPayoffRequest, DebtPayoffResponse
from app.services.calculator import calculate_debt_payoff
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User, CreditCard as DBCreditCard
from app.services.auth import get_current_user
from typing import List
from decimal import Decimal

router = APIRouter(prefix="/debt", tags=["debt"])

@router.post("/calculate", response_model=DebtPayoffResponse)
async def calculate_payoff(request: DebtPayoffRequest):
    try:
        result = calculate_debt_payoff(
            request.credit_cards,
            request.strategy,
            request.monthly_payment
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Optional: Add routes for saving credit cards to the database
@router.post("/cards", status_code=201)
async def create_credit_card(
    name: str,
    balance: float,
    interest_rate: float, 
    min_payment: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create new credit card
    db_card = DBCreditCard(
        name=name,
        balance=balance,
        interest_rate=interest_rate,
        min_payment=min_payment,
        user_id=current_user.id
    )
    
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    
    return {
        "id": db_card.id,
        "name": db_card.name,
        "balance": db_card.balance,
        "interest_rate": db_card.interest_rate,
        "min_payment": db_card.min_payment
    }

@router.get("/cards", response_model=List[dict])
async def get_credit_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cards = db.query(DBCreditCard).filter(DBCreditCard.user_id == current_user.id).all()
    return [
        {
            "id": str(card.id),
            "name": card.name,
            "balance": card.balance,
            "interest_rate": card.interest_rate,
            "min_payment": card.min_payment
        } 
        for card in cards
    ]

@router.delete("/cards/{card_id}")
async def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(DBCreditCard).filter(
        DBCreditCard.id == card_id, 
        DBCreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=404,
            detail="Credit card not found"
        )
    
    db.delete(card)
    db.commit()
    
    return {"message": "Credit card deleted successfully"}
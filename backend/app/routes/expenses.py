from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User, Expense, UserBalance, CreditCard
from app.services.auth import get_current_user
from typing import List
from decimal import Decimal
from datetime import datetime

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/balance")
async def set_initial_balance(
    balance: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user already has a balance record
    user_balance = db.query(UserBalance).filter(UserBalance.user_id == current_user.id).first()
    
    if user_balance:
        # Update existing balance
        user_balance.balance = balance
    else:
        # Create new balance record
        user_balance = UserBalance(user_id=current_user.id, balance=balance)
        db.add(user_balance)
    
    db.commit()
    return {"message": "Balance updated successfully"}

@router.get("")
async def get_user_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    
    # Get user's initial balance
    user_balance = db.query(UserBalance).filter(UserBalance.user_id == current_user.id).first()
    initial_balance = user_balance.balance if user_balance else Decimal("0")
    
    total_expenses = sum(expense.amount for expense in expenses)
    current_balance = initial_balance - total_expenses
    
    # Get all credit cards for the user
    credit_cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    card_map = {card.id: card for card in credit_cards}
    
    return {
        "expenses": [
            {
                "id": expense.id,
                "description": expense.description,
                "amount": expense.amount,
                "date": expense.date.isoformat(),
                "credit_card_id": expense.credit_card_id,
                "credit_card": card_map.get(expense.credit_card_id) if expense.credit_card_id else None
            }
            for expense in expenses
        ],
        "currentBalance": current_balance
    }

@router.post("", status_code=201)
async def create_expense(
    description: str,
    amount: float,
    date: str,
    credit_card_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        expense_date = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Verify credit card belongs to user if provided
    updated_card = None
    if credit_card_id:
        card = db.query(CreditCard).filter(
            CreditCard.id == credit_card_id,
            CreditCard.user_id == current_user.id
        ).first()
        if not card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        
        # Update credit card balance
        card.balance += amount
        db.add(card)
        db.flush()  # Flush to get the updated card data
        updated_card = {
            "id": card.id,
            "name": card.name,
            "balance": card.balance,
            "interest_rate": card.interest_rate,
            "min_payment": card.min_payment
        }
    
    expense = Expense(
        description=description,
        amount=amount,
        date=expense_date,
        user_id=current_user.id,
        credit_card_id=credit_card_id
    )
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    # Recalculate current balance
    user_balance = db.query(UserBalance).filter(UserBalance.user_id == current_user.id).first()
    initial_balance = user_balance.balance if user_balance else Decimal("0")
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_expenses = sum(expense.amount for expense in expenses)
    current_balance = initial_balance - total_expenses
    
    return {
        "id": expense.id,
        "description": expense.description,
        "amount": expense.amount,
        "date": expense.date.isoformat(),
        "credit_card_id": expense.credit_card_id,
        "currentBalance": current_balance,
        "updatedCard": updated_card
    }

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )
    
    # If expense was linked to a credit card, update its balance
    updated_card = None
    if expense.credit_card_id:
        card = db.query(CreditCard).filter(
            CreditCard.id == expense.credit_card_id,
            CreditCard.user_id == current_user.id
        ).first()
        if card:
            # Convert expense amount to float before subtraction
            expense_amount = float(expense.amount)
            card.balance -= expense_amount
            db.add(card)
            db.flush()  # Flush to get the updated card data
            updated_card = {
                "id": card.id,
                "name": card.name,
                "balance": card.balance,
                "interest_rate": card.interest_rate,
                "min_payment": card.min_payment
            }
    
    db.delete(expense)
    db.commit()
    
    # Recalculate current balance
    user_balance = db.query(UserBalance).filter(UserBalance.user_id == current_user.id).first()
    initial_balance = user_balance.balance if user_balance else Decimal("0")
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_expenses = sum(expense.amount for expense in expenses)
    current_balance = initial_balance - total_expenses
    
    return {
        "message": "Expense deleted successfully",
        "currentBalance": current_balance,
        "updatedCard": updated_card
    } 
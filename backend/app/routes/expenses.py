from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User, Expense, UserBalance, CreditCard
from app.services.auth import get_current_user
from typing import List
from decimal import Decimal
from datetime import datetime
from app.schemas import ExpenseCreate

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
    
    # Only include cash expenses (where credit_card_id is None) in the total
    total_expenses = sum(expense.amount for expense in expenses if expense.credit_card_id is None)
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

@router.post("/expenses")
async def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if expense.balance_type == "credit_card" and not expense.credit_card_id:
        raise HTTPException(status_code=400, detail="Credit card ID is required for credit card expenses")
    
    db_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        date=expense.date,
        credit_card_id=expense.credit_card_id if expense.balance_type == "credit_card" else None,
        user_id=current_user.id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

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
    
    # Recalculate current balance (only including cash expenses)
    user_balance = db.query(UserBalance).filter(UserBalance.user_id == current_user.id).first()
    initial_balance = user_balance.balance if user_balance else Decimal("0")
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_expenses = sum(expense.amount for expense in expenses if expense.credit_card_id is None)
    current_balance = initial_balance - total_expenses
    
    return {
        "message": "Expense deleted successfully",
        "currentBalance": current_balance,
        "updatedCard": updated_card
    } 
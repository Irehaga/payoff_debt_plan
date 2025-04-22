from typing import List
from decimal import Decimal
from app.models.debt import CreditCard, CardPayment, PaymentStep, DebtPayoffResponse

def calculate_debt_payoff(
    credit_cards: List[CreditCard], 
    strategy: str,
    monthly_payment: Decimal
) -> DebtPayoffResponse:
    """
    Calculate debt payoff schedule using either avalanche or snowball method.
    
    Parameters:
    -----------
    credit_cards : List[CreditCard]
        List of credit cards with their details
    strategy : str
        Either 'avalanche' (highest interest first) or 'snowball' (lowest balance first)
    monthly_payment : Decimal
        Total monthly payment amount
        
    Returns:
    --------
    DebtPayoffResponse
        Complete payoff plan with schedule
    """
    # Create a copy of the credit cards to work with
    cards = [
        {
            "id": card.id,
            "name": card.name,
            "balance": card.balance,
            "interest_rate": card.interest_rate,
            "min_payment": card.min_payment
        } 
        for card in credit_cards
    ]
    
    # Calculate total minimum payment
    total_min_payment = sum(card["min_payment"] for card in cards)
    
    # Ensure monthly payment is at least the total minimum payment
    if monthly_payment < total_min_payment:
        raise ValueError(f"Monthly payment must be at least {total_min_payment}")
    
    # Sort cards based on strategy
    if strategy == "avalanche":
        # Sort by interest rate (highest first)
        cards.sort(key=lambda x: x["interest_rate"], reverse=True)
    else:  # snowball
        # Sort by balance (lowest first)
        cards.sort(key=lambda x: x["balance"])
    
    # Initialize counters
    month = 0
    total_interest_paid = Decimal("0")
    total_amount_paid = Decimal("0")
    payment_schedule = []
    
    # Continue until all cards are paid off
    while any(card["balance"] > Decimal("0") for card in cards):
        month += 1
        payment_remaining = monthly_payment
        card_payments = []
        
        # First, pay minimum on all cards
        for card in cards:
            if card["balance"] <= Decimal("0"):
                card_payments.append(CardPayment(
                    card_id=card["id"],
                    card_name=card["name"],
                    payment=Decimal("0"),
                    interest_paid=Decimal("0"),
                    remaining_balance=Decimal("0")
                ))
                continue
                
            # Calculate interest for this month
            monthly_interest_rate = card["interest_rate"] / Decimal("100") / Decimal("12")
            interest = card["balance"] * monthly_interest_rate
            total_interest_paid += interest
            
            # Apply interest to balance
            card["balance"] += interest
            
            # Determine payment for this card
            payment = min(card["min_payment"], card["balance"])
            payment_remaining -= payment
            
            # Update balance
            card["balance"] -= payment
            total_amount_paid += payment
            
            card_payments.append(CardPayment(
                card_id=card["id"],
                card_name=card["name"],
                payment=payment,
                interest_paid=interest,
                remaining_balance=card["balance"]
            ))
        
        # Apply extra payment to first card with balance > 0 according to strategy
        for card in cards:
            if card["balance"] <= Decimal("0") or payment_remaining <= Decimal("0"):
                continue
                
            extra_payment = min(payment_remaining, card["balance"])
            payment_remaining -= extra_payment
            
            # Update card balance
            card["balance"] -= extra_payment
            total_amount_paid += extra_payment
            
            # Update payment in card_payments
            for i, payment_info in enumerate(card_payments):
                if payment_info.card_id == card["id"]:
                    card_payments[i] = CardPayment(
                        card_id=payment_info.card_id,
                        card_name=payment_info.card_name,
                        payment=payment_info.payment + extra_payment,
                        interest_paid=payment_info.interest_paid,
                        remaining_balance=card["balance"]
                    )
                    break
                    
            if payment_remaining <= Decimal("0"):
                break
        
        # Add to payment schedule
        payment_schedule.append(PaymentStep(
            month=month,
            card_payments=card_payments,
            total_payment=monthly_payment - payment_remaining,
            remaining_debt=sum(card["balance"] for card in cards)
        ))
    
    return DebtPayoffResponse(
        total_months=month,
        total_interest_paid=total_interest_paid,
        total_amount_paid=total_amount_paid,
        payment_schedule=payment_schedule
    )
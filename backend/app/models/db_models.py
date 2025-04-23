from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    credit_cards = relationship("CreditCard", back_populates="owner")
    payments = relationship("Payment", back_populates="user")

class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    balance = Column(Float)
    interest_rate = Column(Float)
    min_payment = Column(Float)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_paid_off = Column(Boolean, default=False)
    
    owner = relationship("User", back_populates="credit_cards")
    payments = relationship("Payment", back_populates="credit_card")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    interest_portion = Column(Float)
    principal_portion = Column(Float)
    user_id = Column(Integer, ForeignKey("users.id"))
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"))
    
    user = relationship("User", back_populates="payments")
    credit_card = relationship("CreditCard", back_populates="payments")
# app/init_db.py
from app.database import engine, Base
from app.models.db_models import User, CreditCard, Payment, Expense, UserBalance  # Import all model classes

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
from app.database import engine, Base
from app.models.db_models import User, CreditCard, Payment, Expense, UserBalance

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 
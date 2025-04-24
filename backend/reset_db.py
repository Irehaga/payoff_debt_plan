from app.database import engine, Base
from app.models.db_models import User, CreditCard, Payment, Expense, UserBalance

def reset_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully!")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

if __name__ == "__main__":
    reset_db() 
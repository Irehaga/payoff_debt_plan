from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.database import Base, engine
from app.routes import debt, auth, payments, expenses

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Debt Payoff Planner API",
    description="API for calculating credit card debt payoff strategies",
    version="1.0.0"
)

# Configure CORS - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(debt.router)
app.include_router(auth.router)
app.include_router(payments.router)
app.include_router(expenses.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Debt Payoff Planner"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
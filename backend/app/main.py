from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routes import debt, auth

app = FastAPI(
    title="Debt Payoff Planner API",
    description="API for calculating credit card debt payoff strategies",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000", 
    "https://your-production-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(debt.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Debt Payoff Planner"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
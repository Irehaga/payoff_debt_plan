# Credit Card Debt Payoff Planner

A web application that helps users plan and track their credit card debt payoff journey using avalanche or snowball methods.

## Features

- User authentication and account management
- Add and manage multiple credit cards
- Calculate debt payoff schedules using avalanche or snowball methods
- Track payment history and progress
- Visualize debt reduction over time
- Secure API backend with FastAPI
- Responsive frontend with Next.js and Tailwind CSS

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy ORM
- JWT Authentication

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- Recharts for data visualization

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Setup Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database
python -m app.init_db

# Start the server
uvicorn app.main:app --reload

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev


The application will be available at:

Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs

Project Structure

backend/: FastAPI backend application

app/: Application code

models/: Data models
routes/: API endpoints
services/: Business logic



frontend/: Next.js frontend application

src/app/: Pages and routes
src/components/: Reusable components
src/lib/: Utilities and types
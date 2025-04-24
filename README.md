# Debt Payoff Planner

A comprehensive web application that helps users manage their finances, track expenses, and plan credit card debt payoff strategies.

## Features

- User authentication and account management
- Add and manage multiple credit cards
- Track daily expenses with categorization (cash/credit card)
- Calculate debt payoff schedules using avalanche or snowball methods
- Track payment history and progress
- Monthly and weekly expense tracking
- Total payments tracking per credit card
- Visualize debt reduction over time
- Secure API backend with FastAPI
- Responsive frontend with Next.js and Tailwind CSS

## Tech Stack

### Backend
- Python 3.13+
- FastAPI
- SQLAlchemy ORM
- JWT Authentication
- SQLite Database

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Axios for API calls

## Getting Started

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Setup Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database
python3 -m app.init_db

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Setup Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features in Detail

### Expense Tracking
- Add expenses with description, amount, and date
- Categorize expenses as cash or credit card
- View monthly and weekly expense totals
- Track current balance

### Credit Card Management
- Add multiple credit cards with balances and interest rates
- Track total payments per card
- View payment history with running totals
- Delete credit cards and associated expenses

### Payment Planning
- Choose between avalanche or snowball payoff methods
- Calculate optimal payment schedule
- Track payment progress
- Visualize debt reduction over time

## Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Secure session management
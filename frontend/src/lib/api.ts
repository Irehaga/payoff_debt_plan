// src/lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { CreditCard, DebtPayoffResponse, Expense, Payment } from './types';

type PaymentStrategy = 'avalanche' | 'snowball';

const API_URL = 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if it exists
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth methods
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      const response = await this.client.post('/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // Get user data after successful login
      const userData = await this.getCurrentUser();
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  }

  async register(email: string, password: string) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Make the registration request
      const response = await this.client.post('/register', {
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (response.status === 200) {
        // After successful registration, log the user in
        const loginResult = await this.login(email, password);
        return loginResult;
      }

      return { success: false, error: response.data.detail || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          error: error.response.data.detail || 'Registration failed. Please check your input.' 
        };
      }
      return { success: false, error };
    }
  }

  async logout() {
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // Debt calculation
  async calculatePayoff(
    creditCards: CreditCard[], 
    strategy: PaymentStrategy, 
    monthlyPayment: number
  ): Promise<DebtPayoffResponse> {
    try {
      // Convert numbers to strings for proper Decimal handling
      const formattedCards = creditCards.map(card => ({
        id: card.id?.toString() || undefined,
        name: card.name,
        balance: card.balance.toString(),
        interest_rate: card.interest_rate.toString(),
        min_payment: card.min_payment.toString()
      }));

      const response = await this.client.post<DebtPayoffResponse>('/debt/calculate', {
        credit_cards: formattedCards,
        strategy,
        monthly_payment: monthlyPayment.toString()
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating payoff:', error);
      throw error;
    }
  }

  // Credit card methods
  async getUserCards() {
    const response = await this.client.get('/debt/cards');
    return response.data;
  }

  async addCreditCard(card: Omit<CreditCard, 'id'>) {
    const response = await this.client.post('/debt/cards', null, {
      params: {
        name: card.name,
        balance: card.balance,
        interest_rate: card.interest_rate,
        min_payment: card.min_payment
      }
    });
    return response.data;
  }

  async deleteCreditCard(id: number) {
    const response = await this.client.delete(`/debt/cards/${id}`);
    return response.data;
  }

  // Payment methods
  async addPayment(payment: {
    amount: number;
    credit_card_id: number;
    interest_portion: number;
    principal_portion: number;
  }) {
    const response = await this.client.post('/payments', payment);
    return response.data;
  }

  async getUserPayments() {
    const response = await this.client.get('/payments');
    // Convert Decimal values to numbers
    return response.data.map((payment: any) => ({
      ...payment,
      amount: Number(payment.amount),
      interest_portion: Number(payment.interest_portion),
      principal_portion: Number(payment.principal_portion)
    }));
  }

  async getCardPayments(cardId: number) {
    const response = await this.client.get(`/payments/cards/${cardId}`);
    return response.data;
  }

  async deletePayment(paymentId: number): Promise<void> {
    await this.client.delete(`/payments/${paymentId}`);
  }

  // Expense methods
  async getUserExpenses() {
    const response = await this.client.get('/expenses');
    return response.data;
  }

  async addExpense(expense: {
    description: string;
    amount: number;
    date: string;
    credit_card_id?: number;
    balance_type: string;
  }) {
    const formattedExpense = {
      ...expense,
      date: new Date(expense.date).toISOString()
    };
    const response = await this.client.post('/expenses/expenses', formattedExpense);
    return response.data;
  }

  async deleteExpense(id: number) {
    try {
      const response = await this.client.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  }

  async setInitialBalance(balance: number) {
    const response = await this.client.post('/expenses/balance', null, {
      params: { balance }
    });
    return response.data;
  }

  async createExpense(expense: {
    description: string;
    amount: number;
    date: string;
    credit_card_id?: number;
    balance_type: string;
  }) {
    const response = await this.client.post('/expenses', expense);
    return response.data;
  }
}

// Export as singleton
const api = new ApiClient();
export default api;
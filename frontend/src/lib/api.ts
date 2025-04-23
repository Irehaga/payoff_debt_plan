// src/lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { CreditCard, PaymentStrategy, DebtPayoffResponse, Payment } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if user is logged in
    this.client.interceptors.request.use(
      (config) => {
        // Skip auth for login/register endpoints
        if (config.url?.includes('/token') || config.url?.includes('/register')) {
          return config;
        }
        
        // Add token from localStorage if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.client.post('/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { access_token } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', access_token);
    
    return response.data;
  }

  async register(email: string, password: string) {
    const response = await this.client.post('/register', {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
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
      const response = await this.client.post<DebtPayoffResponse>('/debt/calculate', {
        credit_cards: creditCards,
        strategy,
        monthly_payment: monthlyPayment,
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
    const response = await this.client.post('/debt/cards', card);
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
}

// Export as singleton
const api = new ApiClient();
export default api;
// src/lib/types.ts
export interface CreditCard {
  id?: number;
  name: string;
  balance: number;
  interest_rate: number;
  min_payment: number;
}

export type PaymentStrategy = 'avalanche' | 'snowball';

export interface CardPayment {
  card_id: string;
  card_name: string;
  payment: number;
  interest_paid: number;
  remaining_balance: number;
}

export interface PaymentStep {
  month: number;
  card_payments: CardPayment[];
  total_payment: number;
  remaining_debt: number;
}

export interface DebtPayoffResponse {
  total_months: number;
  total_interest: number;
  total_payment: number;
  monthly_breakdown: Array<{
    month: number;
    payments: Array<{
      card_id: number;
      payment: number;
      interest: number;
      principal: number;
      new_balance: number;
    }>;
  }>;
}

export interface User {
  id: string | number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  date: string;
  credit_card_id?: number;
  balance_type: string;
}

export interface Payment {
  id: number;
  amount: number;
  credit_card_id: number;
  interest_portion: number;
  principal_portion: number;
  date: string;
}
// src/lib/types.ts
export interface CreditCard {
  id: number;
  name: string;
  balance: number;
  interest_rate: number;
  min_payment: number;
}

export type PaymentStrategy = 'avalanche' | 'snowball';

export interface CardPayment {
  card_id: number;
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
  total_interest_paid: number;
  total_amount_paid: number;
  monthly_breakdown: PaymentStep[];
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
  credit_card?: CreditCard;
  balance_type: 'cash' | 'credit_card';
}

export interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  credit_card_id: number;
  interest_portion: number;
  principal_portion: number;
  user_id: number;
}
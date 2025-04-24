import { useState } from 'react';
import { CreditCard, PaymentStrategy, DebtPayoffResponse } from '@/lib/types';
import api from '@/lib/api';

export default function useDebts() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [strategy, setStrategy] = useState<PaymentStrategy>('avalanche');
  const [monthlyPayment, setMonthlyPayment] = useState<number | ''>('');
  const [payoffPlan, setPayoffPlan] = useState<DebtPayoffResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new credit card
  const addCreditCard = async (card: Omit<CreditCard, 'id'>) => {
    try {
      const result = await api.addCreditCard(card);
      setCreditCards([...creditCards, result]);
    } catch (error) {
      console.error('Error adding credit card:', error);
      setError('Failed to add credit card');
    }
  };

  // Remove a credit card
  const removeCreditCard = async (id: number) => {
    try {
      await api.deleteCreditCard(id);
      setCreditCards(creditCards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error removing credit card:', error);
      setError('Failed to remove credit card');
    }
  };

  // Calculate total minimum payment
  const totalMinPayment = creditCards.reduce(
    (sum, card) => sum + card.min_payment, 
    0
  );

  // Calculate payoff plan
  const calculatePayoffPlan = async () => {
    if (creditCards.length === 0) {
      setError('Please add at least one credit card');
      return;
    }
    
    if (typeof monthlyPayment !== 'number' || monthlyPayment < totalMinPayment) {
      setError(`Monthly payment must be at least $${totalMinPayment.toFixed(2)}`);
      return;
    }
    
    setError(null);
    setIsCalculating(true);
    
    try {
      const result = await api.calculatePayoff(
        creditCards,
        strategy,
        monthlyPayment
      );
      setPayoffPlan(result);
    } catch (err) {
      console.error('Error calculating payoff plan:', err);
      setError('Error calculating payoff plan. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    creditCards,
    strategy,
    monthlyPayment,
    payoffPlan,
    isCalculating,
    error,
    addCreditCard,
    removeCreditCard,
    setStrategy,
    setMonthlyPayment,
    calculatePayoffPlan,
    totalMinPayment,
    setError,
  };
}
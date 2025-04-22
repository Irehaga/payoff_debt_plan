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
  const addCreditCard = (card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(),
    };
    setCreditCards([...creditCards, newCard]);
  };

  // Remove a credit card
  const removeCreditCard = (id: string) => {
    setCreditCards(creditCards.filter(card => card.id !== id));
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
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreditCardForm from '@/components/CreditCardForm';
import PayoffStrategy from '@/components/PayoffStrategy';
import SummaryStats from '@/components/SummaryStats';
import CreditCardList from '@/components/CreditCardList';
import PaymentSchedule from '@/components/PaymentSchedule';
import BalanceChart from '@/components/BalanceChart';
import ProgressDashboard from '@/components/ProgressDashboard';
import api from '@/lib/api';
import { CreditCard, PaymentStrategy, DebtPayoffResponse } from '@/lib/types';

export default function DashboardPage() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [strategy, setStrategy] = useState<PaymentStrategy>('avalanche');
  const [monthlyPayment, setMonthlyPayment] = useState<number | ''>('');
  const [payoffPlan, setPayoffPlan] = useState<DebtPayoffResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's credit cards on component mount
  useEffect(() => {
    async function fetchCards() {
      try {
        const cards = await api.getUserCards();
        setCreditCards(cards);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Failed to load your credit cards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, []);

  // Add a new credit card
  const handleAddCard = async (card: Omit<CreditCard, 'id'>) => {
    try {
      const newCard = await api.addCreditCard(card);
      setCreditCards(prevCards => [...prevCards, newCard]);
    } catch (err) {
      console.error('Error adding card:', err);
      setError('Failed to add credit card');
    }
  };

  // Remove a credit card
  const handleRemoveCard = async (id: string | number) => {
    try {
      await api.deleteCreditCard(id);
      // Update the state using the previous state to ensure we have the latest data
      setCreditCards(prevCards => prevCards.filter(card => card.id !== id));
      // Clear payoff plan since it's no longer valid
      setPayoffPlan(null);
      setError(null);
    } catch (err) {
      console.error('Error removing card:', err);
      setError('Failed to remove credit card. Please try again.');
    }
  };

  // Calculate total minimum payment
  const totalMinPayment = creditCards.reduce((sum, card) => sum + card.min_payment, 0);

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

  return (
    <ProtectedRoute>
      <Layout>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-xl">Loading your credit cards...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="mb-8">
                <ProgressDashboard />
                <CreditCardForm onAddCard={handleAddCard} />
                <CreditCardList 
                  creditCards={creditCards} 
                  onRemoveCard={handleRemoveCard} 
                />
                <PayoffStrategy
                  strategy={strategy}
                  onStrategyChange={setStrategy}
                  monthlyPayment={monthlyPayment}
                  onMonthlyPaymentChange={setMonthlyPayment}
                  minPayment={totalMinPayment}
                  onCalculate={calculatePayoffPlan}
                  isCalculating={isCalculating}
                />
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              {payoffPlan ? (
                <>
                  <SummaryStats payoffPlan={payoffPlan} />
                  <BalanceChart payoffPlan={payoffPlan} />
                  <PaymentSchedule payoffPlan={payoffPlan} />
                </>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h3 className="text-lg font-medium text-blue-800">
                    {creditCards.length > 0 
                      ? "Ready to calculate your payoff plan?" 
                      : "Getting Started"}
                  </h3>
                  <p className="mt-2 text-blue-700">
                    {creditCards.length > 0
                      ? "Set your strategy and monthly payment, then calculate your payoff plan."
                      : "Add your credit card information to get started with your debt payoff journey."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
            

// src/app/page.tsx
'use client';

import React from 'react';
import Layout from '@/components/Layout';
import CreditCardForm from '@/components/CreditCardForm';
import PayoffStrategy from '@/components/PayoffStrategy';
import SummaryStats from '@/components/SummaryStats';
import CreditCardList from '@/components/CreditCardList';
import PaymentSchedule from '@/components/PaymentSchedule';
import BalanceChart from '@/components/BalanceChart';
import InfoPanel from '@/components/InfoPanel';
import useDebts from '@/hooks/useDebts';

export default function HomePage() {
  const {
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
  } = useDebts();

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CreditCardForm onAddCard={addCreditCard} />
          
          <CreditCardList 
            creditCards={creditCards} 
            onRemoveCard={removeCreditCard} 
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
        
        <div className="space-y-6">
          {payoffPlan ? (
            <>
              <SummaryStats payoffPlan={payoffPlan} />
              <BalanceChart payoffPlan={payoffPlan} />
              <PaymentSchedule payoffPlan={payoffPlan} />
            </>
          ) : (
            <InfoPanel hasCards={creditCards.length > 0} />
          )}
        </div>
      </div>
    </Layout>
  );
}
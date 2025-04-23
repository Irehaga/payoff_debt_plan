// src/components/ProgressDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Payment, CreditCard } from '@/lib/types';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProgressDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's payments and cards on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentsData, cardsData] = await Promise.all([
          api.getUserPayments(),
          api.getUserCards()
        ]);
        setPayments(paymentsData);
        setCards(cardsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your progress data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate total balance, total paid, and total interest paid
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestPaid = payments.reduce((sum, payment) => sum + payment.interest_portion, 0);
  const totalPrincipalPaid = payments.reduce((sum, payment) => sum + payment.principal_portion, 0);

  // Prepare chart data - group payments by month for progress over time
  const chartData = React.useMemo(() => {
    if (!payments.length) return [];

    // Sort payments by date
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
    
    // Group by month and calculate running totals
    const monthlyData: Record<string, {
      month: string;
      totalPaid: number;
      principalPaid: number;
      interestPaid: number;
    }> = {};
    
    let runningTotalPaid = 0;
    let runningPrincipalPaid = 0;
    let runningInterestPaid = 0;
    
    sortedPayments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      runningTotalPaid += payment.amount;
      runningPrincipalPaid += payment.principal_portion;
      runningInterestPaid += payment.interest_portion;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
          totalPaid: runningTotalPaid,
          principalPaid: runningPrincipalPaid,
          interestPaid: runningInterestPaid
        };
      } else {
        monthlyData[monthYear] = {
          ...monthlyData[monthYear],
          totalPaid: runningTotalPaid,
          principalPaid: runningPrincipalPaid,
          interestPaid: runningInterestPaid
        };
      }
    });
    
    return Object.values(monthlyData);
  }, [payments]);

  if (isLoading) {
    return <div className="text-center py-4">Loading your progress data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h3 className="text-lg font-medium text-yellow-800">No payment history yet</h3>
        <p className="mt-2 text-yellow-700">
          Start making payments toward your debt to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Your Debt Payoff Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Current Balance</h3>
          <p className="text-2xl font-bold text-gray-800">${totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-blue-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Principal Paid</h3>
          <p className="text-2xl font-bold text-green-600">${totalPrincipalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Interest Paid</h3>
          <p className="text-2xl font-bold text-red-600">${totalInterestPaid.toFixed(2)}</p>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-700 mb-4">Progress Over Time</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalPaid" 
              stroke="#3b82f6" 
              name="Total Paid" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="principalPaid" 
              stroke="#10b981" 
              name="Principal Paid" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="interestPaid" 
              stroke="#ef4444" 
              name="Interest Paid" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
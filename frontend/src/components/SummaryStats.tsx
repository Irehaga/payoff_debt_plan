'use client';

import React from 'react';
import { DebtPayoffResponse } from '@/lib/types';

interface SummaryStatsProps {
  payoffPlan: DebtPayoffResponse;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ payoffPlan }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Payoff Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Time to Debt Free</h3>
          <p className="text-2xl font-bold text-blue-600">
            {payoffPlan.total_months} {payoffPlan.total_months === 1 ? 'month' : 'months'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Total Interest</h3>
          <p className="text-2xl font-bold text-red-600">
            ${payoffPlan.total_interest_paid.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm text-gray-500 mb-1">Total Amount Paid</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${payoffPlan.total_amount_paid.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium text-gray-700 mb-2">Payoff Date</h3>
        <p className="text-lg">
          {new Date(Date.now() + payoffPlan.total_months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Money Saved</h3>
        <p className="text-lg">
          By using this strategy, you&apos;ll pay off your debt in {payoffPlan.total_months} months and save on interest!
        </p>
      </div>
    </div>
  );
};

export default SummaryStats;
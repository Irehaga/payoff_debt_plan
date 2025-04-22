'use client';

import React from 'react';
import { PaymentStrategy } from '@/lib/types';

interface PayoffStrategyProps {
  strategy: PaymentStrategy;
  onStrategyChange: (strategy: PaymentStrategy) => void;
  monthlyPayment: number | '';
  onMonthlyPaymentChange: (amount: number | '') => void;
  minPayment: number;
  onCalculate: () => void;
  isCalculating: boolean;
}

const PayoffStrategy: React.FC<PayoffStrategyProps> = ({
  strategy,
  onStrategyChange,
  monthlyPayment,
  onMonthlyPaymentChange,
  minPayment,
  onCalculate,
  isCalculating
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Payoff Strategy</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Strategy
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-start">
            <input
              id="avalanche"
              name="strategy"
              type="radio"
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300"
              checked={strategy === 'avalanche'}
              onChange={() => onStrategyChange('avalanche')}
            />
            <label htmlFor="avalanche" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">Avalanche Method</span>
              <p className="text-gray-500 text-xs mt-1">
                Pay minimum on all cards, then put extra money toward the card with the highest interest rate.
                This saves the most money in interest.
              </p>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="snowball"
              name="strategy"
              type="radio"
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300"
              checked={strategy === 'snowball'}
              onChange={() => onStrategyChange('snowball')}
            />
            <label htmlFor="snowball" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">Snowball Method</span>
              <p className="text-gray-500 text-xs mt-1">
                Pay minimum on all cards, then put extra money toward the card with the lowest balance.
                This provides psychological wins as you eliminate cards faster.
              </p>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Payment Budget ($)
          {minPayment > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              (Min: ${minPayment.toFixed(2)})
            </span>
          )}
        </label>
        <input
          type="number"
          id="monthlyPayment"
          min={minPayment}
          step="0.01"
          value={monthlyPayment || ''}
          onChange={(e) => onMonthlyPaymentChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`${minPayment.toFixed(2)} or more`}
          required
        />
      </div>
      
      <button
        onClick={onCalculate}
        disabled={isCalculating || typeof monthlyPayment !== 'number' || monthlyPayment < minPayment}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Payoff Plan'}
      </button>
    </div>
  );
};

export default PayoffStrategy;
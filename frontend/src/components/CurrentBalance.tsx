'use client';

import React from 'react';

interface CurrentBalanceProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
}

export default function CurrentBalance({ balance, onBalanceChange }: CurrentBalanceProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Current Balance</h2>
      </div>
      
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-800">${balance.toFixed(2)}</p>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface CurrentBalanceProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
}

export default function CurrentBalance({ balance, onBalanceChange }: CurrentBalanceProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteBalance = async () => {
    if (!confirm('Are you sure you want to delete your current balance? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteBalance();
      onBalanceChange(0);
    } catch (err) {
      console.error('Error deleting balance:', err);
      setError('Failed to delete balance. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Current Balance</h2>
        {balance > 0 && (
          <button
            onClick={handleDeleteBalance}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Balance'}
          </button>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-800">${balance.toFixed(2)}</p>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
} 
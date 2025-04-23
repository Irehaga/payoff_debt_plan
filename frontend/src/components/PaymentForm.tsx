'use client';

import { useState } from 'react';
import { CreditCard } from '@/lib/types';
import api from '@/lib/api';

interface PaymentFormProps {
  cards: CreditCard[];
  onPaymentAdded: () => void;
}

export default function PaymentForm({ cards, onPaymentAdded }: PaymentFormProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [interestPortion, setInterestPortion] = useState<number | ''>('');
  const [principalPortion, setPrincipalPortion] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (value: number | '') => {
    setAmount(value);
    
    // If we have interest portion, automatically calculate principal
    if (typeof interestPortion === 'number' && typeof value === 'number') {
      setPrincipalPortion(Math.max(0, value - interestPortion));
    }
  };

  const handleInterestChange = (value: number | '') => {
    setInterestPortion(value);
    
    // If we have total amount, automatically calculate principal
    if (typeof amount === 'number' && typeof value === 'number') {
      setPrincipalPortion(Math.max(0, amount - value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCardId === '' || amount === '' || interestPortion === '' || principalPortion === '') {
      setError('Please fill out all fields');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await api.addPayment({
        credit_card_id: selectedCardId as number,
        amount: amount as number,
        interest_portion: interestPortion as number,
        principal_portion: principalPortion as number
      });
      
      // Reset form
      setSelectedCardId('');
      setAmount('');
      setInterestPortion('');
      setPrincipalPortion('');
      
      // Notify parent component
      onPaymentAdded();
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="card" className="block text-sm font-medium text-gray-700 mb-1">
            Credit Card
          </label>
          <select
            id="card"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select a card</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} (Balance: ${card.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value ? parseFloat(e.target.value) : '')}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
            Interest Portion ($)
          </label>
          <input
            type="number"
            id="interest"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={interestPortion}
            onChange={(e) => handleInterestChange(e.target.value ? parseFloat(e.target.value) : '')}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
            Principal Portion ($)
          </label>
          <input
            type="number"
            id="principal"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={principalPortion}
            onChange={(e) => setPrincipalPortion(e.target.value ? parseFloat(e.target.value) : '')}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The principal portion will reduce your card balance.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Adding Payment...' : 'Add Payment'}
        </button>
      </form>
    </div>
  );
}
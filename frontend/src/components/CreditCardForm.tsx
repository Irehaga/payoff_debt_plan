'use client';

import React, { useState } from 'react';
import { CreditCard } from '@/lib/types';

interface CreditCardFormProps {
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onAddCard }) => {
  const [cardData, setCardData] = useState<Omit<CreditCard, 'id'>>({
    name: '',
    balance: 0,
    interest_rate: 0,
    min_payment: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: name === 'name' ? value : parseFloat(value) || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardData.name || cardData.balance <= 0 || cardData.interest_rate <= 0 || cardData.min_payment <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }
    
    onAddCard(cardData);
    
    // Reset form
    setCardData({
      name: '',
      balance: 0,
      interest_rate: 0,
      min_payment: 0,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Credit Card</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Card Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="name"
            name="name"
            value={cardData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Visa Gold"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
            Current Balance ($)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="balance"
            name="balance"
            min="0.01"
            step="0.01"
            value={cardData.balance || ''}
            onChange={handleChange}
            required
            placeholder="5000.00"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="interest_rate"
            name="interest_rate"
            min="0.01"
            step="0.01"
            value={cardData.interest_rate || ''}
            onChange={handleChange}
            required
            placeholder="18.99"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="min_payment" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Payment ($)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="min_payment"
            name="min_payment"
            min="0.01"
            step="0.01"
            value={cardData.min_payment || ''}
            onChange={handleChange}
            required
            placeholder="35.00"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          Add Card
        </button>
      </form>
    </div>
  );
};

export default CreditCardForm;
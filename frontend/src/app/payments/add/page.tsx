// src/app/payments/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentForm from '@/components/PaymentForm';
import api from '@/lib/api';
import { CreditCard } from '@/lib/types';

export default function AddPaymentPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user's cards on component mount
  useEffect(() => {
    async function fetchCards() {
      try {
        const cardsData = await api.getUserCards();
        setCards(cardsData);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Failed to load your credit cards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, []);

  const handlePaymentAdded = () => {
    // Redirect to payments history page
    router.push('/payments');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Add Payment</h1>
          
          {isLoading ? (
            <div className="text-center py-8">Loading your credit cards...</div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="text-lg font-medium text-yellow-800">No credit cards found</h3>
              <p className="mt-2 text-yellow-700">
                Please add at least one credit card before adding payments.
              </p>
            </div>
          ) : (
            <PaymentForm cards={cards} onPaymentAdded={handlePaymentAdded} />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
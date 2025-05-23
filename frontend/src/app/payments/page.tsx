'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Payment, CreditCard } from '@/lib/types';
import { Trash2 } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [cardTotals, setCardTotals] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a mapping of card IDs to names for easier display
  const cardMap = cards.reduce((map, card) => {
    map[card.id as number] = card.name;
    return map;
  }, {} as Record<number, string>);

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
        
        // Calculate total payments per card
        const totals = paymentsData.reduce((acc: Record<number, number>, payment: Payment) => {
          const cardId = payment.credit_card_id;
          acc[cardId] = (acc[cardId] || 0) + payment.amount;
          return acc;
        }, {});
        setCardTotals(totals);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your payment history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeletePayment = async (paymentId: number) => {
    try {
      await api.deletePayment(paymentId);
      // Refresh payments after deletion
      const updatedPayments = await api.getUserPayments();
      setPayments(updatedPayments);
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Payment History</h1>
          
          {isLoading ? (
            <div className="text-center py-8">Loading your payment history...</div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="text-lg font-medium text-yellow-800">No payments yet</h3>
              <p className="mt-2 text-yellow-700">
                Start making payments toward your credit cards to track your progress here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Payment History</h2>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {cardMap[payment.credit_card_id] || `Card #${payment.credit_card_id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <div className="text-sm text-gray-500">
                          <p>Principal: ${payment.principal_portion.toFixed(2)}</p>
                          <p>Interest: ${payment.interest_portion.toFixed(2)}</p>
                          <p>Total paid: ${cardTotals[payment.credit_card_id]?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(payment.id!)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
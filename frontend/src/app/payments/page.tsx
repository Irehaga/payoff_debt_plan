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
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cardMap[payment.credit_card_id] || `Card #${payment.credit_card_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.principal_portion.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.interest_portion.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
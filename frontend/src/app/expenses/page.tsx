'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface Expense {
  id?: number;
  description: string;
  amount: string | number;
  date: string;
  credit_card_id?: number;
  credit_card?: {
    id: number;
    name: string;
    balance: number;
    interest_rate: number;
    min_payment: number;
  };
  balance_type: string;
}

interface CreditCard {
  id: number;
  name: string;
  balance: number;
  interest_rate: number;
  min_payment: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    credit_card_id: undefined as number | undefined,
    balance_type: 'cash'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceUpdate, setBalanceUpdate] = useState<{
    amount: string;
    type: 'add' | 'subtract';
  }>({
    amount: '',
    type: 'add'
  });

  const fetchExpenses = async () => {
    try {
      const response = await api.getUserExpenses();
      setExpenses(response.expenses);
      setCurrentBalance(Number(response.currentBalance));
      calculateTotals(response.expenses);
      
      // Fetch total payments
      const payments = await api.getUserPayments();
      const totalPaid = payments.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0);
      setTotalPayments(totalPaid);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditCards = async () => {
    try {
      const cards = await api.getUserCards();
      setCreditCards(cards);
    } catch (err) {
      console.error('Failed to fetch credit cards:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCreditCards();
  }, [fetchExpenses, fetchCreditCards]);

  const calculateTotals = (expenses: Expense[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth;
    });

    const weeklyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfWeek;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => 
      sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);
    
    const weeklyTotal = weeklyExpenses.reduce((sum, expense) => 
      sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);

    setMonthlyTotal(monthlyTotal);
    setWeeklyTotal(weeklyTotal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.addExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount as string) || 0,
        date: new Date(newExpense.date).toISOString(),
        credit_card_id: newExpense.balance_type === 'credit_card' ? newExpense.credit_card_id : undefined,
        balance_type: newExpense.balance_type
      });
      
      // Update the credit cards list with the new balance
      if (response.updatedCard) {
        setCreditCards(prevCards => 
          prevCards.map(card => 
            card.id === response.updatedCard.id ? response.updatedCard : card
          )
        );
      }
      
      setNewExpense({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        credit_card_id: undefined,
        balance_type: 'cash'
      });
      setCurrentBalance(response.currentBalance);
      fetchExpenses();
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const response = await api.deleteExpense(id);
      if (response.message === "Expense deleted successfully") {
        setCurrentBalance(response.currentBalance);
        // Update the credit cards list with the new balance if a card was updated
        if (response.updatedCard) {
          setCreditCards(prevCards => 
            prevCards.map(card => 
              card.id === response.updatedCard.id ? response.updatedCard : card
            )
          );
        }
        fetchExpenses();
      } else {
        setError('Failed to delete expense: Unexpected response');
      }
    } catch (err) {
      setError('Failed to delete expense: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Delete error:', err);
    }
  };

  const handleBalanceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(balanceUpdate.amount) || 0;
      const newBalance = balanceUpdate.type === 'add' 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      await api.setInitialBalance(newBalance);
      setCurrentBalance(newBalance);
      setBalanceUpdate({ amount: '', type: 'add' });
      setError(null);
    } catch (err) {
      setError('Failed to update balance');
      console.error(err);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Update Balance</h2>
            <form onSubmit={handleBalanceUpdate} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balanceUpdate.amount}
                    onChange={(e) => setBalanceUpdate({ ...balanceUpdate, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    required
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="balanceType"
                      checked={balanceUpdate.type === 'add'}
                      onChange={() => setBalanceUpdate({ ...balanceUpdate, type: 'add' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="balanceType"
                      checked={balanceUpdate.type === 'subtract'}
                      onChange={() => setBalanceUpdate({ ...balanceUpdate, type: 'subtract' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Subtract</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Balance
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Current Balance</h2>
            <p className="text-3xl font-semibold text-gray-800">
              ${(currentBalance || 0).toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Monthly Expenses</h2>
              <p className="text-2xl font-semibold text-red-600">
                ${monthlyTotal.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total expenses for {new Date().toLocaleString('default', { month: 'long' })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Weekly Expenses</h2>
              <p className="text-2xl font-semibold text-red-600">
                ${weeklyTotal.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total expenses for this week
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Total Payments</h2>
              <p className="text-2xl font-semibold text-green-600">
                ${totalPayments.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total paid to credit cards
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance Type
                  </label>
                  <select
                    value={newExpense.balance_type}
                    onChange={(e) => setNewExpense({ ...newExpense, balance_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
                {newExpense.balance_type === 'credit_card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credit Card</label>
                    <select
                      value={newExpense.credit_card_id}
                      onChange={(e) => setNewExpense({ ...newExpense, credit_card_id: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                      required
                    >
                      <option value="">Select a card</option>
                      {creditCards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name} (${card.balance.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Expense
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
            {isLoading ? (
              <p>Loading expenses...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : expenses.length === 0 ? (
              <p>No expenses recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Card</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${typeof expense.amount === 'number' ? expense.amount.toFixed(2) : parseFloat(expense.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.credit_card ? 
                            `${expense.credit_card.name} ($${expense.credit_card.balance.toFixed(2)})`
                            : 'No Card'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteExpense(expense.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 
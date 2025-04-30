'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '@/lib/api';
import { Expense } from '@/lib/types';

export default function ExpenseAnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await api.getUserExpenses();
        setExpenses(response.expenses);
      } catch (err) {
        setError('Failed to load expenses');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenses();
  }, []);

  // Calculate weekly data for the past 52 weeks
  const weeklyData = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Create array of weeks
    const weeks: { start: Date; end: Date }[] = [];
    let currentWeekStart = new Date(oneYearAgo);
    
    while (currentWeekStart <= now) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(weekEnd)
      });
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks.map(week => {
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= week.start && expenseDate <= week.end;
      });

      const total = weekExpenses.reduce((sum, expense) => 
        sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);

      return {
        date: `${week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${week.end.toLocaleDateString('en-US', { day: 'numeric' })}`,
        total
      };
    });
  }, [expenses]);

  // Calculate monthly data for the past 12 months
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: number; year: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }

    return months.map(({ month, year }) => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      });

      const total = monthExpenses.reduce((sum, expense) => 
        sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);

      return {
        date: new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        total
      };
    });
  }, [expenses]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">Expense Analytics</h1>

          {/* Monthly Spending Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Monthly Spending (Past Year)</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Spent']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    fill="#3b82f6" 
                    name="Monthly Spending"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Spending Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Weekly Spending (Past Year)</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={3}  // Show every 4th label to prevent overcrowding
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Spent']}
                    labelFormatter={(label) => `Week: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    name="Weekly Spending"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Average Monthly Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(monthlyData.reduce((sum, month) => sum + month.total, 0) / monthlyData.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Average Weekly Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(weeklyData.reduce((sum, week) => sum + week.total, 0) / weeklyData.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Total Year Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${monthlyData.reduce((sum, month) => sum + month.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 
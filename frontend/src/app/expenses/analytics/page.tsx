'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ReferenceLine } from 'recharts';
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

  // Calculate weekly data for the current year
  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === now.getFullYear();
    });

    if (currentYearExpenses.length === 0) {
      return [];
    }

    const earliestExpenseDate = new Date(Math.min(
      ...currentYearExpenses.map(expense => new Date(expense.date).getTime())
    ));

    const weeks: { start: Date; end: Date }[] = [];
    let currentWeekStart = new Date(earliestExpenseDate);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
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
      const weekExpenses = currentYearExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= week.start && expenseDate <= week.end;
      });

      const total = weekExpenses.reduce((sum, expense) => 
        sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);

      // Format the date range
      const startStr = week.start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      const endStr = week.end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });

      return {
        date: `${startStr} - ${endStr}`, // Now shows start and end dates
        total
      };
    }).filter(week => week.total > 0);
  }, [expenses]);

  // Calculate monthly data for the current year
  const monthlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months: { month: number; year: number }[] = [];
    
    // Create array for all months in current year up to current month
    for (let month = 0; month <= now.getMonth(); month++) {
      months.push({ month, year: currentYear });
    }

    return months.map(({ month, year }) => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      });

      const total = monthExpenses.reduce((sum, expense) => 
        sum + (typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount)), 0);

      return {
        date: new Date(year, month).toLocaleDateString('en-US', { month: 'long' }),
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
          <h1 className="text-3xl font-bold mb-8">Expense Analytics {new Date().getFullYear()}</h1>

          {/* Monthly Spending Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Monthly Spending</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Spent']}
                    labelFormatter={(label) => label}
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
            <h2 className="text-2xl font-bold mb-6">Weekly Spending</h2>
            {weeklyData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
                  >
                    {/* Add a light background */}
                    <defs>
                      <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f1f5f9" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    
                    {/* Background rectangle */}
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#chartBackground)" />
                    
                    {/* Make grid more visible */}
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#cbd5e1" 
                      opacity={0.8}
                      vertical={true}
                      horizontal={true}
                    />
                    
                    <XAxis 
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      padding={{ left: 50, right: 50 }}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      stroke="#94a3b8"
                      axisLine={true}
                      tickLine={true}
                    />
                    
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Spent']}
                      labelFormatter={(label) => `Week of ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    
                    <Line 
                      type="linear"
                      dataKey="total" 
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        fill: '#ffffff',
                        r: 4
                      }}
                      activeDot={{
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        fill: '#3b82f6',
                        r: 6
                      }}
                      name="Weekly Spending"
                    />
                    
                    {/* Add a reference line for zero */}
                    <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No weekly spending data available for {new Date().getFullYear()}
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Average Monthly Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(() => {
                  const monthsWithExpenses = monthlyData.filter(month => month.total > 0);
                  if (monthsWithExpenses.length === 0) return '0.00';
                  return (monthsWithExpenses.reduce((sum, month) => sum + month.total, 0) / 
                    monthsWithExpenses.length).toFixed(2);
                })()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Average for {new Date().getFullYear()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Average Weekly Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(() => {
                  const weeksWithExpenses = weeklyData.filter(week => week.total > 0);
                  if (weeksWithExpenses.length === 0) return '0.00';
                  return (weeksWithExpenses.reduce((sum, week) => sum + week.total, 0) / 
                    weeksWithExpenses.length).toFixed(2);
                })()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Average for {new Date().getFullYear()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Total Year Spending</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${monthlyData.reduce((sum, month) => sum + month.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total for {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 
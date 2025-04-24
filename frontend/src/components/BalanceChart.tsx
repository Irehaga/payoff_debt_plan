'use client';

import React from 'react';
import { DebtPayoffResponse } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  payoffPlan: DebtPayoffResponse;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ payoffPlan }) => {
  // Prepare chart data
  const chartData = payoffPlan.monthly_breakdown.map(month => ({
    month: month.month,
    balance: month.payments.reduce((total, payment) => total + payment.new_balance, 0),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Balance Over Time</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Balance']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;
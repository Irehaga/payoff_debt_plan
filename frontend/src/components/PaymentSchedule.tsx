'use client';

import React from 'react';
import { DebtPayoffResponse } from '@/lib/types';

interface PaymentScheduleProps {
  payoffPlan: DebtPayoffResponse;
}

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ payoffPlan }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Payment Schedule</h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payoffPlan.monthly_breakdown.map(step => (
              <tr key={step.month}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {step.month}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  ${(step.total_payment || 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  ${(step.remaining_debt || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentSchedule;
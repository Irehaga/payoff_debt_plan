// src/components/InfoPanel.tsx
'use client';

import React from 'react';

interface InfoPanelProps {
  hasCards: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ hasCards }) => {
  if (hasCards) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <h3 className="text-lg font-medium text-blue-800">Ready to calculate your payoff plan?</h3>
        <p className="mt-2 text-blue-700">
          Add your credit card information, select a strategy, set your monthly payment, and click "Calculate Payoff Plan" to see how quickly you can become debt-free.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
      <h3 className="text-lg font-medium text-blue-800">Getting Started</h3>
      <p className="mt-2 text-blue-700">
        Add your credit card information on the left to get started. You can add multiple cards to see how different strategies compare.
      </p>
      <div className="mt-4">
        <h4 className="font-medium text-blue-800">About the strategies:</h4>
        <ul className="mt-2 text-blue-700 list-disc list-inside">
          <li><strong>Avalanche Method:</strong> Saves the most money by paying off highest interest rate cards first</li>
          <li><strong>Snowball Method:</strong> Builds momentum by paying off smallest balances first</li>
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
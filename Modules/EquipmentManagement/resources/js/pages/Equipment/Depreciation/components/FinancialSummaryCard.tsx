import React from 'react';

const FinancialSummaryCard = ({ summary }: { summary: any }) => (
  <div className="p-4 border rounded bg-white">
    <h2 className="font-bold mb-2">Financial Summary</h2>
    <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(summary, null, 2)}</pre>
  </div>
);

export default FinancialSummaryCard;

import React from 'react';

const ReplacementNeedsTable = ({ replacementNeeds, formatCurrency }: { replacementNeeds: any[]; formatCurrency: (n: number) => string }) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr>
        <th className="text-left">Equipment</th>
        <th className="text-left">Value</th>
      </tr>
    </thead>
    <tbody>
      {replacementNeeds?.map((item, idx) => (
        <tr key={idx}>
          <td>{item.name}</td>
          <td>{formatCurrency(item.value)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ReplacementNeedsTable;

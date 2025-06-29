import React from 'react';

// Mock payroll data
const payrolls = [
  { id: 1, employee: 'John Doe', period: 'May 2025', amount: 3500, status: 'Paid' },
  { id: 2, employee: 'Jane Smith', period: 'May 2025', amount: 4200, status: 'Pending' },
  { id: 3, employee: 'Ali Hassan', period: 'May 2025', amount: 3900, status: 'Paid' },
];

const PayrollList: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Payroll List</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Employee</th>
            <th className="px-4 py-2 border">Period</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll) => (
            <tr key={payroll.id}>
              <td className="px-4 py-2 border">{payroll.employee}</td>
              <td className="px-4 py-2 border">{payroll.period}</td>
              <td className="px-4 py-2 border">${payroll.amount}</td>
              <td className="px-4 py-2 border">{payroll.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-gray-500">This is a placeholder Payroll List component. Customize as needed.</p>
    </div>
  );
};

export default PayrollList;















import React from 'react';

// Mock payroll data
const payrolls = [
    { id: 1, employee: 'John Doe', period: 'May 2025', amount: 3500, status: 'Paid' },
    { id: 2, employee: 'Jane Smith', period: 'May 2025', amount: 4200, status: 'Pending' },
    { id: 3, employee: 'Ali Hassan', period: 'May 2025', amount: 3900, status: 'Paid' },
];

const PayrollList: React.FC = () => {
    return (
        <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-bold">Payroll List</h2>
            <table className="min-w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Employee</th>
                        <th className="border px-4 py-2">Period</th>
                        <th className="border px-4 py-2">Amount</th>
                        <th className="border px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payrolls.map((payroll) => (
                        <tr key={payroll.id}>
                            <td className="border px-4 py-2">{payroll.employee}</td>
                            <td className="border px-4 py-2">{payroll.period}</td>
                            <td className="border px-4 py-2">${payroll.amount}</td>
                            <td className="border px-4 py-2">{payroll.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-4 text-gray-500">This is a placeholder Payroll List component. Customize as needed.</p>
        </div>
    );
};

export default PayrollList;

import React from 'react';

const PayrollDetails: React.FC = () => {
    return (
        <div className="mt-6 rounded bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-bold">Payroll Details</h2>
            <p className="mb-4 text-gray-600">This is a placeholder for the Payroll Details component. Display payroll details here.</p>
            <ul className="list-disc pl-6">
                <li>Employee: John Doe</li>
                <li>Period: May 2025</li>
                <li>Amount: $3500</li>
                <li>Status: Paid</li>
            </ul>
        </div>
    );
};

export default PayrollDetails;

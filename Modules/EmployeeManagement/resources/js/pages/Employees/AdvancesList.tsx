import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Core';
import { usePage } from '@inertiajs/react';

interface AdvancesListProps {
  employeeId: number;
  advances?: Array<{
    id: number;
    amount: number;
    status: string;
    reason: string;
    payment_date: string;
  }>;
}

const AdvancesList: React.FC<AdvancesListProps> = ({ employeeId, advances = [] }) => {
  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Employee Advances</CardTitle>
      </CardHeader>
      <CardContent>
        {advances.length === 0 ? (
          <div className="text-center text-gray-500">No advances found for this employee.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Reason</th>
                  <th className="px-4 py-2 border">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((adv) => (
                  <tr key={adv.id}>
                    <td className="px-4 py-2 border">{adv.id}</td>
                    <td className="px-4 py-2 border">{adv.amount}</td>
                    <td className="px-4 py-2 border">{adv.status}</td>
                    <td className="px-4 py-2 border">{adv.reason}</td>
                    <td className="px-4 py-2 border">{adv.payment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancesList;

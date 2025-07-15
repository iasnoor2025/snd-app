import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Separator } from '@/Core';

interface ReceiptProps {
  payment: {
    id: number;
    amount: number;
    payment_date: string;
    notes?: string;
    recorded_by: string;
    created_at: string;
  };
  advance: {
    id: number;
    amount: number;
    reason: string;
    payment_date: string;
    repaid_amount: number;
    balance: number;
  };
  employee: {
    id: number;
    name: string;
    position?: string;
    employee_id: string;
  };
  company: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

const Receipt: React.FC<ReceiptProps> = ({ payment, advance, employee, company }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 print:bg-white relative">
      {/* Watermark */}
      <div className="pointer-events-none select-none fixed inset-0 flex items-center justify-center opacity-5 z-0 print:hidden">
        <span className="text-7xl font-extrabold tracking-widest text-primary">{company.name}</span>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl border border-gray-200 bg-white relative z-10 print:shadow-none print:border-none print:max-w-full print:p-0">
        <CardHeader className="border-b p-6 print:border-none print:p-4">
          <div className="flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Company Logo" className="h-12 mb-2 print:hidden" />
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-primary">Repayment Receipt</CardTitle>
            <div className="text-sm text-muted-foreground font-medium">#{payment.id}</div>
          </div>
        </CardHeader>
        <CardContent className="p-8 print:p-4">
          {/* Company Info */}
          <div className="mb-6 text-center">
            <div className="text-xl font-semibold text-primary">{company.name}</div>
            {company.address && <div className="text-sm">{company.address}</div>}
            {(company.phone || company.email) && (
              <div className="text-xs text-muted-foreground mt-1">
                {company.phone && <span>Phone: {company.phone}</span>}
                {company.phone && company.email && <span className="mx-2">|</span>}
                {company.email && <span>Email: {company.email}</span>}
              </div>
            )}
          </div>
          <Separator className="mb-6" />
          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-medium text-gray-700 mb-1">Employee Information</div>
              <div className="text-sm">{employee.name}</div>
              <div className="text-xs text-muted-foreground">ID: {employee.employee_id}</div>
              {employee.position && <div className="text-xs text-muted-foreground">Position: {employee.position}</div>}
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-1">Receipt Information</div>
              <div className="text-sm">Date: <span className="font-semibold">{payment.payment_date}</span></div>
              <div className="text-sm">Created: <span className="font-semibold">{payment.created_at}</span></div>
              <div className="text-sm">Recorded By: <span className="font-semibold">{payment.recorded_by}</span></div>
            </div>
          </div>
          <Separator className="mb-6" />
          {/* Advance & Repayment Details */}
          <div className="mb-6">
            <div className="font-medium text-gray-700 mb-2">Advance Details</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Advance ID:</div>
              <div className="font-semibold">{advance.id}</div>
              <div>Advance Amount:</div>
              <div className="font-semibold">SAR {Number(advance.amount).toFixed(2)}</div>
              <div>Reason:</div>
              <div className="font-semibold">{advance.reason}</div>
              <div>Advance Date:</div>
              <div className="font-semibold">{advance.payment_date}</div>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-medium text-gray-700 mb-2">Repayment Details</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Repayment Amount:</div>
              <div className="font-semibold text-green-700">SAR {Number(payment.amount).toFixed(2)}</div>
              <div>Remaining Balance:</div>
              <div className="font-semibold text-red-700">SAR {Number(advance.balance).toFixed(2)}</div>
              {payment.notes && <><div>Notes:</div><div className="font-semibold">{payment.notes}</div></>}
            </div>
          </div>
          <Separator className="mb-6" />
          {/* Signature Area */}
          <div className="flex justify-between items-end mt-12 print:mt-8">
            <div className="flex flex-col items-start">
              <div className="font-medium text-gray-700 mb-2">Authorized Signature</div>
              <div className="w-48 h-12 border-b border-gray-400 mb-2" />
              <div className="text-xs text-muted-foreground">Name & Signature</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-medium text-gray-700 mb-2">Employee Signature</div>
              <div className="w-48 h-12 border-b border-gray-400 mb-2" />
              <div className="text-xs text-muted-foreground">Name & Signature</div>
            </div>
          </div>
          {/* Print Button (hidden on print) */}
          <div className="mt-8 flex justify-center print:hidden">
            <Button onClick={() => window.print()} variant="default">Print Receipt</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipt;

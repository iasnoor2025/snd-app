import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from '@/Core';
import { useTranslation } from 'react-i18next';

interface QuotationShowProps {
  quotation: any;
  quotationItems: {
    data: any[];
    total: number;
  };
  canApprove?: boolean;
  canReject?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const QuotationShow: React.FC<QuotationShowProps> = ({ quotation, quotationItems, canApprove, canReject, canEdit, canDelete }) => {
  const { t } = useTranslation('rental');

  if (!quotation) {
    return <div className="p-8 text-center text-destructive">Quotation not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('quotation_number')}: {quotation.quotation_number}</CardTitle>
          <CardDescription>{t('customer')}: {quotation.customer?.company_name || '-'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div><b>{t('status')}:</b> {quotation.status}</div>
            <div><b>{t('issue_date')}:</b> {quotation.issue_date}</div>
            <div><b>{t('valid_until')}:</b> {quotation.valid_until}</div>
            <div><b>{t('total_amount')}:</b> {quotation.total_amount}</div>
            <div><b>{t('notes')}:</b> {quotation.notes}</div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('quotation_items')}</h3>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">{t('equipment')}</th>
                  <th className="border px-2 py-1">{t('description')}</th>
                  <th className="border px-2 py-1">{t('quantity')}</th>
                  <th className="border px-2 py-1">{t('rate')}</th>
                  <th className="border px-2 py-1">{t('total_amount')}</th>
                </tr>
              </thead>
              <tbody>
                {quotationItems.data.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="border px-2 py-1">{item.equipment?.name || '-'}</td>
                    <td className="border px-2 py-1">{item.description || '-'}</td>
                    <td className="border px-2 py-1">{item.quantity}</td>
                    <td className="border px-2 py-1">{item.rate}</td>
                    <td className="border px-2 py-1">{item.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            {canApprove && <Button>{t('approve')}</Button>}
            {canReject && <Button variant="destructive">{t('reject')}</Button>}
            {canEdit && <Button variant="outline">{t('edit')}</Button>}
            {canDelete && <Button variant="destructive">{t('delete')}</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationShow;

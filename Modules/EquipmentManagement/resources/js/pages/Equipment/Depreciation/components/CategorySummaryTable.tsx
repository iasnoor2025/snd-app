import React from 'react';
import { useTranslation } from 'react-i18next';

const CategorySummaryTable = ({ categories, formatCurrency }: { categories: any[]; formatCurrency: (n: number) => string }) => {
  const { t } = useTranslation('equipment');
  function renderString(val: any): string {
    if (!val) return '—';
    if (typeof val === 'string') return t(val);
    if (typeof val === 'object') {
      if (val.name) return t(val.name);
      if (val.en) return t(val.en);
      const first = Object.values(val).find(v => typeof v === 'string');
      if (first) return t(first);
    }
    return '—';
  }
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">{t('category')}</th>
          <th className="text-left">{t('value')}</th>
        </tr>
      </thead>
      <tbody>
        {categories?.map((cat, idx) => (
          <tr key={idx}>
            <td>{renderString(cat.category_name)}</td>
            <td>{formatCurrency(cat.current_value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CategorySummaryTable;

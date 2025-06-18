import React from 'react';

const DepreciationByCategoryChart = ({ categories }: { categories: any[] }) => (
  <div className="p-2">
    <h3 className="font-semibold mb-2">Depreciation by Category (Placeholder)</h3>
    <ul className="list-disc pl-4">
      {categories?.map((cat, idx) => (
        <li key={idx}>{cat.category_name}: {cat.depreciation}</li>
      ))}
    </ul>
  </div>
);

export default DepreciationByCategoryChart;

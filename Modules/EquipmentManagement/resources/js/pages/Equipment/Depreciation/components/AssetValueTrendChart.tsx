import React from 'react';

const AssetValueTrendChart = ({ categories }: { categories: any[] }) => (
  <div className="p-2">
    <h3 className="font-semibold mb-2">Asset Value Trend (Placeholder)</h3>
    <ul className="list-disc pl-4">
      {categories?.map((cat, idx) => (
        <li key={idx}>{cat.category_name}: {cat.current_value}</li>
      ))}
    </ul>
  </div>
);

export default AssetValueTrendChart;

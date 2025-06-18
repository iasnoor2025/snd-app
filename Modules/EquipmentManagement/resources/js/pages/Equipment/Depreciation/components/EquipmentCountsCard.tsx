import React from 'react';

const EquipmentCountsCard = ({ counts }: { counts: any }) => (
  <div className="p-4 border rounded bg-white">
    <h2 className="font-bold mb-2">Equipment Counts</h2>
    <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(counts, null, 2)}</pre>
  </div>
);

export default EquipmentCountsCard;

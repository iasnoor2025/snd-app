import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Progress } from '@/Core';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface CostAnalysisCardProps {
  budget: number;
  spent: number;
}

const CostAnalysisCard: React.FC<CostAnalysisCardProps> = ({ budget, spent }) => {
  const remaining = budget - spent;
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Total Budget</span>
          <span className="font-semibold">${budget}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Spent</span>
          <span className="font-semibold text-red-600">${spent}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Remaining</span>
          <span className="font-semibold text-green-600">${remaining}</span>
        </div>
        <Progress value={percent} className="h-3 bg-gray-100" />
        <div className="text-xs text-muted-foreground">{percent}% of budget spent</div>
      </CardContent>
    </Card>
  );
};

export default CostAnalysisCard;

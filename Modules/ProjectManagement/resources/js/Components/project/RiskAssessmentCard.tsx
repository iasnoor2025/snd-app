import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/Core';

interface Risk {
  id: number;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Mitigated' | 'Closed';
}

interface RiskAssessmentCardProps {
  risks: Risk[];
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ risks }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {risks.length === 0 ? (
          <div className="text-muted-foreground text-sm">No risks identified.</div>
        ) : (
          <ul className="space-y-2">
            {risks.map(risk => (
              <li key={risk.id} className="flex items-center justify-between border-b pb-1 last:border-b-0">
                <span>{risk.description}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={risk.severity === 'High' ? 'destructive' : risk.severity === 'Medium' ? 'secondary' : 'default'}>{risk.severity}</Badge>
                  <Badge variant={risk.status === 'Open' ? 'default' : risk.status === 'Mitigated' ? 'secondary' : 'outline'}>{risk.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentCard;

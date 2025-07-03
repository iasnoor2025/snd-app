import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import DashboardWidgetCard from './DashboardWidgetCard';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface TeamWidgetProps {
  members: TeamMember[];
  className?: string;
  onRemove: () => void;
}

const TeamWidget: React.FC<TeamWidgetProps> = ({ members, className = '', onRemove }) => (
  <DashboardWidgetCard title="Team" summary={members.length === 0 ? 'No team members.' : undefined} onRemove={onRemove} className={className}>
    {/*
    <CardContent>
      <ul className="space-y-3">
        {members.length === 0 ? (
          <li className="text-muted-foreground text-sm">No team members.</li>
        ) : (
          members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {member.avatarUrl ? (
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                ) : (
                  <AvatarFallback>{member.name.slice(0,2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium text-sm">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.role}</div>
              </div>
            </li>
          ))
        )}
      </ul>
    </CardContent>
    */}
  </DashboardWidgetCard>
);

export default TeamWidget;

export type { TeamWidgetProps, TeamMember };

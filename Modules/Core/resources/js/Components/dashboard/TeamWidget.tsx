import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface TeamWidgetProps {
  members: TeamMember[];
  className?: string;
}

const TeamWidget: React.FC<TeamWidgetProps> = ({ members, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Team</CardTitle>
    </CardHeader>
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
  </Card>
);

export default TeamWidget;

export type { TeamWidgetProps, TeamMember };

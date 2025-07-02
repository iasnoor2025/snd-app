import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed';
  updatedAt: string;
}

interface ProjectWidgetProps {
  total: number;
  active: number;
  completed: number;
  topProjects: Project[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Completed: 'text-blue-600 dark:text-blue-400',
};

const ProjectWidget: React.FC<ProjectWidgetProps> = ({ total, active, completed, topProjects, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Projects</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="text-blue-600 dark:text-blue-400">Completed: <b>{completed}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {topProjects.length === 0 ? (
          <li className="text-muted-foreground text-sm">No projects found.</li>
        ) : (
          topProjects.map((proj) => (
            <li key={proj.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{proj.name}</span>
              <span className={`ml-2 ${statusColor[proj.status]}`}>{proj.status}</span>
              <span className="ml-4 text-xs text-muted-foreground">{proj.updatedAt}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default ProjectWidget;
export type { ProjectWidgetProps, Project };

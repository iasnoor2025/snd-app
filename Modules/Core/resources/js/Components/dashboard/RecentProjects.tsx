import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Pending';
  updatedAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Completed: 'text-blue-600 dark:text-blue-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Recent Projects</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {projects.length === 0 ? (
          <li className="text-muted-foreground text-sm">No recent projects.</li>
        ) : (
          projects.map((project) => (
            <li key={project.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">{project.name}</span>
              <span className={`ml-2 ${statusColor[project.status]}`}>{project.status}</span>
              <span className="ml-4 text-xs text-muted-foreground">{project.updatedAt}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default RecentProjects;

export type { RecentProjectsProps, Project };

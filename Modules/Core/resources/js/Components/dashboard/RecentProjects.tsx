import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Pending';
  updatedAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
  className?: string;
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Completed: 'text-blue-600 dark:text-blue-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, className = '', onRemove }) => (
  <DashboardWidgetCard
    title="Recent Projects"
    summary={projects.length === 0 ? 'No recent projects.' : `Projects: ${projects.length}`}
    onRemove={onRemove}
    className={className}
  />
);

export default RecentProjects;

export type { RecentProjectsProps, Project };

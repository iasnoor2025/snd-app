import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Task {
  id: string;
  title: string;
  assignee: { name: string; avatarUrl?: string };
  due: string;
  status: 'todo' | 'inprogress' | 'done';
}

interface KanbanWidgetProps {
  tasks: Task[];
  className?: string;
  onRemove: () => void;
}

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const KanbanWidget: React.FC<KanbanWidgetProps> = ({ tasks, className = '', onRemove }) => {
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inprogress = tasks.filter(t => t.status === 'inprogress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  return (
    <DashboardWidgetCard
      title="Kanban Board"
      summary={
        <>
          <span>To Do: <b>{todo}</b></span>
          <span className="mx-2">&middot;</span>
          <span className="text-yellow-600 dark:text-yellow-400">In Progress: <b>{inprogress}</b></span>
          <span className="mx-2">&middot;</span>
          <span className="text-green-600 dark:text-green-400">Done: <b>{done}</b></span>
        </>
      }
      onRemove={onRemove}
      className={className}
    />
  );
};

export default KanbanWidget;
export type { KanbanWidgetProps, Task };

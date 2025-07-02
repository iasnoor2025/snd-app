import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
}

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const KanbanWidget: React.FC<KanbanWidgetProps> = ({ tasks, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Kanban Board</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.key} className="min-w-[220px] flex-1">
            <h4 className="mb-2 text-md font-semibold text-primary">{col.label}</h4>
            <div className="flex flex-col gap-2">
              {tasks.filter((t) => t.status === col.key).length === 0 ? (
                <div className="text-xs text-muted-foreground">No tasks</div>
              ) : (
                tasks.filter((t) => t.status === col.key).map((task) => (
                  <Card key={task.id} className="p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {task.assignee.avatarUrl ? (
                          <AvatarImage src={task.assignee.avatarUrl} />
                        ) : (
                          <AvatarFallback>{task.assignee.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">Due: {task.due}</div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default KanbanWidget;
export type { KanbanWidgetProps, Task };

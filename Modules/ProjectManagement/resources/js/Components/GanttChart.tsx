import React from 'react';

interface Task {
  id: number;
  name: string;
  start: string; // ISO date
  end: string;   // ISO date
}

interface GanttChartProps {
  tasks: Task[];
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

function daysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}

function getDayOffset(date: string, start: string) {
  return Math.max(0, Math.floor((new Date(date).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function GanttChart({ tasks, startDate, endDate }: GanttChartProps) {
  const totalDays = daysBetween(startDate, endDate) + 1;
  const today = new Date();
  const todayOffset = getDayOffset(today.toISOString().slice(0, 10), startDate);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex text-xs border-b">
          <div className="w-48 font-semibold p-2">Task</div>
          <div className="flex-1 flex">
            {[...Array(totalDays)].map((_, i) => (
              <div key={i} className="w-8 text-center p-1 border-l">
                {new Date(new Date(startDate).getTime() + i * 86400000).getDate()}
              </div>
            ))}
          </div>
        </div>
        {tasks.map((task) => {
          const offset = getDayOffset(task.start, startDate);
          const duration = daysBetween(task.start, task.end) + 1;
          return (
            <div key={task.id} className="flex items-center border-b h-10">
              <div className="w-48 truncate p-2 text-sm">{task.name}</div>
              <div className="flex-1 relative h-8">
                <div className="absolute top-2 left-0 right-0 h-4">
                  <div
                    className="absolute h-4 rounded bg-blue-500"
                    style={{
                      left: `${(offset / totalDays) * 100}%`,
                      width: `${(duration / totalDays) * 100}%`,
                      minWidth: 16,
                    }}
                  />
                  {/* Highlight today */}
                  {todayOffset >= 0 && todayOffset < totalDays && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-red-500/70"
                      style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

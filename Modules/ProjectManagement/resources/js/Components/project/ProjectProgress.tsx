import React from "react";
import { useTranslation } from 'react-i18next';
import { cn } from "@/Modules/Core/resources/js/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/Modules/Core/resources/js/components/ui/card";
// import { Progress } from '@/Modules/Core/resources/js/components/ui/progress'; // TODO: Progress component import unresolved, revisit if file is added
import { CheckCircle2, Calendar, Clock } from "lucide-react";

interface ProjectProgressProps {
  percentage: number;
  completed: number;
  total: number;
  inProgress: number;
  pending: number;
  overdue: number;
  startDate?: string;
  endDate?: string;
  className?: string;
}

export function ProjectProgress({
  percentage = 25,
  completed = 1,
  total = 4,
  inProgress = 2,
  pending = 1,
  overdue = 0,
  startDate,
  endDate,
  className,
}: ProjectProgressProps) {
  const { t } = useTranslation('project');

  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    if (!endDate) return null;

    const today = new Date();
    const endDateObj = new Date(endDate);

    // If end date is in the past, return 0
    if (endDateObj < today) return 0;

    // Calculate difference in days
    const diffTime = endDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }, [endDate]);

  // Calculate estimated days to complete based on progress rate
  const estimatedDaysToComplete = React.useMemo(() => {
    if (!startDate || percentage === 0) return null;

    const today = new Date();
    const startDateObj = new Date(startDate);

    // Calculate days elapsed since start
    const elapsedTime = today.getTime() - startDateObj.getTime();
    const daysElapsed = Math.ceil(elapsedTime / (1000 * 60 * 60 * 24));

    // If no progress or just started today, return "Calculating..."
    if (percentage <= 0 || daysElapsed <= 0) return "Calculating...";

    // Calculate days needed based on current progress rate
    const estimatedTotalDays = Math.ceil((daysElapsed / percentage) * 100);
    const estimatedRemainingDays = estimatedTotalDays - daysElapsed;

    return Math.max(0, estimatedRemainingDays);
  }, [startDate, percentage]);

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-blue-100">
            <CheckCircle2 className="h-3 w-3 text-blue-600" />
          </div>
          <CardTitle className="ml-2 text-base font-medium">{t('ttl_project_progress')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{percentage}% completed</p>
          <p className="text-sm text-muted-foreground">{completed}/{total} tasks</p>
        </div>
        {/*
        <Progress value={progressValue} className="h-3 bg-gray-100" />
        */}
        {/* TODO: Progress bar component usage commented out, revisit if Progress is added or path is fixed */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-md bg-blue-50 p-2">
            <span className="text-xl font-semibold text-blue-600">{inProgress}</span>
            <span className="text-xs text-muted-foreground">{t('in_progress')}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md bg-amber-50 p-2">
            <span className="text-xl font-semibold text-amber-600">{pending}</span>
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md bg-red-50 p-2">
            <span className="text-xl font-semibold text-red-600">{overdue}</span>
            <span className="text-xs text-muted-foreground">Overdue</span>
          </div>
        </div>
        {(daysRemaining !== null || estimatedDaysToComplete !== null) && (
          <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
            <div className="flex items-center justify-between text-sm">
              {daysRemaining !== null && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  <span>{daysRemaining} days remaining</span>
                </div>
              )}
              {estimatedDaysToComplete !== null && (
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  <span>Est. {typeof estimatedDaysToComplete === 'string'
                    ? estimatedDaysToComplete
                    : `${estimatedDaysToComplete} days to finish`}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}















import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Badge } from '@/Core/components/ui/badge';
import {
  Clock as ClockIcon,
  ArrowLeft as ArrowLeftIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  User as UserIcon
} from 'lucide-react';
import { usePermission } from "@/Core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Core/components/ui/tooltip";
import { format } from 'date-fns';
import { ApprovalDialog } from '../../components/ApprovalDialog';

interface Props {
  timesheet: any;
  employee?: any;
  project?: any;
  rental?: any;
  user?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export default function TimesheetShow({ timesheet, employee = {}, project = {}, rental = {}, user = {}, created_at, updated_at, deleted_at }: Props) {
  const { t } = useTranslation('TimesheetManagement');

  const { hasPermission } = usePermission();

  const breadcrumbs = [
    { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
    { title: t('view', 'View'), href: '#' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'manager_approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'foreman_approved':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Foreman Approved</Badge>;
      case 'incharge_approved':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Incharge Approved</Badge>;
      case 'checking_approved':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Checking Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Submitted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const handleDelete = () => {
    if (confirm(t('delete_confirm', 'Are you sure you want to delete this timesheet?'))) {
      fetch(route('timesheets.destroy', timesheet.id), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _method: 'DELETE' }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(t('success', 'Success'));
          window.location.href = route('timesheets.index');
        } else {
          console.log(data.error || t('delete_failed', 'Failed to delete timesheet'));
        }
      })
      .catch(error => {
        console.log(error.message || t('delete_failed', 'Failed to delete timesheet'));
      });
    }
  };

  // Calculate total hours
  const totalHours = (
    parseFloat(timesheet.hours_worked?.toString() || '0') +
    parseFloat(timesheet.overtime_hours?.toString() || '0')
  ).toFixed(1);

  return (
    <AppLayout title={t('ttl_view_timesheet')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
      <Head title={t('ttl_view_timesheet')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('timesheet_details')}</h1>
            <Badge className="ml-2">{getStatusBadge(timesheet.status)}</Badge>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <a href={route('timesheets.index')}>
                      <ArrowLeftIcon className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('back_to_timesheets')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {hasPermission('timesheets.edit') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" asChild>
                      <a href={route('timesheets.edit', timesheet.id)}>
                        <EditIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('edit_timesheet')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {hasPermission('timesheets.delete') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('delete_timesheet')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                {timesheet.employee?.first_name} {timesheet.employee?.last_name}
              </CardTitle>
              <CardDescription>
                {timesheet.date && format(new Date(timesheet.date), 'PPP')}
                {timesheet.project?.name && ` • ${timesheet.project.name}`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">{t('lbl_regular_hours')}</span>
                  <span className="text-2xl font-bold">{timesheet.hours_worked}</span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Overtime</span>
                  <span className="text-2xl font-bold">{timesheet.overtime_hours}</span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">{t('total_hours')}</span>
                  <span className="text-2xl font-bold">{totalHours}</span>
                </div>
              </div>

              {timesheet.tasks_completed && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('tasks_completed')}</h3>
                  <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                    {timesheet.tasks_completed}
                  </div>
                </div>
              )}

              {timesheet.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                    {timesheet.description}
                  </div>
                </div>
              )}
            </CardContent>

            {timesheet.status === 'submitted' && hasPermission('timesheets.approve') && (
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                <ApprovalDialog
                  timesheet={timesheet}
                  action="reject"
                  onSuccess={() => {
                    // Reload the page to show updated data
                    window.location.reload();
                  }}
                  trigger={
                    <Button variant="outline" className="text-destructive">
                      <XIcon className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  }
                />
                <ApprovalDialog
                  timesheet={timesheet}
                  action="approve"
                  onSuccess={() => {
                    // Reload the page to show updated data
                    window.location.reload();
                  }}
                  trigger={
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  }
                />
              </CardFooter>
            )}
            {/* Submit button for draft/rejected timesheets for admin/HR */}
            {['draft', 'rejected'].includes(timesheet.status) && hasPermission('timesheets.edit') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        fetch(route('timesheets.submit', timesheet.id), {
                          method: 'POST',
                          headers: {
                            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({}),
                        })
                        .then(response => response.json())
                        .then(data => {
                          if (data.success) {
                            console.log(t('success', 'Timesheet submitted for approval'));
                            window.location.reload();
                          } else {
                            console.log(data.error || t('submit_failed', 'Failed to submit timesheet'));
                          }
                        })
                        .catch(error => {
                          console.log(error.message || t('submit_failed', 'Failed to submit timesheet'));
                        });
                      }}
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      {t('submit', 'Submit')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('submit_timesheet', 'Submit Timesheet for Approval')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Time Summary
              </CardTitle>
              <CardDescription>
                Monthly summary for {timesheet.employee?.first_name}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('lbl_regular_hours')}</span>
                  <span className="font-medium">{timesheet.employee?.monthly_regular_hours || 0} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('lbl_overtime_hours')}</span>
                  <span className="font-medium">{timesheet.employee?.monthly_overtime_hours || 0} hrs</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                  <span className="text-sm font-medium">{t('total_hours')}</span>
                  <span className="font-bold">{
                    (parseFloat(timesheet.employee?.monthly_regular_hours?.toString() || '0') +
                     parseFloat(timesheet.employee?.monthly_overtime_hours?.toString() || '0')).toFixed(1)
                  } hrs</span>
                </div>
              </div>

              {timesheet.employee?.recent_timesheets?.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">{t('recent_timesheets')}</h3>
                  <div className="space-y-3">
                    {timesheet.employee.recent_timesheets.map((entry: { date: string; hours_worked: number; overtime_hours: number; status: string }, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span>{format(new Date(entry.date), 'PPP')}</span>
                          <span className="text-muted-foreground ml-2">
                            ({entry.hours_worked + entry.overtime_hours} hrs)
                          </span>
                        </div>
                        <div>{getStatusBadge(entry.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
















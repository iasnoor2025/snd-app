import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '../../../../../../resources/js/types';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import { usePermission } from '../../../../../../resources/js/hooks/usePermission';
import { Button } from '../../../../../../resources/js/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../../../resources/js/components/ui/card';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Badge } from '../../../../../../resources/js/components/ui/badge';
import { Checkbox } from '../../../../../../resources/js/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../resources/js/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../resources/js/components/ui/table';
import {
  Plus as PlusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  RotateCw as ArrowPathIcon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  MoreHorizontal as MoreHorizontalIcon,
  FileText as FileTextIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../../../resources/js/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../../resources/js/components/ui/popover';
import { Calendar } from '../../../../../../resources/js/components/ui/calendar';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../../resources/js/components/ui/dropdown-menu';
import CreateButton from '../../../../../../resources/js/components/shared/CreateButton';
import CrudButtons from '../../../../../../resources/js/components/shared/CrudButtons';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Timesheets', href: '/timesheets' }
];

// Define the Timesheet interface here to ensure it has all required properties
interface Project {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface Timesheet {
  id: number;
  employee_id: number;
  employee?: Employee;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  project_id?: number;
  project?: Project;
  description?: string;
  tasks_completed?: string;
  status: string;
}

interface Props extends PageProps {
  timesheets: {
    data: Timesheet[];
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
  filters?: {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
  };
}

export default function TimesheetsIndex({ auth, timesheets, filters = { status: 'all', search: '', date_from: '', date_to: '', per_page: 15 } }: Props) {
  const { t } = useTranslation('timesheet');

  const { hasPermission } = usePermission();
  const [processing, setProcessing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );
  const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
  const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Ensure timesheets.data is always an array
  const timesheetsData = timesheets?.data || [];

  const canCreateTimesheet = hasPermission('timesheets.create');
  const canEditTimesheet = hasPermission('timesheets.edit');
  const canDeleteTimesheet = hasPermission('timesheets.delete');
  const canApproveTimesheet = hasPermission('timesheets.approve');

  // Toggle selection of a single timesheet
  const toggleTimesheetSelection = (id: number, checked?: boolean | 'indeterminate') => {
    if (checked === undefined || checked === 'indeterminate') {
      // Toggle behavior (for backward compatibility)
      setSelectedTimesheets(prev =>
        prev.includes(id)
          ? prev.filter(timesheetId => timesheetId !== id)
          : [...prev, id]
      );
    } else if (checked) {
      // Add to selection if not already included
      setSelectedTimesheets(prev =>
        prev.includes(id) ? prev : [...prev, id]
      );
    } else {
      // Remove from selection
      setSelectedTimesheets(prev =>
        prev.filter(timesheetId => timesheetId !== id)
      );
    }
  };

  // Toggle selection of all timesheets
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all submitted timesheets
      const submittedTimesheets = timesheetsData
        .filter(timesheet => timesheet.status === 'submitted')
        .map(timesheet => timesheet.id);
      setSelectedTimesheets(submittedTimesheets);
    } else {
      // Deselect all
      setSelectedTimesheets([]);
    }
  };

  // Handle bulk approval of selected timesheets
  const handleBulkApprove = () => {
    if (selectedTimesheets.length === 0) {
      toast("Please select at least one timesheet to approve");
      return;
    }

    if (confirm(`Are you sure you want to approve ${selectedTimesheets.length} selected timesheets?`)) {
      setBulkProcessing(true);
      router.post(route('timesheets.bulk-approve'), {
        timesheet_ids: selectedTimesheets
      }, {
        onSuccess: () => {
          toast(`${selectedTimesheets.length} timesheets approved successfully`);
          setSelectedTimesheets([]);
          setBulkProcessing(false);
        },
        onError: (errors) => {
          toast(errors.error || 'Failed to approve timesheets');
          setBulkProcessing(false);
        },
      });
    }
  };

  const handleSearch = () => {
    router.get(route('timesheets.index'), {
      search: searchTerm,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      per_page: perPage,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setPerPage(15);
    router.get(route('timesheets.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this timesheet?')) {
      router.delete(route('timesheets.destroy', id), {
        onSuccess: () => {
          toast("Timesheet deleted successfully");
        },
        onError: (errors) => {
          toast(errors.error || 'Failed to delete timesheet');
        },
      });
    }
  };

  const handleApprove = (id: number) => {
    setProcessing(id);
    router.put(route('timesheets.approve', id), {}, {
      onSuccess: () => {
        toast("Timesheet approved successfully");
        setProcessing(null);
      },
      onError: (errors) => {
        toast(errors.error || 'Failed to approve timesheet');
        setProcessing(null);
      },
    });
  };

  const handleReject = (id: number) => {
    setProcessing(id);
    router.put(route('timesheets.reject', id), {}, {
      onSuccess: () => {
        toast("Timesheet rejected successfully");
        setProcessing(null);
      },
      onError: (errors) => {
        toast(errors.error || 'Failed to reject timesheet');
        setProcessing(null);
      },
    });
  };

  return (
    <AdminLayout title={t('ttl_timesheets')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
      <Head title={t('ttl_timesheets')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Timesheets</CardTitle>
              <CardDescription>
                Manage employee timesheets and track working hours
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <CreateButton
                resourceType="timesheets"
                text="Add Timesheet"
                href="/hr/timesheets/create"
              />

              {canApproveTimesheet && selectedTimesheets.length > 0 && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                >
                  {bulkProcessing ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Approve Selected
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                  <div className="w-full md:w-64">
                    <Input
                      placeholder={t('ph_search_by_employee_name')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('ph_status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('opt_all_statuses_1')}</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PP') : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PP') : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSearch}>Search</Button>
                    <Button variant="outline" onClick={resetFilters}>Reset</Button>
                  </div>
                </div>

                {/* <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Timesheets</h2>
                </div> */}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canApproveTimesheet && (
                      <TableHead className="w-[60px]">
                        <Checkbox
                          onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                          checked={
                            timesheetsData.filter(t => t.status === 'submitted').length > 0 &&
                            timesheetsData.filter(t => t.status === 'submitted').every(
                              timesheet => selectedTimesheets.includes(timesheet.id)
                            )
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheetsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canApproveTimesheet ? 8 : 7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-lg font-medium">{t('no_timesheets_found')}</div>
                          <div className="text-sm text-muted-foreground">
                            Try adjusting your filters or create a new timesheet.
                          </div>
                          {canCreateTimesheet && (
                            <CreateButton
                              resourceType="timesheets"
                              text="Add Timesheet"
                              href="/hr/timesheets/create"
                              buttonVariant="default"
                              className="mt-2"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheetsData.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        {canApproveTimesheet && (
                          <TableCell>
                            <Checkbox
                              checked={selectedTimesheets.includes(timesheet.id)}
                              onCheckedChange={(checked) => toggleTimesheetSelection(timesheet.id, checked)}
                              disabled={timesheet.status !== 'submitted'}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          {timesheet.employee
                            ? `${timesheet.employee.first_name} ${timesheet.employee.last_name}`
                            : `Employee ID: ${timesheet.employee_id}`
                          }
                        </TableCell>
                        <TableCell>{format(new Date(timesheet.date), "PP")}</TableCell>
                        <TableCell>{timesheet.hours_worked}</TableCell>
                        <TableCell>{timesheet.overtime_hours}</TableCell>
                        <TableCell>
                          {timesheet.project?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <CrudButtons
                              resourceType="timesheets"
                              resourceId={timesheet.id}
                              resourceName={`Timesheet from ${format(new Date(timesheet.date), "PP")}`}
                            />

                            {canApproveTimesheet && timesheet.status === 'submitted' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to approve this timesheet?')) {
                                            setProcessing(timesheet.id);
                                            router.put(route('timesheets.approve', timesheet.id), {}, {
                                              preserveState: true,
                                              onSuccess: () => {
                                                setProcessing(null);
                                                toast("Timesheet approved successfully");
                                              },
                                              onError: () => {
                                                setProcessing(null);
                                                toast("Failed to approve timesheet");
                                              }
                                            });
                                          }
                                        }}
                                        disabled={processing === timesheet.id}
                                      >
                                        {processing === timesheet.id ? (
                                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckIcon className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{t('approve_timesheet')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to reject this timesheet?')) {
                                            setProcessing(timesheet.id);
                                            router.put(route('timesheets.reject', timesheet.id), {}, {
                                              preserveState: true,
                                              onSuccess: () => {
                                                setProcessing(null);
                                                toast("Timesheet rejected successfully");
                                              },
                                              onError: () => {
                                                setProcessing(null);
                                                toast("Failed to reject timesheet");
                                              }
                                            });
                                          }
                                        }}
                                        disabled={processing === timesheet.id}
                                      >
                                        {processing === timesheet.id ? (
                                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <XIcon className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{t('reject_timesheet')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {timesheets.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(timesheets.current_page - 1) * timesheets.per_page + 1} to {Math.min(timesheets.current_page * timesheets.per_page, timesheets.total)} of {timesheets.total} records
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (timesheets.current_page > 1) {
                        router.get(
                          route('timesheets.index'),
                          {
                            page: timesheets.current_page - 1,
                            search: searchTerm,
                            status: selectedStatus === 'all' ? undefined : selectedStatus,
                            date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                            date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                            per_page: perPage,
                          },
                          {
                            preserveState: true,
                            replace: true,
                          }
                        );
                      }
                    }}
                    disabled={timesheets.current_page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {timesheets.current_page} of {timesheets.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (timesheets.current_page < timesheets.last_page) {
                        router.get(
                          route('timesheets.index'),
                          {
                            page: timesheets.current_page + 1,
                            search: searchTerm,
                            status: selectedStatus === 'all' ? undefined : selectedStatus,
                            date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                            date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                            per_page: perPage,
                          },
                          {
                            preserveState: true,
                            replace: true,
                          }
                        );
                      }
                    }}
                    disabled={timesheets.current_page >= timesheets.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}



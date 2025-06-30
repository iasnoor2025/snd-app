import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { PageProps, BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
import { usePermission } from "@/Core";
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Core";
import { Input } from "@/Core";
import { Badge } from "@/Core";
import { Checkbox } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Core";
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Core";
import { CreateButton } from "@/Core";
import { CrudButtons } from "@/Core";
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

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
  const { t } = useTranslation('TimesheetManagement');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
    { title: 'Timesheets', href: '/timesheets' }
  ];

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
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      setSearchTerm(filters.search || '');
      setSelectedStatus(filters.status || 'all');
      setStartDate(filters.date_from ? new Date(filters.date_from) : undefined);
      setEndDate(filters.date_to ? new Date(filters.date_to) : undefined);
      setPerPage(filters.per_page || 15);
      isFirstMount.current = false;
    }
  }, [filters]);

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
      router.post('/api/timesheets/bulk-approve', {
        timesheet_ids: selectedTimesheets
      }, {
        onSuccess: () => {
          toast(`${selectedTimesheets.length} timesheets approved successfully`);
          setSelectedTimesheets([]);
          setBulkProcessing(false);
        },
        onError: (errors: any) => {
          toast(errors.error || 'Failed to approve timesheets');
          setBulkProcessing(false);
        },
      });
    }
  };

  const handleSearch = () => {
    router.get(route('timesheets.index'), {
      search: searchTerm,
      status: selectedStatus,
      date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      per_page: perPage,
    }, {
      preserveState: true,
      replace: true,
    });
  };

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
    if (confirm(t('delete_confirm', 'Are you sure you want to delete this timesheet?'))) {
      router.delete(route('hr.api.timesheets.destroy', id), {
        onSuccess: () => {
          toast("Timesheet deleted successfully");
        },
        onError: (errors: any) => {
          toast(errors.error || t('delete_failed', 'Failed to delete timesheet'));
        },
      });
    }
  };

  const handleApprove = (id: number) => {
    setProcessing(id);
    router.post(`/api/timesheets/${id}/approve`, {}, {
      onSuccess: () => {
        toast("Timesheet approved successfully");
        setProcessing(null);
      },
      onError: (errors: any) => {
        toast(errors.error || t('approve_failed', 'Failed to approve timesheet'));
        setProcessing(null);
      },
    });
  };

  const handleReject = (id: number) => {
    setProcessing(id);
    router.put(route('hr.api.timesheets.reject', id), {}, {
      onSuccess: () => {
        toast("Timesheet rejected successfully");
        setProcessing(null);
      },
      onError: (errors: any) => {
        toast(errors.error || t('reject_failed', 'Failed to reject timesheet'));
        setProcessing(null);
      },
    });
  };

  // Determine if user is admin
  const isAdmin = auth?.user?.roles?.includes('admin');

  // Accept page as argument for reloadPage
  const reloadPage = (page = timesheets.current_page) => {
    router.get(route('timesheets.index'), {
      page,
      search: searchTerm,
      status: selectedStatus,
      date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      per_page: perPage,
    }, {
      preserveState: true,
      replace: true,
      onSuccess: () => setSelectedTimesheets([]),
    });
  };

  const handleBulkDelete = () => {
    const draftIds = timesheetsData
      .filter(t => t.status === 'draft' && selectedTimesheets.includes(t.id))
      .map(t => t.id);
    if (draftIds.length === 0) {
      toast(t('select_draft_to_delete', 'Please select at least one draft timesheet to delete'));
      return;
    }
    if (confirm(t('delete_confirm', 'Are you sure you want to delete the selected draft timesheets?'))) {
      setBulkProcessing(true);
      router.visit(route('hr.api.timesheets.bulk-delete'), {
        method: 'delete',
        data: { timesheet_ids: draftIds },
        onSuccess: () => {
          toast(t('bulk_delete_success', 'Draft timesheets deleted successfully'));
          reloadPage();
          setBulkProcessing(false);
        },
        onError: (errors: any) => {
          toast(errors.error || t('bulk_delete_failed', 'Failed to delete draft timesheets'));
          setBulkProcessing(false);
        },
      });
    }
  };

  const handleSearchWithStatus = (status: string) => {
    router.get(route('timesheets.index'), {
      search: searchTerm,
      status: status,
      date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      per_page: perPage,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <AppLayout title={t('ttl_timesheets')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
      <Head title={t('ttl_timesheets')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">{t('ttl_timesheets')}</CardTitle>
              <CardDescription>
                {t('manage_timesheets')}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <CreateButton
                resourceType="timesheets"
                text={t('btn_create_timesheet')}
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
                      {t('btn_processing')}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      {t('btn_approve_selected')}
                    </>
                  )}
                </Button>
              )}

              {isAdmin && timesheetsData.some(t => t.status === 'draft' && selectedTimesheets.includes(t.id)) && (
                <Button
                  onClick={handleBulkDelete}
                  disabled={bulkProcessing}
                  variant="destructive"
                >
                  {bulkProcessing ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                      {t('btn_processing')}
                    </>
                  ) : (
                    <>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {t('btn_delete_selected', 'Delete Selected')}
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
                    <Select value={selectedStatus} onValueChange={(value) => {
                      setSelectedStatus(value);
                      setTimeout(() => handleSearchWithStatus(value), 0);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('ph_status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('opt_all_statuses_1')}</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="foreman_approved">Foreman Approved</SelectItem>
                        <SelectItem value="incharge_approved">Incharge Approved</SelectItem>
                        <SelectItem value="checking_approved">Checking Approved</SelectItem>
                        <SelectItem value="manager_approved">Manager Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PP') : t('from_date')}
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
                          {endDate ? format(endDate, 'PP') : t('to_date')}
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
                    <Button onClick={handleSearch}>{t('btn_search')}</Button>
                    <Button variant="outline" onClick={resetFilters}>{t('btn_reset')}</Button>
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
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          checked={
                            timesheetsData.filter(t => t.status === 'submitted').length > 0 &&
                            timesheetsData.filter(t => t.status === 'submitted').every(
                              timesheet => selectedTimesheets.includes(timesheet.id)
                            )
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead>{t('lbl_employee_column')}</TableHead>
                    <TableHead>{t('lbl_date_column')}</TableHead>
                    <TableHead>{t('lbl_hours_column')}</TableHead>
                    <TableHead>{t('lbl_overtime_column')}</TableHead>
                    <TableHead>{t('lbl_project_column')}</TableHead>
                    <TableHead>{t('lbl_status_column')}</TableHead>
                    <TableHead className="text-right">{t('lbl_actions_column')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheetsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canApproveTimesheet ? 8 : 7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-lg font-medium">{t('no_timesheets_found')}</div>
                          <div className="text-sm text-muted-foreground">
                            {t('no_timesheets_message')}
                          </div>
                          {canCreateTimesheet && (
                            <CreateButton
                              resourceType="timesheets"
                              text={t('btn_create_timesheet')}
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
                              onChange={(e) => toggleTimesheetSelection(timesheet.id, e.target.checked)}
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
                                          if (confirm(t('approve_confirm', 'Are you sure you want to approve this timesheet?'))) {
                                            setProcessing(timesheet.id);
                                            router.post(`/api/timesheets/${timesheet.id}/approve`, {}, {
                                              onSuccess: () => {
                                                setProcessing(null);
                                                toast("Timesheet approved successfully");
                                              },
                                              onError: (errors: any) => {
                                                setProcessing(null);
                                                toast(t('approve_failed', 'Failed to approve timesheet'));
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
                                          if (confirm(t('reject_confirm', 'Are you sure you want to reject this timesheet?'))) {
                                            setProcessing(timesheet.id);
                                            router.put(route('hr.api.timesheets.reject', timesheet.id), {}, {
                                              preserveState: true,
                                              onSuccess: () => {
                                                setProcessing(null);
                                                toast("Timesheet rejected successfully");
                                              },
                                              onError: (errors: any) => {
                                                setProcessing(null);
                                                toast(t('reject_failed', 'Failed to reject timesheet'));
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
                  {t('showing_records', {
                    from: (timesheets.current_page - 1) * timesheets.per_page + 1,
                    to: Math.min(timesheets.current_page * timesheets.per_page, timesheets.total),
                    total: timesheets.total
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (timesheets.current_page > 1) {
                        reloadPage(timesheets.current_page - 1);
                      }
                    }}
                    disabled={timesheets.current_page <= 1}
                  >
                    {t('btn_previous')}
                  </Button>
                  <span className="text-sm">
                    {t('page_info', { current: timesheets.current_page, total: timesheets.last_page })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (timesheets.current_page < timesheets.last_page) {
                        reloadPage(timesheets.current_page + 1);
                      }
                    }}
                    disabled={timesheets.current_page >= timesheets.last_page}
                  >
                    {t('btn_next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

















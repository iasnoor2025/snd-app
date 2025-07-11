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
import { ApprovalDialog } from '../../components/ApprovalDialog';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/Core/components/ui/alert-dialog';

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
  rental?: {
    equipment?: {
      name?: string;
    };
  };
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

  const { hasPermission, hasRole } = usePermission();
  const canBulkSubmit = hasPermission('timesheets.submit') || ['admin', 'hr', 'foreman', 'timesheet_incharge', 'manager'].some(role => hasRole(role));
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
  const [showBulkSubmitDialog, setShowBulkSubmitDialog] = useState(false);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const isFirstMount = useRef(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'date' | null>('date');
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

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

  // Sort timesheetsData by date
  const sortedTimesheetsData = [...timesheetsData].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const handleSort = (field: 'date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const canCreateTimesheet = hasPermission('timesheets.create');
  const canEditTimesheet = hasPermission('timesheets.edit');
  const canDeleteTimesheet = hasPermission('timesheets.delete');
  const canApproveTimesheet = hasPermission('timesheets.approve');

  // Determine if user is admin
  // const isAdmin = auth?.user?.roles?.includes('admin');

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

  // Restore missing functions and logic, using canBulkSubmit instead of isAdmin
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
        onError: (errors: any) => {
          toast(errors.error || 'Failed to approve timesheets');
          setBulkProcessing(false);
        },
      });
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      if (canBulkSubmit) {
        // Bulk submitter: select all eligible timesheets
        const eligible = timesheetsData.filter(ts => ['draft', 'rejected', 'submitted'].includes(ts.status)).map(ts => ts.id);
        setSelectedTimesheets(eligible);
      } else {
        // Non-bulk: select only submitted timesheets
        const submitted = timesheetsData.filter(ts => ts.status === 'submitted').map(ts => ts.id);
        setSelectedTimesheets(submitted);
      }
    } else {
      setSelectedTimesheets([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTimesheets.length === 0) {
      toast(t('select_to_delete', 'Please select at least one timesheet to delete'));
      return;
    }
    setShowBulkDeleteDialog(true);
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

  // Restore toggleTimesheetSelection
  const toggleTimesheetSelection = (id: number, checked?: boolean | 'indeterminate') => {
    if (checked === undefined || checked === 'indeterminate') {
      setSelectedTimesheets(prev =>
        prev.includes(id)
          ? prev.filter(timesheetId => timesheetId !== id)
          : [...prev, id]
      );
    } else if (checked) {
      setSelectedTimesheets(prev =>
        prev.includes(id) ? prev : [...prev, id]
      );
    } else {
      setSelectedTimesheets(prev =>
        prev.filter(timesheetId => timesheetId !== id)
      );
    }
  };
  // Restore getStatusBadge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'manager_approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'foreman_approved':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Foreman Approved</Badge>;
      case 'incharge_approved':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Incharge Approved</Badge>;
      case 'checking_approved':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Checking Approved</Badge>;
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
              {selectedTimesheets.length === 0 && (
                <>
                  <CreateButton
                    resourceType="timesheets"
                    text={t('btn_create_timesheet')}
                    href="/hr/timesheets/create"
                  />
                  <Button asChild variant="outline">
                    <a href={route('timesheets.summary')}>
                      {t('btn_timesheet_summary', 'Summary')}
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={route('timesheets.monthly')}>
                      {t('btn_monthly_summary', 'Monthly Summary')}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/timesheets/create-missing', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                        });
                        if (res.ok) {
                          toast.success(t('Created missing timesheets'));
                          reloadPage();
                        } else {
                          toast.error(t('Failed to create missing timesheets'));
                        }
                      } catch (e) {
                        toast.error(t('Failed to create missing timesheets'));
                      }
                    }}
                  >
                    {t('btn_create_missing_timesheets', 'Create Missing Timesheets')}
                  </Button>
                  <Button
                    variant="default"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/timesheets/auto-generate', { method: 'POST' });
                        if (res.ok) {
                          toast.success('Auto-generated timesheets successfully');
                          reloadPage();
                        } else {
                          toast.error('Failed to auto-generate timesheets');
                        }
                      } catch (e) {
                        toast.error('Failed to auto-generate timesheets');
                      }
                    }}
                  >
                    Auto Generate Timesheets
                  </Button>
                </>
              )}
              {/* Bulk action buttons only when selection is active */}
              {canApproveTimesheet && selectedTimesheets.length > 0 && (
                <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={bulkProcessing}
                      variant="default"
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      {t('btn_approve_selected')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Timesheets</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {selectedTimesheets.length} selected timesheets?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={() => {
                            setBulkProcessing(true);
                            router.post(route('timesheets.bulk-approve'), {
                              timesheet_ids: selectedTimesheets
                            }, {
                              onSuccess: () => {
                                toast(`${selectedTimesheets.length} timesheets approved successfully`);
                                setSelectedTimesheets([]);
                                setBulkProcessing(false);
                                setShowBulkApproveDialog(false);
                              },
                              onError: (errors: any) => {
                                toast(errors.error || 'Failed to approve timesheets');
                                setBulkProcessing(false);
                                setShowBulkApproveDialog(false);
                              },
                            });
                          }}
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
                              Approve
                            </>
                          )}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {canBulkSubmit && selectedTimesheets.length > 0 && (
                <AlertDialog open={showBulkSubmitDialog} onOpenChange={setShowBulkSubmitDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={bulkProcessing}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Submit Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Timesheets</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit {selectedTimesheets.length} selected timesheets?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        asChild
                      >
                        <Button
                          onClick={async () => {
                            setBulkProcessing(true);
                            try {
                              const res = await fetch(route('timesheets.bulk-submit'), {
                                method: 'POST',
                                headers: {
                                  'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                                  'Accept': 'application/json',
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ timesheet_ids: selectedTimesheets }),
                              });
                              const data = await res.json();
                              if (res.ok && data.success) {
                                toast.success(`${data.submitted ?? selectedTimesheets.length} timesheets submitted successfully`);
                                setSelectedTimesheets([]);
                                reloadPage();
                              } else if (res.ok && data.submitted === 0) {
                                toast.error(data.error || 'No timesheets were submitted. Please check the status of selected timesheets.');
                              } else {
                                toast.error((data && data.error) ? data.error : `Failed to submit timesheets. Response: ${JSON.stringify(data)}`);
                              }
                            } catch (e: any) {
                              toast.error(e.message || 'Failed to submit timesheets');
                            } finally {
                              setBulkProcessing(false);
                              setShowBulkSubmitDialog(false);
                            }
                          }}
                          disabled={bulkProcessing}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {bulkProcessing ? (
                            <>
                              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                              {t('btn_processing')}
                            </>
                          ) : (
                            <>
                              <CheckIcon className="mr-2 h-4 w-4" />
                              Submit
                            </>
                          )}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {canDeleteTimesheet && selectedTimesheets.length > 0 && (
                <>
                  <Button
                    variant="destructive"
                    disabled={bulkProcessing}
                    onClick={handleBulkDelete}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    {t('btn_delete_selected')}
                  </Button>
                  <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_confirm', 'Are you sure you want to delete the selected timesheets?')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('delete_warning', 'This action cannot be undone.')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkProcessing}>{t('btn_cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              setBulkProcessing(true);
                              try {
                                const res = await fetch('/api/timesheets/bulk-delete', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ids: selectedTimesheets }),
                                });
                                if (res.ok) {
                                  toast.success(t('bulk_delete_success', 'Timesheets deleted successfully'));
                                  reloadPage();
                                  setSelectedTimesheets([]);
                                } else {
                                  const data = await res.json();
                                  toast.error(data.error || t('bulk_delete_failed', 'Failed to delete timesheets'));
                                }
                              } catch (e) {
                                toast.error(t('bulk_delete_failed', 'Failed to delete timesheets'));
                              } finally {
                                setBulkProcessing(false);
                                setShowBulkDeleteDialog(false);
                              }
                            }}
                            disabled={bulkProcessing}
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
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
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
                      handleSearchWithStatus(value);
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

            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    {((canApproveTimesheet && !canBulkSubmit) || canBulkSubmit) && (
                      <TableHead className="w-[60px]">
                        <Checkbox
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          checked={
                            canBulkSubmit
                              ? timesheetsData.length > 0 && timesheetsData.every(
                                  timesheet => selectedTimesheets.includes(timesheet.id)
                                )
                              : timesheetsData.filter(t => t.status === 'submitted').length > 0 &&
                                timesheetsData.filter(t => t.status === 'submitted').every(
                                  timesheet => selectedTimesheets.includes(timesheet.id)
                                )
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead>{t('lbl_employee_column')}</TableHead>
                    <TableHead onClick={() => handleSort('date')} className="cursor-pointer select-none">
                      {t('lbl_date_column')}
                      {sortField === 'date' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </TableHead>
                    <TableHead>{t('lbl_hours_column')}</TableHead>
                    <TableHead>{t('lbl_overtime_column')}</TableHead>
                    <TableHead>{t('lbl_project_column')}</TableHead>
                    <TableHead>{t('lbl_status_column')}</TableHead>
                    <TableHead className="text-right">{t('lbl_actions_column')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTimesheetsData.length === 0 ? (
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
                    sortedTimesheetsData.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        {((canApproveTimesheet && !canBulkSubmit) || canBulkSubmit) && (
                          <TableCell>
                            <Checkbox
                              checked={selectedTimesheets.includes(timesheet.id)}
                              onChange={(e) => toggleTimesheetSelection(timesheet.id, e.target.checked)}
                              disabled={canBulkSubmit ? !['draft', 'rejected', 'submitted'].includes(timesheet.status) : timesheet.status !== 'submitted'}
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
                          {(timesheet.project?.name && timesheet.rental?.equipment?.name)
                            ? `${timesheet.project.name} / ${timesheet.rental.equipment.name}`
                            : timesheet.project?.name
                              ? timesheet.project.name
                              : timesheet.rental?.equipment?.name
                                ? timesheet.rental.equipment.name
                                : t('not_assigned')
                          }
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
                                <ApprovalDialog
                                  timesheet={timesheet}
                                  action="approve"
                                  onSuccess={() => {
                                    // Reload the page to show updated data
                                    reloadPage();
                                  }}
                                  trigger={
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="outline" size="icon">
                                            <CheckIcon className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{t('approve_timesheet', 'Approve Timesheet')}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  }
                                />

                                <ApprovalDialog
                                  timesheet={timesheet}
                                  action="reject"
                                  onSuccess={() => {
                                    // Reload the page to show updated data
                                    reloadPage();
                                  }}
                                  trigger={
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="outline" size="icon">
                                            <XIcon className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{t('reject_timesheet', 'Reject Timesheet')}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  }
                                />
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
                  Showing {(timesheets.current_page - 1) * timesheets.per_page + 1} to {Math.min(timesheets.current_page * timesheets.per_page, timesheets.total)} of {timesheets.total} results
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
                    Page {timesheets.current_page} of {timesheets.last_page}
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

















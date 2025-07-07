import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from '@/Core/types';
import { AppLayout } from '@/Core';
import { format } from "date-fns";
import { ErrorAlert } from "@/Core";
import { toast } from 'sonner';
import { ErrorBoundary } from "@/Core";
import { usePermission } from "@/Core";

// Shadcn UI Components
import { Button } from "@/Core";
import { Badge } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Core";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/Core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Core";
import { Checkbox } from "@/Core";
import { Separator } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import { Input } from "@/Core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Core";
import { Progress } from "@/Core";

// Icons
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Home,
  Info,
  Pencil,
  Plus,
  Search,
  Sheet,
  Trash,
  User,
  AlertCircle,
  UserX
} from "lucide-react";

import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Props extends PageProps {
  rental: any;
  timesheets: any[];
  debug?: {
    problemTimesheets: Array<{
      id: number;
      date: string;
      rental_item_id: number;
      rental_item_exists?: boolean;
      equipment_id?: number;
      equipment_exists?: boolean;
      problem: string;
    }>;
    rentalId: number;
    timesheetsCount: number;
  };
}

export default function ForRental({ auth, rental, timesheets, debug }: Props) {
  const { t } = useTranslation('rental');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isMissingDatesDialogOpen, setIsMissingDatesDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isProblemDialogOpen, setIsProblemDialogOpen] = useState(false);
  const [timesheetToMarkAbsent, setTimesheetToMarkAbsent] = useState<number | null>(null);
  const [isAbsentDialogOpen, setIsAbsentDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get permission hook
  const { hasPermission } = usePermission();
  const canEdit = hasPermission('rental-timesheets.edit');

  // Calculate total hours for all timesheets
  const totalHours = timesheets.reduce(
    (sum, timesheet) => sum + (timesheet.hours_used ? parseFloat(String(timesheet.hours_used)) : 0),
    0
  );

  // Filter timesheets by status, using type-safe comparisons
  const completedTimesheets = timesheets.filter(t => t.status === 'completed' as boolean);
  const pendingTimesheets = timesheets.filter(t => t.status === 'pending' as boolean);
  const activeTimesheets = timesheets.filter(t => t.status === 'active' as boolean);

  // Get filtered timesheets
  const getFilteredTimesheets = () => {
    // If no filter is active, return all timesheets
    if (statusFilter === "all" && search.trim() === '') {
      return timesheets;
    }

    // Apply status filter
    let filtered = timesheets;
    if (statusFilter && statusFilter !== "all") {
      filtered = timesheets.filter(timesheet => timesheet.status === statusFilter as boolean);
    }

    // Apply search filter if search term exists
    if (search.trim() !== '') {
      filtered = filtered.filter(timesheet => {
        const searchLower = search.toLowerCase();
        const equipmentName = timesheet.rentalItem?.equipment?.name?.toLowerCase() || "";
        const operatorName = timesheet.operator
          ? `${(timesheet.operator as any).first_name || ""} ${(timesheet.operator as any).last_name || ""}`.toLowerCase()
          : "";
        const date = format(new Date(timesheet.date), "MMM dd, yyyy").toLowerCase();

        return equipmentName.includes(searchLower) ||
          operatorName.includes(searchLower) ||
          date.includes(searchLower);
      });
    }

    return filtered;
  };

  const filteredTimesheets = getFilteredTimesheets();

  // Pagination logic
  const totalPages = Math.ceil(filteredTimesheets.length / pageSize);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get status badge with appropriate color and icon
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format time
  const formatTime = (time: string | null) => {
    if (!time) return "-";

    try {
      // Check if the time is just a time string (HH:MM or HH:MM:SS)
      if (typeof time === 'string') {
        // Try to parse as ISO datetime first
        const isoDate = new Date(time);
        if (!isNaN(isoDate.getTime())) {
          return format(isoDate, "h:mm a");
        }

        // If not ISO, try as time string
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
          const [hours, minutes] = time.split(':');
          const dummyDate = new Date();
          dummyDate.setHours(parseInt(hours, 10));
          dummyDate.setMinutes(parseInt(minutes, 10));
          return format(dummyDate, "h:mm a");
        }
      }


      return "-";
    } catch (error) {

      return "-";
    }
  };

  // Toggle selection of a timesheet
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Select/deselect all active timesheets
  const selectAll = () => {
    const activeTimesheetIds = filteredTimesheets
      .filter(timesheet => timesheet.status !== 'completed' as boolean)
      .map(timesheet => timesheet.id);

    if (activeTimesheetIds.length > 0 && selectedIds.length === activeTimesheetIds.length) {
      // If all active timesheets are already selected, deselect all
      setSelectedIds([]);
    } else {
      // Otherwise, select all active timesheets
      setSelectedIds(activeTimesheetIds);
    }
  };

  // Complete selected timesheets
  const completeSelectedTimesheets = () => {
    if (selectedIds.length === 0) {
      toast.error("No timesheets selected");
      return;
    }

    router.post(route("rental-timesheets.bulk-complete"), {
      timesheet_ids: selectedIds
    }, {
      onSuccess: () => {
        toast.success("Timesheets completed successfully");
        setSelectedIds([]);
        setIsCompleteDialogOpen(false);
      },
      onError: () => toast.error("Failed to complete timesheets")
    });
  };

  // Delete a timesheet
  const deleteTimesheet = (id: number) => {
    // Use the Dialog instead of confirm
    setTimesheetToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Execute delete timesheet
  const confirmDeleteTimesheet = () => {
    if (timesheetToDelete) {
      router.delete(route("rental-timesheets.destroy", timesheetToDelete), {
        onSuccess: () => {
          toast.success("Timesheet deleted successfully");
          setIsDeleteDialogOpen(false);
          router.reload();
        },
        onError: (errors) => {
          toast.error(errors.message || "Failed to delete timesheet");
          setIsDeleteDialogOpen(false);
        }
      });
    }
  };

  // Bulk delete timesheets
  const bulkDeleteTimesheets = () => {
    if (selectedIds.length === 0) {
      toast.error("No timesheets selected");
      return;
    }

    router.post(route("rental-timesheets.bulk-delete"), {
      timesheet_ids: selectedIds
    }, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} timesheets deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteDialogOpen(false);
        router.reload();
      },
      onError: () => toast.error("Failed to delete timesheets")
    });
  };

  // Complete a single timesheet
  const completeTimesheet = (id: number) => {
    router.put(route("rental-timesheets.complete", id), {}, {
      onSuccess: () => {
        toast.success("Timesheet completed successfully");
        router.reload();
      },
      onError: () => toast.error("Failed to complete timesheet")
    });
  };

  // Check Missing Timesheets
  const checkMissingTimesheets = () => {
    router.get(route("rental-timesheets.check-missing", rental.id), {}, {
      onSuccess: () => toast.success("Timesheet check completed"),
      onError: () => toast.error("Failed to check timesheets")
    });
    setIsMissingDatesDialogOpen(false);
  };

  // Mark an operator as absent
  const markOperatorAbsent = (id: number) => {
    setTimesheetToMarkAbsent(id);
    setIsAbsentDialogOpen(true);
  };

  // Confirm marking operator as absent
  const confirmMarkOperatorAbsent = () => {
    if (timesheetToMarkAbsent) {
      router.put(route("rental-timesheets.mark-absent", timesheetToMarkAbsent), {}, {
        onSuccess: () => {
          toast.success("Operator marked as absent for this timesheet");
          setIsAbsentDialogOpen(false);
          router.reload();
        },
        onError: (errors) => {
          toast.error(errors.message || "Failed to mark operator as absent");
          setIsAbsentDialogOpen(false);
        }
      });
    }
  };

  // Get operator status badge
  const getOperatorStatusBadge = (timesheet: any) => {
    if (timesheet.operator_absent) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 mt-1">
          Absent
        </Badge>
      );
    }
    return null;
  };

  // Update stats cards
  const statCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="flex flex-col gap-2 items-center justify-center bg-muted/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground">{t('total_hours_used')}</h3>
        <p className="text-2xl font-bold">
          {typeof totalHours === 'number'
            ? totalHours.toFixed(1)
            : parseFloat(String(totalHours || 0)).toFixed(1)}
        </p>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center bg-muted/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground">{t('total_timesheets')}</h3>
        <p className="text-2xl font-bold">{timesheets.length}</p>
        {completedTimesheets.length > 0 && (
          <Badge variant="outline" className="mt-1">
            {completedTimesheets.length} completed
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center justify-center bg-muted/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            {completedTimesheets.length} Completed
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            {pendingTimesheets.length} Pending
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            {activeTimesheets.length} Active
          </Badge>
        </div>
      </div>
    </div>
  );

  // Check for problems
  const hasProblems = debug && debug.problemTimesheets && debug.problemTimesheets.length > 0;

  return (
    <ErrorBoundary>
      <AppLayout>
        <Head title={`Timesheets for Rental ${rental.rental_number}`} />

        <div className="container mx-auto py-6 space-y-6">
          {/* Breadcrumbs and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground mb-4 sm:mb-0">
              <Link href={route("dashboard")} className="flex items-center hover:text-primary transition-colors">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href={route("rentals.index")} className="hover:text-primary transition-colors">
                Rentals
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href={route("rentals.show", rental.id)} className="hover:text-primary transition-colors">
                {rental.rental_number}
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="font-medium text-foreground">Timesheets</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={route("rentals.show", rental.id)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Rental
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={route("rental-timesheets.create", { rental_id: rental.id })}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('employee:btn_add_timesheet')}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMissingDatesDialogOpen(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Check Missing Dates
              </Button>
              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsCompleteDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          </div>

          <ErrorAlert />

          {/* Rental Header */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h1 className="text-xl font-medium tracking-tight flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                    Timesheets for Rental #{rental.rental_number}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    customer: {rental.customer?.company_name} � Status: {rental.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rental.has_timesheet ? "default" : "outline"}>
                    {timesheets.length} Timesheets
                  </Badge>
                  {getStatusBadge(rental.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('total_timesheets')}</p>
                    <p className="text-2xl font-bold">{timesheets.length}</p>
                  </div>
                  <Sheet className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('total_hours')}</p>
                    <p className="text-2xl font-bold">
                      {typeof totalHours === 'number'
                        ? totalHours.toFixed(1)
                        : parseFloat(String(totalHours || 0)).toFixed(1)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedTimesheets.length}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending/Active</p>
                    <p className="text-2xl font-bold">{pendingTimesheets.length + activeTimesheets.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timesheets Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Timesheets
                </CardTitle>
              </div>
              <CardDescription>
                Track equipment usage hours for this rental
              </CardDescription>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('ph_search_equipment_operator')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder={t('ph_filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {(statusFilter !== "all" || search !== "") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStatusFilter("all");
                        setSearch("");
                      }}
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  )}

                  {timesheets.length > 0 && (
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      {selectedIds.length === filteredTimesheets.filter(t => t.status !== 'completed' as boolean).length &&
                      selectedIds.length > 0 ? "Deselect All" : "Select All Active"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timesheets.length === 0 ? (
                <div className="py-16 text-center border rounded-md">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-4">No timesheets have been created for this rental yet.</p>
                  <Button asChild>
                    <Link href={route("rental-timesheets.create", { rental_id: rental.id })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Timesheet
                    </Link>
                  </Button>
                </div>
              ) : filteredTimesheets.length === 0 ? (
                <div className="py-16 text-center border rounded-md">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-4">No timesheets match your search criteria.</p>
                  <Button variant="outline" onClick={() => {
                    setStatusFilter("all");
                    setSearch("");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[5%]"></TableHead>
                        <TableHead className="w-[15%]">Equipment</TableHead>
                        <TableHead className="w-[15%]">Date</TableHead>
                        <TableHead className="w-[15%]">Hours</TableHead>
                        <TableHead className="w-[15%]">Operator</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[20%] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTimesheets.map((timesheet) => (
                        <TableRow key={timesheet.id}>
                          <TableCell>
                            {timesheet.status !== 'completed' as boolean && (
                              <Checkbox
                                checked={selectedIds.includes(timesheet.id)}
                                onCheckedChange={() => toggleSelection(timesheet.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {timesheet.rentalItem?.equipment ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {timesheet.rentalItem.equipment.name || 'Unnamed Equipment'}
                                </span>
                                {timesheet.rentalItem.equipment.serial_number && (
                                  <span className="text-xs text-muted-foreground">
                                    SN: {timesheet.rentalItem.equipment.serial_number}
                                  </span>
                                )}
                              </div>
                            ) : timesheet.equipment ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {timesheet.equipment.name || 'Unnamed Equipment'}
                                </span>
                                {timesheet.equipment.serial_number && (
                                  <span className="text-xs text-muted-foreground">
                                    SN: {timesheet.equipment.serial_number}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-amber-600 font-medium">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                      <Info className="h-3 w-3" />
                                      <span>
                                        {timesheet.rentalItem
                                          ? "Equipment Data Missing"
                                          : "Unknown Rental Item"}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      {timesheet.rentalItem ? (
                                        <>
                                          <p>This rental item is missing equipment data.</p>
                                          <p className="text-xs mt-1">
                                            Rental Item ID: {String(timesheet.rental_item_id)}
                                          </p>
                                          <p className="text-xs mt-1">
                                            Equipment ID: {timesheet.rentalItem.equipment_id
                                              ? String(timesheet.rentalItem.equipment_id)
                                              : "Missing"}
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <p>This timesheet has no rental item associated with it.</p>
                                          <p className="text-xs mt-1">
                                            Timesheet ID: {String(timesheet.id)}
                                          </p>
                                          <p className="text-xs mt-1">
                                            Rental Item ID: {timesheet.rental_item_id
                                              ? String(timesheet.rental_item_id)
                                              : "Missing"}
                                          </p>
                                        </>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(timesheet.date), "EEE, MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {timesheet.start_time || timesheet.end_time ? (
                              <span className="text-xs">
                                {timesheet.start_time && timesheet.end_time ? (
                                  <>
                                    {formatTime(timesheet.start_time)} - {formatTime(timesheet.end_time)}
                                    <p className="text-muted-foreground mt-1">
                                      {timesheet.hours_used} hours
                                    </p>
                                    <div className="w-full mt-1">
                                      <Progress
                                        value={Math.min((timesheet.hours_used ? parseFloat(String(timesheet.hours_used)) : 0) / 8 * 100, 100)}
                                        className="h-1"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {formatTime(timesheet.start_time || timesheet.end_time)}
                                    <p className="text-muted-foreground mt-1">
                                      {timesheet.hours_used} hours
                                    </p>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span>{timesheet.hours_used} hours</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {timesheet.operator_absent ? (
                              <div className="flex flex-col">
                                <span className="font-medium flex items-center gap-1 text-red-600">
                                  <UserX className="h-3 w-3 text-red-600" />
                                  <span>{t('operator_absent')}</span>
                                </span>
                              </div>
                            ) : timesheet.operator ? (
                              <div className="flex flex-col">
                                <span className="font-medium flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {(timesheet.operator as any).first_name || ''} {(timesheet.operator as any).last_name || ''}
                                </span>
                                {getOperatorStatusBadge(timesheet)}
                              </div>
                            ) : timesheet.rentalItem?.operator ? (
                              <div className="flex flex-col">
                                <span className="font-medium flex items-center gap-1 text-amber-600">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {timesheet.rentalItem.operator.first_name} {timesheet.rentalItem.operator.last_name}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-3 w-3 ml-1" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm">
                                        <p>Using operator from rental item (default operator)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </span>
                                {getOperatorStatusBadge(timesheet)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                <span>{t('no_operator_assigned')}</span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(timesheet.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Complete button - only visible for non-completed timesheets */}
                              {timesheet.status !== 'completed' as boolean && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => completeTimesheet(timesheet.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}

                              {/* View button - always visible */}
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={route('rental-timesheets.show', timesheet.id)}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>

                              {/* Edit button - only visible for non-completed timesheets */}
                              {canEdit && timesheet.status !== 'completed' as boolean && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={route('rental-timesheets.edit', timesheet.id)}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}

                              {/* Delete button - visible for all timesheets regardless of status */}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTimesheet(timesheet.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Mark Absent button - only visible for timesheets with operators that aren't already marked absent */}
                              {canEdit &&
                               timesheet.status !== 'completed' as boolean &&
                               (timesheet.operator || timesheet.rentalItem?.operator) &&
                               !timesheet.operator_absent && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => markOperatorAbsent(timesheet.id)}
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <UserX className="h-4 w-4 text-red-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('mark_operator_as_absent')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination controls */}
              {filteredTimesheets.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 text-sm border-t pt-4">
                  <div className="text-muted-foreground">
                    Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, filteredTimesheets.length)}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filteredTimesheets.length)}</span> of{" "}
                    <span className="font-medium">{filteredTimesheets.length}</span> timesheets
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground whitespace-nowrap">Items per page:</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-16">
                          <SelectValue>{pageSize}</SelectValue>
                        </SelectTrigger>
                        <SelectContent side="top" align="center">
                          {[5, 10, 20, 50].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bulk Complete Confirmation Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_confirm_completion')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark {selectedIds.length} timesheets as completed?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={completeSelectedTimesheets}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Complete All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check Missing Dates Dialog */}
        <Dialog open={isMissingDatesDialogOpen} onOpenChange={setIsMissingDatesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_check_missing_timesheets')}</DialogTitle>
              <DialogDescription>
                This will check for any missing timesheets from the rental start date until today and create placeholder entries.
                <p className="mt-2 text-sm">
                  Start Date: <span className="font-medium">{rental.start_date ? format(new Date(rental.start_date), "MMM dd, yyyy") : "Not set"}</span>
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMissingDatesDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={checkMissingTimesheets}
              >
                <Clock className="mr-2 h-4 w-4" />
                Check Missing Dates
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Timesheet Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_delete_timesheet')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this timesheet?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteTimesheet}
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('ttl_delete_timesheet')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_bulk_delete_timesheets')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedIds.length} timesheets?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={bulkDeleteTimesheets}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete {selectedIds.length} Timesheets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark Operator Absent Dialog */}
        <Dialog open={isAbsentDialogOpen} onOpenChange={setIsAbsentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_mark_operator_as_absent')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark the operator as absent for this timesheet?
                This will record that the equipment was not used on this date due to operator absence.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAbsentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmMarkOperatorAbsent}
                className="bg-red-600 hover:bg-red-700"
              >
                <UserX className="mr-2 h-4 w-4" />
                Mark as Absent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Debugging Information */}
        {debug && debug.problemTimesheets && debug.problemTimesheets.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-amber-600">{t('ttl_debugging_information')}</CardTitle>
              <CardDescription>
                Found {debug.problemTimesheets.length} problematic timesheets out of {debug.timesheetsCount} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead>{t('th_rental_item_id')}</TableHead>
                      <TableHead>Item Exists?</TableHead>
                      <TableHead>{t('th_equipment_id')}</TableHead>
                      <TableHead>Equipment Exists?</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debug.problemTimesheets.map((problem) => (
                      <TableRow key={problem.id} className="bg-amber-50">
                        <TableCell>{problem.id}</TableCell>
                        <TableCell>{format(new Date(problem.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">{problem.problem}</TableCell>
                        <TableCell>{problem.rental_item_id}</TableCell>
                        <TableCell>{problem.rental_item_exists !== undefined ? (problem.rental_item_exists ? "Yes" : "No") : "N/A"}</TableCell>
                        <TableCell>{problem.equipment_id || "N/A"}</TableCell>
                        <TableCell>{problem.equipment_exists !== undefined ? (problem.equipment_exists ? "Yes" : "No") : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </AppLayout>
    </ErrorBoundary>
  );
}

















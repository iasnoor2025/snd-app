import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
// Placeholder types
type PageProps = any;
type Employee = any;
type Rental = any;
type RentalItem = any;
type RentalTimesheet = any;
import { AppLayout } from '@/Core';
import { formatDate } from "@/Core";
// Placeholder usePermission hook
const usePermission = () => ({ hasPermission: () => true });

// Shadcn UI Components
import { Button } from "@/Core";
import { Badge } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import { Input } from "@/Core";
import { Checkbox } from "@/Core";
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Separator } from "@/Core";
import { Calendar } from "@/Core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Core";

// Icons
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit,
  Eye,
  Filter,
  Home,
  Info,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Trash,
  User,
  UserX,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/Core";
import { format, parseISO } from "date-fns";
import { Pagination } from "@/Core";
// Placeholder for ColumnDef
type ColumnDef = any;
import { formatCurrency } from "@/Core";

interface Props extends PageProps {
  timesheets: {
    data: RentalTimesheet[];
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
  filters?: {
    rental_id?: string;
    operator_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  };
}

export default function Index({ auth, timesheets, filters = {} }: Props) {
  const { t } = useTranslation('rental');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { hasPermission } = usePermission();
  const [filterValues, setFilterValues] = useState({
    rental_id: filters.rental_id || "",
    operator_id: filters.operator_id || "",
    status: filters.status || "",
    start_date: filters.start_date ? new Date(filters.start_date) : undefined,
    end_date: filters.end_date ? new Date(filters.end_date) : undefined,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    router.get(route('rental-timesheets.index'), {
      rental_id: filterValues.rental_id,
      operator_id: filterValues.operator_id,
      status: filterValues.status,
      start_date: filterValues.start_date ? format(filterValues.start_date, 'yyyy-MM-dd') : '',
      end_date: filterValues.end_date ? format(filterValues.end_date, 'yyyy-MM-dd') : '',
    });
  };

  const resetFilters = () => {
    setFilterValues({
      rental_id: "",
      operator_id: "",
      status: "",
      start_date: undefined,
      end_date: undefined,
    });
    router.get(route('rental-timesheets.index'));
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: CheckedState) => {
    if (checked) {
      setSelectedIds(timesheets.data.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkComplete = () => {
    router.post(route('rental-timesheets.bulk-complete'), {
      timesheet_ids: selectedIds
    }, {
      onSuccess: () => {
        setIsCompleteDialogOpen(false);
        setSelectedIds([]);
        toast.success("Selected timesheets completed successfully");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "—";

    try {
      // Check if the time is just a time string (HH:MM or HH:MM:SS)
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
        // It's a time-only string, add a dummy date
        const [hours, minutes] = time.split(':');
        const dummyDate = new Date();
        dummyDate.setHours(parseInt(hours, 10));
        dummyDate.setMinutes(parseInt(minutes, 10));
        return format(dummyDate, "h:mm a");
      }

      // Otherwise try to parse it as a normal date
      const parsedDate = new Date(time);
      if (isNaN(parsedDate.getTime())) {

        return "—";
      }

      return format(parsedDate, "h:mm a");
    } catch (error) {

      return "—";
    }
  };

  // Check if user has edit permission
  const canEdit = hasPermission('rental-timesheets.edit');
  const canDelete = hasPermission('rental-timesheets.delete');

  let deleteId: number | null = null;
  const handleDelete = () => {
    if (deleteId !== null) {
      if (window.confirm('Are you sure you want to delete this timesheet?')) {
        router.delete(route('rental-timesheets.destroy', deleteId), {
          onSuccess: () => {
            toast.success('Timesheet deleted successfully');
          },
          onError: (errors) => {
            toast.error(`Failed to delete timesheet: ${Object.values(errors).join(", ")}`);
          }
        });
      }
      deleteId = null;
    }
  };

  // Map status to allowed Badge variants
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Define a function to render operator information
  const renderOperator = (timesheet: RentalTimesheet) => {
    if (timesheet.operator_absent) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <UserX className="h-4 w-4" />
          <span>{t('operator_absent')}</span>
        </div>
      );
    }

    if (timesheet.operator) {
      return (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{(timesheet.operator as any).first_name || ''} {(timesheet.operator as any).last_name || ''}</span>
        </div>
      );
    }

    if (timesheet.rentalItem?.operator) {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{timesheet.rentalItem.operator.first_name} {timesheet.rentalItem.operator.last_name}</span>
        </div>
      );
    }

    return <span className="text-muted-foreground text-sm">{t('not_assigned')}</span>;
  };

  const columns: ColumnDef[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }: any) => formatDate(row.original.date),
    },
    {
        accessorKey: 'operator',
        header: 'Operator',
        cell: ({ row }: any) => renderOperator(row.original),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: any) => (
            <Badge variant={getStatusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
    },
    {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ row }: any) => formatCurrency(row.original.rate),
    },
    {
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: ({ row }: any) => formatCurrency(row.original.total_amount),
    },
    {
        id: 'actions',
        cell: ({ row }: any) => {
            const timesheet = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('open_menu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={route('rental-timesheets.show', timesheet.id)}>
                                View
                            </Link>
                        </DropdownMenuItem>
                        {canEdit && timesheet.status === 'pending' && (
                            <DropdownMenuItem asChild>
                                <Link href={route('rental-timesheets.edit', timesheet.id)}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <DropdownMenuItem onClick={() => { deleteId = timesheet.id; handleDelete(); }} className="text-destructive">
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];

  return (
    <AppLayout>
      <Head title={t('rental_timesheets')} />

      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumbs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground mb-4 sm:mb-0">
            <Link href={route("dashboard")} className="flex items-center hover:text-primary transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">{t('rental_timesheets')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltering(!isFiltering)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.reload()}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Link href={route('rental-timesheets.create')}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Timesheet
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {isFiltering && (
          <Card>
            <CardHeader>
              <CardTitle>{t('ttl_filter_timesheets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('lbl_rental_id')}</label>
                  <Input
                    placeholder={t('lbl_rental_id')}
                    value={filterValues.rental_id}
                    onChange={(e) => handleFilterChange('rental_id', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('lbl_operator_id')}</label>
                  <Input
                    placeholder={t('lbl_operator_id')}
                    value={filterValues.operator_id}
                    onChange={(e) => handleFilterChange('operator_id', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filterValues.status || "all"}
                    onValueChange={(value) => {
                      handleFilterChange('status', value === "all" ? "" : value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('ph_filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('lbl_start_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filterValues.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterValues.start_date ? (
                          format(filterValues.start_date, "PPP")
                        ) : (
                          <span>{t('pick_a_date')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterValues.start_date}
                        onSelect={(date) => handleFilterChange('start_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('end_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filterValues.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterValues.end_date ? (
                          format(filterValues.end_date, "PPP")
                        ) : (
                          <span>{t('pick_a_date')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterValues.end_date}
                        onSelect={(date) => handleFilterChange('end_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timesheets List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('rental_timesheets')}</CardTitle>
            <CardDescription>
              Showing {timesheets.data.length} of {timesheets.total} timesheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-md">
                <span>{selectedIds.length} items selected</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsCompleteDialogOpen(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.length === timesheets.data.length && timesheets.data.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Rental</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No timesheets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheets.data.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(timesheet.id)}
                            onCheckedChange={(checked) => checked && handleCheckboxChange(timesheet.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(timesheet.date)}
                        </TableCell>
                        <TableCell>
                          {timesheet.rental?.rental_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {timesheet.rentalItem?.equipment?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {renderOperator(timesheet)}
                        </TableCell>
                        <TableCell>
                          {!timesheet.operator_absent ? (
                            <div className="text-xs">
                              {formatTime(timesheet.start_time)} - {formatTime(timesheet.end_time)}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                              Not Used
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(timesheet.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* View button - always visible */}
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={route('rental-timesheets.show', timesheet.id)}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {/* Edit and Delete buttons - visible for users with proper permissions */}
                            {canEdit && timesheet.status === 'pending' && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={route('rental-timesheets.edit', timesheet.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { deleteId = timesheet.id; handleDelete(); }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Complete button - only visible for non-completed timesheets */}
                            {timesheet.status !== 'completed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  router.post(route('rental-timesheets.complete', timesheet.id), {}, {
                                    onSuccess: () => toast.success('Timesheet completed successfully')
                                  });
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {timesheets.last_page > 1 && (
              <div className="mt-4">
                <Pagination currentPage={timesheets.current_page} totalPages={timesheets.last_page} onPageChange={() => {}} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ttl_complete_selected_timesheets')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedIds.length} timesheet(s) as completed?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkComplete}>
              Complete Timesheets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}















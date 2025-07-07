import React, { useState, useEffect } from "react";
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

// Types
import { PageProps } from "@/Core/types";
import { Errors } from "@inertiajs/core";

// Layouts & Hooks
import { AppLayout } from "@/Core";
import { usePermission } from "@/Core";

// UI Components
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Input } from "@/Core";
import { DataTable } from "@/Core";
import { DatePicker } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Core";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Core";

// Shared Components
import { CreateButton } from "@/Core";
import { CrudButtons } from "@/Core";

// Icons
import {
  CalendarClock,
  Eye,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash,
  UserRound,
  X,
  RefreshCw
} from "lucide-react";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

// Types
interface RentalItem {
  id: number;
  equipment_id: number;
  equipment_name: string;
  rate: number;
  rate_type: string;
  days: number;
}

interface Rental {
  id: number;
  rental_number: string;
  customer_name: string;
  customer_email: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;
  status: string;
  has_operators: boolean;
  total_amount: number;
  rental_items?: RentalItem[];
}

interface Props extends PageProps {
  rentals?: {
    data: Rental[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters?: {
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  };
}

const breadcrumbs = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Rentals", href: "/rentals" },
];

export default function Index({ auth, rentals, filters = {} }: Props) {
  // Debug: Check what props are being received
  // alert(`Debug: rentals=${JSON.stringify(rentals)}, filters=${JSON.stringify(filters)}`);

  const { t } = useTranslation('rental');

  // Debug logging
  console.log('Rentals data:', rentals);
  console.log('Filters:', filters);

  useEffect(() => {
    console.log('Rentals data:', rentals);
    console.log('Filters:', filters);
    if (rentals?.data?.length) {
      console.log('First rental:', rentals.data[0]);
      if (rentals.data[0]?.rental_items) {
        console.log('First rental items:', rentals.data[0].rental_items);
      } else {
        console.log('No rental items found for first rental');
      }
    } else {
      console.log('No rentals data available');
      console.log('Rentals object structure:', JSON.stringify(rentals, null, 2));
    }
  }, [rentals, filters]);

  const { hasPermission } = usePermission();
  const canCreateRentals = hasPermission('rentals.create');
  const canEditRentals = hasPermission('rentals.edit');
  const canDeleteRentals = hasPermission('rentals.delete');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);
  const { data, setData, get } = useForm({
    search: filters.search || '',
    status: filters.status || 'all',
    start_date: filters.start_date || '',
    end_date: filters.end_date || '',
  });

  // Debug route helper - use first rental ID from data if available
  const sampleRentalId = rentals?.data?.[0]?.id ?? 1;

  const handleDelete = (rentalOrId: Rental | number) => {
    // If a number was passed, find the rental in the data
    if (typeof rentalOrId === 'number') {
      const rental = rentals?.data?.find(r => r.id === rentalOrId);
      if (rental) {
        setRentalToDelete(rental);
      } else {
        console.error(`Rental with ID ${rentalOrId} not found`);
        toast.error("Rental not found");
        return;
      }
    } else {
      setRentalToDelete(rentalOrId);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!rentalToDelete) return;

    router.delete(route("rentals.destroy", rentalToDelete.id), {
      onSuccess: () => {
        toast.success("Rental deleted successfully");
        setIsDeleteDialogOpen(false);
        setRentalToDelete(null);
      },
      onError: (errors: Errors) => {
        toast.error("Failed to delete rental");
      },
    });
  };

  const handleSearch = () => {
    get(route('rentals.index'), {
      data: {
        search: data.search,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleReset = () => {
    setData({
      search: '',
      status: 'all',
      start_date: '',
      end_date: '',
    });
    get(route('rentals.index'), {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleStatusChange = (value: string) => {
    setData('status', value);
    handleSearch();
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setData('start_date', value);
    } else {
      setData('end_date', value);
    }
    handleSearch();
  };

  const applyDateFilter = (field: 'start' | 'end', value: string | null) => {
    let start = data.start_date || undefined;
    let end = data.end_date || undefined;

    if (field === 'start') {
      start = value || undefined;
    } else {
      end = value || undefined;
    }

    // Apply the filter immediately
    get(route('rentals.index'), {
      search: data.search || undefined,
      status: data.status === "all" ? undefined : data.status,
      start_date: start,
      end_date: end
    }, { preserveState: true });
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= rentals.last_page; i++) {
      pages.push(
        <Button
          key={i}
          variant={rentals.current_page === i ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setData('page', i.toString());
            handleSearch();
          }}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  const getClientInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateStatus = (rental: Rental) => {
    if (rental.status === "completed") return "completed";
    if (rental.status === "pending") return "pending";

    // If the rental is active and the expected end date is in the past, mark as overdue
    if (rental.status === "active") {
      const today = new Date();
      const endDate = new Date(rental.expected_end_date);
      if (endDate < today && !rental.actual_end_date) {
        return "overdue";
      }
      return "active";
    }

    return rental.status;
  };

  // Add a function to format date displays
  const formatFilterDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Count active filters to show the user how many are applied
  const getActiveFilterCount = () => {
    let count = 0;
    if (data.search) count++;
    if (data.status !== 'all') count++;
    if (data.start_date) count++;
    if (data.end_date) count++;
    return count;
  };

  // Function for direct navigation without router to ensure reliability
  const navigateDirectly = (rentalId: number | string) => {
    // Log navigation attempt for debugging
    console.log("NAVIGATION DEBUG - Attempting to navigate to rental ID:", rentalId);

    if (!rentalId) {
      console.error("Navigation error: Invalid rental ID");
      toast.error("Cannot view rental details: invalid rental ID");
      return;
    }

    try {
      // Use the route helper to get the URL
      const routeUrl = route("rentals.show", rentalId);
      console.log("NAVIGATION DEBUG - Route URL:", routeUrl);

      // Use router.get instead of visit for more reliable navigation
      router.get(routeUrl, {}, {
        preserveScroll: true,
        onBefore: () => {
          // Show loading indication to user
          toast.info("Loading rental details...");
          return true;
        },
        onSuccess: () => {
          // Clear loading toast when successful
          toast.dismiss();
        },
        onError: (errors) => {
          console.error("Navigation failed with errors:", errors);
          toast.error("Could not load rental details. The rental may no longer exist.");
          // Don't fallback to direct navigation in case of errors
          return false;
        },
      });
    } catch (error) {
      console.error("Navigation failed:", error);
      toast.error("Failed to navigate to rental details");

      // Additional fallback navigation method if router.get fails
      try {
        // More reliable navigation using window.location directly
        window.location.href = `/rentals/${rentalId}`;
      } catch (secondaryError) {
        console.error("Secondary navigation failed:", secondaryError);
        toast.error("All navigation methods failed. Please try refreshing the page.");
      }
    }
  };

  // Function to handle clicks on view buttons/links
  const handleViewClick = (e: React.MouseEvent, rentalId: number | string) => {
    // Prevent default link behavior
    e.preventDefault();

    // Log click for debugging
    console.log("View clicked for rental:", rentalId);

    // Navigate directly to the rental page
    navigateDirectly(rentalId);
  };

  // Add a function to safely get customer information
  const getCustomerInfo = (rental: Rental | any) => {
    // Check all possible paths where customer data might be found
    const customer = rental.customer || (rental as any).client;

    if (!customer) {
      return {
        name: rental.customer_name || 'Unknown Customer',
        email: rental.customer_email || 'No email',
        initials: getClientInitials(rental.customer_name) || '??'
      };
    }

    // Handle different property name variations for customer name
    const name = customer.company_name || customer.name || customer.contact_person || rental.customer_name || 'Unknown';
    const email = customer.email || rental.customer_email || 'No email';

    return {
      name,
      email,
      initials: getClientInitials(name)
    };
  };

  // Add this function to handle refreshing of all rental totals
  const refreshAllTotals = async () => {
    try {
      toast.info("Refreshing rental totals...");
      const response = await axios.get('/api/rentals/refresh-all-totals');
      if (response.data.success) {
        toast.success(`${response.data.message}`);
        // Reload the page to show updated totals
        router.reload();
      } else {
        toast.error("Failed to refresh totals");
      }
    } catch (error) {
      console.error("Error refreshing totals:", error);
      toast.error("An error occurred while refreshing totals");
    }
  };

  // Add this function to handle refreshing a single rental's total
  const refreshRentalTotal = async (rentalId: number) => {
    try {
      toast.info("Refreshing rental total...");
      const response = await axios.get(`/api/rentals/${rentalId}/refresh-total`);
      if (response.data.success) {
        toast.success("Rental total refreshed successfully");
        // Reload the page to show updated total
        router.reload();
      } else {
        toast.error("Failed to refresh rental total");
      }
    } catch (error) {
      console.error("Error refreshing rental total:", error);
      toast.error("An error occurred while refreshing the rental total");
    }
  };

  const columns = [
    {
      header: t("Rental Number"),
      accessorKey: "rental_number" as keyof Rental,
    },
    {
      header: t("Customer"),
      accessorKey: "customer_name" as keyof Rental,
      cell: (row: Rental) => {
        const customerInfo = getCustomerInfo(row);
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{customerInfo.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{customerInfo.name}</span>
              <span className="text-xs text-muted-foreground">{customerInfo.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: t("Dates"),
      accessorKey: "start_date" as keyof Rental,
      cell: (row: Rental) => (
        <div className="flex flex-col gap-1">
          <span>{row.start_date ? format(new Date(row.start_date), "MMM dd, yyyy") : "-"}</span>
          <span className="text-sm text-muted-foreground">
            {t("to")} {row.expected_end_date ? format(new Date(row.expected_end_date), "MMM dd, yyyy") : "-"}
          </span>
        </div>
      ),
    },
    {
      header: t("Status"),
      accessorKey: "status" as keyof Rental,
      cell: (row: Rental) => getStatusBadge(row.status),
    },
    {
      header: t("Total Amount"),
      accessorKey: "total_amount" as keyof Rental,
      cell: (row: Rental) => formatCurrency(row.total_amount),
    },
    {
      header: t("Actions"),
      accessorKey: "id" as keyof Rental,
      cell: (row: Rental) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleViewClick(e, row.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEditRentals && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.get(route("rentals.edit", row.id))}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDeleteRentals && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Rentals" breadcrumbs={breadcrumbs} requiredPermission="rentals.view">
      <Head title={t('ttl_rentals_management')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Rentals</CardTitle>
              <CardDescription>
                Manage your equipment rentals, track status, and process contracts.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={route("reporting.modules.rentals")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </Button>
              <CreateButton
                resourceType="rentals"
                buttonText="Create Rental"
                href="/rentals/create"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-6 space-y-4">
              <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('ph_search_by_rental_or_customer')}
                      value={data.search}
                      onChange={(e) => setData('search', e.target.value)}
                      className="w-full pl-9"
                      name="search"
                      id="search"
                    />
                    {data.search && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setData('search', '');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Select
                    value={data.status}
                    onValueChange={handleStatusChange}
                    name="status"
                  >
                    <SelectTrigger className="w-full" id="status">
                      <SelectValue placeholder={t('ph_filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="relative">
                    <CalendarClock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder={t('lbl_start_date')}
                      value={formatDateMedium(data.start_date)}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full pl-9"
                      name="start_date"
                      id="start_date"
                    />
                    {data.start_date && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setData('start_date', '');
                          applyDateFilter('start', null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CalendarClock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder={t('end_date')}
                      value={formatDateMedium(data.end_date)}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full pl-9"
                      name="end_date"
                      id="end_date"
                    />
                    {data.end_date && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setData('end_date', '');
                          applyDateFilter('end', null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button type="submit" variant="default">
                    <Search className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </form>

              {(data.search || data.status !== "all" || data.start_date || data.end_date) && (
                <div className="flex justify-between items-center pt-2 pb-1 border-t mt-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium">
                      Active Filters ({getActiveFilterCount()}):
                    </span>
                    {data.search && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">Search:</span> {data.search}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setData('search', '');
                            get(route('rentals.index'), {
                              status: data.status === "all" ? undefined : data.status,
                              start_date: data.start_date || undefined,
                              end_date: data.end_date || undefined
                            }, { preserveState: true });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {data.status !== "all" && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">Status:</span> {data.status}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setData('status', 'all');
                            get(route('rentals.index'), {
                              search: data.search || undefined,
                              start_date: data.start_date || undefined,
                              end_date: data.end_date || undefined
                            }, { preserveState: true });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {data.start_date && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">From:</span> {formatFilterDate(data.start_date)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setData('start_date', '');
                            applyDateFilter('start', null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {data.end_date && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">To:</span> {formatFilterDate(data.end_date)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setData('end_date', '');
                            applyDateFilter('end', null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <DataTable
                columns={columns}
                data={rentals?.data || []}
                onRowClick={(row) => router.get(route("rentals.show", row.id))}
              />
            </div>

            {rentals?.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {rentals?.current_page * rentals?.per_page - rentals?.per_page + 1} to {Math.min(rentals?.current_page * rentals?.per_page, rentals?.total)} of {rentals?.total} results
                </div>
                <div className="flex gap-2">
                  {renderPagination()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the rental contract
                and remove its data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}















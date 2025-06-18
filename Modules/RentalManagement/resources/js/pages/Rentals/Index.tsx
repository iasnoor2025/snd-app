import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from '@/types'; // Uncommented and adjusted
import AdminLayout from '@/layouts/AdminLayout';
import { format } from "date-fns";
import { usePermission } from '@/hooks/usePermission'; // Uncommented and adjusted path
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from 'react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateButton from '../../../../../../resources/js/components/shared/CreateButton';
import CrudButtons from '../../../../../../resources/js/components/shared/CrudButtons';

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

interface Props extends PageProps {
  rentals: {
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

const breadcrumbs  = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Rentals', href: '/rentals' },
];

export default function Index({ auth, rentals, filters = {} }: Props) {
  const { t } = useTranslation('rental');

  const { hasPermission } = usePermission();
  const canCreateRentals = hasPermission('rentals.create');
  const canEditRentals = hasPermission('rentals.edit');
  const canDeleteRentals = hasPermission('rentals.delete');

  // Debug rental data structure
  useEffect(() => {
    if (rentals?.data?.length > 0) {
      console.log('First rental data structure:', rentals.data[0]);
    }
  }, [rentals]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "all");
  const [startDateFilter, setStartDateFilter] = useState(filters.start_date || "");
  const [endDateFilter, setEndDateFilter] = useState(filters.end_date || "");

  // Debug route helper - use first rental ID from data if available
  const sampleRentalId = rentals?.data?.length > 0 ? rentals.data[0].id : 1;

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
      onError: () => {
        toast.error("Failed to delete rental");
      },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(1); // Always go to the first page on a new search
  };

  const applyFilters = (page: number = 1) => {
    router.get(
      route("rentals.index"),
      {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
        page: page,
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(1); // Apply filters and go to first page
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDateFilter(value);
      applyFilters(1); // Apply filters and go to first page
    } else {
      setEndDateFilter(value);
      applyFilters(1); // Apply filters and go to first page
    }
  };

  const applyDateFilter = (field: 'start' | 'end', value: string | null) => {
    let start = startDateFilter || undefined;
    let end = endDateFilter || undefined;

    if (field === 'start') {
      start = value || undefined;
    } else {
      end = value || undefined;
    }

    // Apply the filter immediately
    router.get(
      route("rentals.index"),
      {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        start_date: start,
        end_date: end
      },
      { preserveState: true }
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    applyFilters(1); // Reset filters and go to the first page
  };

  const handlePageChange = (page: number) => {
    applyFilters(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= rentals.last_page; i++) {
      pages.push(
        <Button
          key={i}
          variant={rentals.current_page === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
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
      return dateString;
    }
  };

  // Count active filters to show the user how many are applied
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "all") count++;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
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
        name: 'Unknown Customer',
        email: 'No email',
        initials: '??'
      };
    }

    // Handle different property name variations for customer name
    const name = customer.company_name || customer.name || customer.contact_person || 'Unknown';
    const email = customer.email || 'No email';

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

  return (
    <AdminLayout title="Rentals" breadcrumbs={breadcrumbs} requiredPermission="rentals.view">
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
                <Link href={route("reports.rentals")}>
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9"
                      name="search"
                      id="search"
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchTerm("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Select
                    value={statusFilter}
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
                      value={startDateFilter}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full pl-9"
                      name="start_date"
                      id="start_date"
                    />
                    {startDateFilter && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setStartDateFilter("");
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
                      value={endDateFilter}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full pl-9"
                      name="end_date"
                      id="end_date"
                    />
                    {endDateFilter && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          setEndDateFilter("");
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
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </form>

              {(searchTerm || statusFilter !== "all" || startDateFilter || endDateFilter) && (
                <div className="flex justify-between items-center pt-2 pb-1 border-t mt-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium">
                      Active Filters ({getActiveFilterCount()}):
                    </span>
                    {searchTerm && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">Search:</span> {searchTerm}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchTerm("");
                            router.get(
                              route("rentals.index"),
                              {
                                status: statusFilter === "all" ? undefined : statusFilter,
                                start_date: startDateFilter || undefined,
                                end_date: endDateFilter || undefined
                              },
                              { preserveState: true }
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">Status:</span> {statusFilter}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setStatusFilter("all");
                            router.get(
                              route("rentals.index"),
                              {
                                search: searchTerm || undefined,
                                start_date: startDateFilter || undefined,
                                end_date: endDateFilter || undefined
                              },
                              { preserveState: true }
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {startDateFilter && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">From:</span> {formatFilterDate(startDateFilter)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setStartDateFilter("");
                            applyDateFilter('start', null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {endDateFilter && (
                      <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        <span className="font-medium">To:</span> {formatFilterDate(endDateFilter)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setEndDateFilter("");
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
                      onClick={resetFilters}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rental #</TableHead>
                    <TableHead>customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>{t('th_has_operators')}</TableHead>
                    <TableHead>{t('th_total_amount')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No rentals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rentals?.data?.map((rental) => {
                      const status = calculateStatus(rental);

                      return (
                        <TableRow key={rental.id}>
                          <TableCell className="font-medium">
                            <a
                              href={route("rentals.show", rental.id)}
                              className="text-primary hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateDirectly(rental.id);
                              }}
                            >
                              {rental.rental_number || `Rental #${rental.id}`}
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 bg-muted">
                                <AvatarFallback>{getCustomerInfo(rental).initials}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium line-clamp-1">{getCustomerInfo(rental).name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{getCustomerInfo(rental).email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-sm">
                                <CalendarClock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span>
                                  {rental.start_date ? format(new Date(rental.start_date), "MMM dd, yyyy") : "-"}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                to {rental.expected_end_date ? format(new Date(rental.expected_end_date), "MMM dd, yyyy") : "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell>
                            {rental.has_operators ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                                <UserRound className="mr-1 h-3 w-3" />
                                With Operators
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 whitespace-nowrap">
                                No Operators
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(rental.total_amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <CrudButtons
                                resourceType="rentals"
                                resourceId={rental.id}
                                resourceName={`Rental #${rental.rental_number || rental.id}`}
                                viewRoute={route("rentals.show", rental.id)}
                                onView={() => {
                                  navigateDirectly(rental.id);
                                }}
                                hideView={false}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
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
    </AdminLayout>
  );
}

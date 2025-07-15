import { usePermission } from '@/Core';
import { Rental } from '@/Core/types/models';
import { Link } from '@inertiajs/react';
import { format, isAfter } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Extend the Rental interface to include our has_operators property
interface ExtendedRental extends Rental {
    has_operators?: boolean;
    customer_name: string;
    customer_email: string;
    rental_items: Array<{
        id: number;
        equipment_id: number;
        equipment_name: string;
        rate: number;
        rate_type: string;
        days: number;
    }>;
}

// Shadcn UI Components
import {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TooltipProvider,
} from '@/Core';

// Icons
import { CalendarClock, Eye, MoreHorizontal, Pencil, Printer, Trash, UserRound } from 'lucide-react';

interface Props {
    rentals: {
        data: ExtendedRental[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onDelete?: (rental: ExtendedRental) => void;
}

export default function RentalsList({ rentals, onDelete }: Props) {
    const { t } = useTranslation('rental');

    const { hasPermission } = usePermission();
    const canEditRentals = hasPermission('rentals.edit');
    const canDeleteRentals = hasPermission('rentals.delete');
    const canViewRentals = hasPermission('rentals.view');

    // Get status badge with appropriate color and icon
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'completed':
                return (
                    <Badge variant="outline" className="border-green-400 text-green-600">
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'overdue':
                return (
                    <Badge variant="destructive" className="animate-pulse">
                        Overdue
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Calculate rental status including overdue logic
    const calculateStatus = (rental: ExtendedRental) => {
        // If the rental is active and the expected end date is in the past, mark as overdue
        if (rental.status.toLowerCase() === 'active' && rental.expected_end_date && isAfter(new Date(), new Date(rental.expected_end_date))) {
            return 'overdue';
        }
        return rental.status.toLowerCase();
    };

    // Format currency for display
    const formatCurrency = (amount: number | null | undefined) => {
        // Check for null, undefined, or NaN
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
            return 'SAR 0.00';
        }

        // Ensure amount is a number
        const numericAmount = Number(amount);

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(numericAmount);
    };

    // Get customer initials for avatar
    const getClientInitials = (clientName: string | undefined) => {
        if (!clientName) return '?';
        return clientName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="w-full">
            <div className="rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/70">
                            <TableHead className="w-[10%]">Rental #</TableHead>
                            <TableHead className="w-[20%]">customer</TableHead>
                            <TableHead className="w-[20%]">Dates</TableHead>
                            <TableHead className="w-[10%]">Status</TableHead>
                            <TableHead className="w-[15%]">{t('th_has_operators')}</TableHead>
                            <TableHead className="w-[10%]">Total</TableHead>
                            <TableHead className="w-[10%]">Follow-Up</TableHead>
                            <TableHead className="w-[15%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No rentals found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rentals.data.map((rental) => {
                                const status = calculateStatus(rental);

                                return (
                                    <TableRow key={rental.id} className="group border-b hover:bg-muted/40">
                                        <TableCell className="py-4 font-medium">
                                            <Link href={route('rentals.show', rental.id)} className="text-primary hover:underline">
                                                {rental.rental_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 bg-muted">
                                                    <AvatarFallback>{getClientInitials(rental.customer_name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-0.5">
                                                    <p className="line-clamp-1 text-sm font-medium">{rental.customer_name}</p>
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">{rental.customer_email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm">
                                                    <CalendarClock className="mr-1 h-3 w-3 text-muted-foreground" />
                                                    <span>{rental.start_date ? format(new Date(rental.start_date), 'MMM dd, yyyy') : '-'}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    to {rental.expected_end_date ? format(new Date(rental.expected_end_date), 'MMM dd, yyyy') : '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">{getStatusBadge(status)}</TableCell>
                                        <TableCell className="py-4">
                                            {rental.has_operators ? (
                                                <Badge variant="outline" className="border-green-200 bg-green-50 whitespace-nowrap text-green-700">
                                                    <UserRound className="mr-1 h-3 w-3" />
                                                    With Operators
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-gray-200 bg-gray-50 whitespace-nowrap text-gray-700">
                                                    No Operators
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 font-medium">{formatCurrency(rental.total_amount)}</TableCell>
                                        <TableCell className="py-4">
                                            {rental.followup_sent_at ? (
                                                <span className="text-green-600">
                                                    Sent
                                                    <br />
                                                    {format(new Date(rental.followup_sent_at), 'MMM dd, yyyy')}
                                                </span>
                                            ) : (
                                                <span className="text-yellow-600">Pending</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <TooltipProvider>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">{t('more_options')}</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {canViewRentals && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('rentals.show', rental.id)} className="flex w-full items-center">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    {t('employee:ttl_view_details')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canEditRentals && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('rentals.edit', rental.id)} className="flex w-full items-center">
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    {t('ttl_edit_rental')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canViewRentals && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={route('rentals.print', rental.id)}
                                                                    target="_blank"
                                                                    className="flex w-full items-center"
                                                                >
                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                    Print Document
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(canEditRentals || canDeleteRentals) && <DropdownMenuSeparator />}
                                                        {canDeleteRentals && onDelete && (
                                                            <DropdownMenuItem
                                                                onClick={() => onDelete(rental)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Delete Rental
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

import { AppLayout, ErrorAlert } from '@/Core';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
// Placeholder types
type PageProps = any;
type Rental = any;
type RentalTimesheet = any;

// Shadcn UI Components
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
    Progress,
    Separator,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';

// Icons
import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    Calendar,
    Check,
    ChevronRight,
    Clock,
    FileText,
    Home,
    Info,
    Pencil,
    Printer,
    Receipt,
    Tag,
    Trash,
    User,
    UserX,
} from 'lucide-react';
import { toast } from 'sonner';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {}

    render() {
        if (this.state.hasError) {
            return (
                <div className="my-4 rounded-md border bg-red-50 p-6 text-red-800">
                    <h3 className="mb-2 font-bold">{t('something_went_wrong')}</h3>
                    <p className="mb-4 text-sm">{this.state.error?.message || 'An error occurred while rendering this component.'}</p>
                    <Button size="sm" onClick={() => window.location.reload()} variant="destructive">
                        Refresh Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

interface Props extends PageProps {
    rental: Rental;
    timesheet: RentalTimesheet;
}

export default function Show({ auth, rental, timesheet }: Props) {
    const { t } = useTranslation('rental');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Calculate cost based on rental item rate and hours used
    const calculateCost = () => {
        if (!timesheet?.rate) return 0;

        try {
            const rate = typeof timesheet.rate === 'number' ? timesheet.rate : parseFloat(String(timesheet.rate));

            const hours = typeof timesheet.hours_used === 'number' ? timesheet.hours_used : parseFloat(String(timesheet.hours_used || 0));

            if (isNaN(rate) || isNaN(hours)) return 0;

            return rate * hours;
        } catch (error) {
            return 0;
        }
    };

    // Calculate utilization percentage (hours used / available hours in a day)
    const calculateUtilization = () => {
        const hours = typeof timesheet.hours_used === 'number' ? timesheet.hours_used : parseFloat(String(timesheet.hours_used || 0));
        // Assuming 8 hour workday
        return Math.min((hours / 8) * 100, 100);
    };

    // Format time
    const formatTime = (time: string | null) => {
        if (!time) return '�';

        try {
            // Check if the time is just a time string (HH:MM or HH:MM:SS)
            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
                // It's a time-only string, add a dummy date
                const [hours, minutes] = time.split(':');
                const dummyDate = new Date();
                dummyDate.setHours(parseInt(hours, 10));
                dummyDate.setMinutes(parseInt(minutes, 10));
                return format(dummyDate, 'h:mm a');
            }

            // Otherwise try to parse it as a normal date
            const parsedDate = new Date(time);
            if (isNaN(parsedDate.getTime())) {
                return '�';
            }

            return format(parsedDate, 'h:mm a');
        } catch (error) {
            return '�';
        }
    };

    // Get status badge with appropriate color and icon
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return (
                    <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-600">
                        Active
                    </Badge>
                );
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'completed':
                return (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">
                        Completed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Print timesheet
    const printTimesheet = () => {
        window.print();
    };

    // Complete timesheet
    const completeTimesheet = () => {
        setIsSubmitting(true);
        router.put(
            route('rental-timesheets.complete', timesheet.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Timesheet completed successfully');
                    setIsSubmitting(false);
                    setIsCompleteDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to complete timesheet');
                    setIsSubmitting(false);
                },
            },
        );
    };

    // Delete timesheet
    const deleteTimesheet = () => {
        setIsSubmitting(true);
        router.delete(route('rental-timesheets.destroy', timesheet.id), {
            onSuccess: () => {
                toast.success('Timesheet deleted successfully');
                setIsSubmitting(false);
                // Redirect to timesheets list
                router.visit(route('rentals.timesheets', rental.id));
            },
            onError: () => {
                toast.error('Failed to delete timesheet');
                setIsSubmitting(false);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    const OperatorInformationCard = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Operator Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {timesheet.operator_absent ? (
                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                            <UserX className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-600">{t('operator_absent')}</p>
                                <p className="text-sm text-red-600/80">{t('no_hours_recorded_for_this_timesheet')}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label>Name</Label>
                                {timesheet.operator ? (
                                    <p className="mt-1 flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {(timesheet.operator as any).first_name} {(timesheet.operator as any).last_name}
                                    </p>
                                ) : timesheet.rentalItem?.operator ? (
                                    <div className="mt-1">
                                        <p className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {timesheet.rentalItem.operator.first_name} {timesheet.rentalItem.operator.last_name}
                                        </p>
                                        <Badge variant="outline" className="mt-2">
                                            {t('default_operator')}
                                        </Badge>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-muted-foreground">{t('no_operator_assigned')}</p>
                                )}
                            </div>

                            {(timesheet.operator?.phone || timesheet.rentalItem?.operator?.phone) && (
                                <div>
                                    <Label>Phone</Label>
                                    <p className="mt-1">{timesheet.operator?.phone || timesheet.rentalItem?.operator?.phone}</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Status Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label>Status</Label>
                            {getStatusBadge(timesheet.status)}
                        </div>

                        {timesheet.status === 'completed' && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>Completed on {format(new Date(timesheet.approved_at!), 'MMM d, yyyy')}</p>
                                {timesheet.approver && <p className="mt-1">by {timesheet.approver.name}</p>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <ErrorBoundary>
            <AppLayout>
                <Head title={`Timesheet Details - Rental ${rental.rental_number}`} />

                <div className="container mx-auto space-y-6 py-6 print:py-2">
                    {/* Breadcrumbs and Actions */}
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                        <div className="mb-4 flex items-center text-sm text-muted-foreground sm:mb-0">
                            <Link href={route('dashboard')} className="flex items-center transition-colors hover:text-primary">
                                <Home className="mr-1 h-4 w-4" />
                                Dashboard
                            </Link>
                            <ChevronRight className="mx-1 h-4 w-4" />
                            <Link href={route('rentals.index')} className="transition-colors hover:text-primary">
                                Rentals
                            </Link>
                            <ChevronRight className="mx-1 h-4 w-4" />
                            <Link href={route('rentals.show', rental.id)} className="transition-colors hover:text-primary">
                                {rental.rental_number}
                            </Link>
                            <ChevronRight className="mx-1 h-4 w-4" />
                            <Link href={route('rentals.timesheets', rental.id)} className="transition-colors hover:text-primary">
                                Timesheets
                            </Link>
                            <ChevronRight className="mx-1 h-4 w-4" />
                            <span className="font-medium text-foreground">View</span>
                        </div>

                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('rentals.timesheets', rental.id)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('timesheet:back_to_timesheets')}
                                </Link>
                            </Button>

                            <Button variant="outline" size="sm" onClick={printTimesheet}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>

                            {/* Edit button - only for non-completed timesheets */}
                            {timesheet.status !== 'completed' && (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={route('rental-timesheets.edit', timesheet.id)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCompleteDialogOpen(true)}
                                        className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Complete
                                    </Button>
                                </>
                            )}

                            {/* Delete button - for all timesheets */}
                            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <ErrorAlert />

                    {/* Printable Header */}
                    <div className="hidden print:mb-6 print:block">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">TIMESHEET</h1>
                                <p className="text-gray-600">{format(new Date(timesheet.date), 'MMMM d, yyyy')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">Rental #{rental.rental_number}</p>
                                <p>{rental.customer?.company_name}</p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                    </div>

                    {/* Page Header */}
                    <Card className="border-l-4 border-l-primary print:border-none print:shadow-none">
                        <CardContent className="p-6 print:px-0">
                            <div className="flex flex-col justify-between gap-4 md:flex-row">
                                <div>
                                    <h1 className="flex items-center gap-2 text-xl font-medium tracking-tight">
                                        <Clock className="h-5 w-5 text-muted-foreground print:hidden" />
                                        {t('ttl_timesheet_details')}
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        For Rental #{rental.rental_number} • customer: {rental.customer?.company_name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(timesheet.status)}

                                    {timesheet.status === 'completed' && (
                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
                                            {timesheet.hours_used} hours recorded
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timesheet Details */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:gap-4">
                        {/* Main Details */}
                        <div className="space-y-6 lg:col-span-2 print:space-y-4">
                            {/* Equipment and Date Info */}
                            <Card className="print:border-none print:shadow-none">
                                <CardHeader className="print:pt-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Equipment & Date Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Equipment</h3>
                                            <p className="mt-1 font-semibold">
                                                {timesheet.rentalItem?.equipment?.name || timesheet.equipment?.name || 'Unknown Equipment'}
                                            </p>
                                            {(timesheet.rentalItem?.equipment?.serial_number || timesheet.equipment?.serial_number) && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-3 w-3" />
                                                        {timesheet.rentalItem?.equipment?.serial_number || timesheet.equipment?.serial_number}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                                            <p className="mt-1 font-semibold">{format(new Date(timesheet.date), 'EEEE, MMMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time and Hours Info */}
                            <Card className="print:border-none print:shadow-none">
                                <CardHeader className="print:pt-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Time & Hours Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Time Details Table */}
                                    <div className="overflow-hidden rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('lbl_start_time')}</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('end_time')}</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('total_hours')}</th>
                                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border-t px-4 py-3 font-medium">{formatTime(timesheet.start_time)}</td>
                                                    <td className="border-t px-4 py-3 font-medium">{formatTime(timesheet.end_time)}</td>
                                                    <td className="border-t px-4 py-3 font-medium">
                                                        <Badge variant="outline" className="border-blue-100 bg-blue-50 font-medium text-blue-600">
                                                            {timesheet.hours_used} hours
                                                        </Badge>
                                                    </td>
                                                    <td className="border-t px-4 py-3 font-medium">{getStatusBadge(timesheet.status)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Visual Timeline */}
                                    {timesheet.start_time && timesheet.end_time && (
                                        <div className="mt-6">
                                            <div className="mb-2 flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-muted-foreground">{t('daily_timeline')}</h3>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p className="max-w-56 text-xs">
                                                                {t('shows_when_the_equipment_was_in_use_throughout_the')}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="relative h-12 rounded-md bg-muted/20">
                                                <div
                                                    className="absolute h-full rounded-md bg-primary/30"
                                                    style={{
                                                        left: `${Math.min(((new Date(`2000-01-01T${timesheet.start_time}`).getHours() * 60 + new Date(`2000-01-01T${timesheet.start_time}`).getMinutes()) / (24 * 60)) * 100, 100)}%`,
                                                        width: `${Math.min((parseFloat(timesheet.hours_used) / 24) * 100, 100)}%`,
                                                    }}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                                        {formatTime(timesheet.start_time)} - {formatTime(timesheet.end_time)}
                                                    </div>
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1 text-xs text-muted-foreground">
                                                    <span>12 AM</span>
                                                    <span>6 AM</span>
                                                    <span>12 PM</span>
                                                    <span>6 PM</span>
                                                    <span>12 AM</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Utilization */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-muted-foreground">Utilization (% of workday)</h3>
                                            <span className="text-sm font-medium">{Math.round(calculateUtilization())}%</span>
                                        </div>
                                        <Progress value={calculateUtilization()} className="h-2.5" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cost Calculation */}
                            {timesheet.rentalItem?.rate && (
                                <Card className="print:border-none print:shadow-none">
                                    <CardHeader className="print:pt-0">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Receipt className="h-4 w-4 text-muted-foreground" />
                                            Cost Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="overflow-hidden rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Rate</th>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hours</th>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('total_cost')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border-t px-4 py-3 font-medium">
                                                            $
                                                            {typeof timesheet.rentalItem?.rate === 'number'
                                                                ? timesheet.rentalItem.rate.toFixed(2)
                                                                : parseFloat(String(timesheet.rentalItem?.rate || 0)).toFixed(2)}
                                                        </td>
                                                        <td className="border-t px-4 py-3">
                                                            <Badge variant="outline" className="capitalize">
                                                                {timesheet.rentalItem?.rate_type || 'hourly'}
                                                            </Badge>
                                                        </td>
                                                        <td className="border-t px-4 py-3 font-medium">
                                                            {typeof timesheet.hours_used === 'number'
                                                                ? timesheet.hours_used.toFixed(2)
                                                                : parseFloat(String(timesheet.hours_used || 0)).toFixed(2)}
                                                        </td>
                                                        <td className="border-t px-4 py-3 font-medium text-primary">${calculateCost().toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="rounded border border-dashed bg-muted/10 p-3 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Info className="h-3.5 w-3.5" />
                                                <span className="font-medium">Cost Calculation:</span>
                                            </div>
                                            <p className="mt-1">
                                                {timesheet.rentalItem?.rate_type === 'hourly' &&
                                                    `${
                                                        typeof timesheet.rentalItem?.rate === 'number'
                                                            ? timesheet.rentalItem.rate.toFixed(2)
                                                            : parseFloat(String(timesheet.rentalItem?.rate || 0)).toFixed(2)
                                                    } per hour × ${
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used
                                                            : parseFloat(String(timesheet.hours_used || 0))
                                                    } hours = $${calculateCost().toFixed(2)}`}
                                                {timesheet.rentalItem?.rate_type === 'daily' &&
                                                    `${
                                                        typeof timesheet.rentalItem?.rate === 'number'
                                                            ? timesheet.rentalItem.rate.toFixed(2)
                                                            : parseFloat(String(timesheet.rentalItem?.rate || 0)).toFixed(2)
                                                    } per day × ${Math.ceil(
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used / 8
                                                            : parseFloat(String(timesheet.hours_used || 0)) / 8,
                                                    )} days (${
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used
                                                            : parseFloat(String(timesheet.hours_used || 0))
                                                    } hours) = $${calculateCost().toFixed(2)}`}
                                                {timesheet.rentalItem?.rate_type === 'weekly' &&
                                                    `${
                                                        typeof timesheet.rentalItem?.rate === 'number'
                                                            ? timesheet.rentalItem.rate.toFixed(2)
                                                            : parseFloat(String(timesheet.rentalItem?.rate || 0)).toFixed(2)
                                                    } per week × ${Math.ceil(
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used / 40
                                                            : parseFloat(String(timesheet.hours_used || 0)) / 40,
                                                    )} weeks (${
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used
                                                            : parseFloat(String(timesheet.hours_used || 0))
                                                    } hours) = $${calculateCost().toFixed(2)}`}
                                                {timesheet.rentalItem?.rate_type === 'monthly' &&
                                                    `${
                                                        typeof timesheet.rentalItem?.rate === 'number'
                                                            ? timesheet.rentalItem.rate.toFixed(2)
                                                            : parseFloat(String(timesheet.rentalItem?.rate || 0)).toFixed(2)
                                                    } per month × ${Math.ceil(
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used / 160
                                                            : parseFloat(String(timesheet.hours_used || 0)) / 160,
                                                    )} months (${
                                                        typeof timesheet.hours_used === 'number'
                                                            ? timesheet.hours_used
                                                            : parseFloat(String(timesheet.hours_used || 0))
                                                    } hours) = $${calculateCost().toFixed(2)}`}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {timesheet.notes && (
                                <Card className="print:border-none print:shadow-none">
                                    <CardHeader className="print:pt-0">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm whitespace-pre-line">{timesheet.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Side Details */}
                        <div className="space-y-6 print:space-y-4">
                            <OperatorInformationCard />

                            {/* customer Info */}
                            <Card className="print:border-none print:shadow-none">
                                <CardHeader className="print:pt-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {rental.customer ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                                                <p className="mt-1 font-semibold">{rental.customer.company_name}</p>
                                            </div>

                                            {rental.customer.contact_person && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground">{t('contact_person')}</h3>
                                                    <p className="mt-1 font-semibold">{rental.customer.contact_person}</p>
                                                </div>
                                            )}

                                            {rental.customer.email && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                                    <p className="mt-1 font-semibold">{rental.customer.email}</p>
                                                </div>
                                            )}

                                            {rental.customer.phone && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                                    <p className="mt-1 font-semibold">{rental.customer.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">customer information not available.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timesheet Info */}
                            <Card className="print:border-none print:shadow-none">
                                <CardHeader className="print:pt-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Timesheet Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('current_status')}</h3>
                                        <div className="mt-1">{getStatusBadge(timesheet.status)}</div>
                                    </div>

                                    {timesheet.created_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                                            <p className="mt-1 text-sm">
                                                {format(new Date(timesheet.created_at), "MMM d, yyyy 'at' h:mm a")}
                                                {timesheet.creator && (
                                                    <span className="block text-xs text-muted-foreground">by {timesheet.creator.name}</span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {timesheet.updated_at && timesheet.updated_at !== timesheet.created_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">{t('last_updated')}</h3>
                                            <p className="mt-1 text-sm">{format(new Date(timesheet.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                        </div>
                                    )}

                                    {timesheet.approved_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                                            <p className="mt-1 text-sm">
                                                {format(new Date(timesheet.approved_at), "MMM d, yyyy 'at' h:mm a")}
                                                {timesheet.approver && (
                                                    <span className="block text-xs text-muted-foreground">by {timesheet.approver.name}</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* View More */}
                            <div className="flex items-center justify-between print:hidden">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('rentals.timesheets', rental.id)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        All Timesheets
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('rentals.show', rental.id)}>
                                        View Rental
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Print Footer */}
                    <div className="mt-8 hidden print:block">
                        <Separator className="mb-4" />
                        <div className="flex justify-between text-sm text-gray-500">
                            <div>
                                <p>Generated: {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
                            </div>
                            <div>
                                <p>Timesheet ID: {timesheet.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Confirmation Dialog */}
                <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_complete_timesheet')}</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to mark this timesheet as completed? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={completeTimesheet} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? 'Processing...' : 'Complete Timesheet'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_timesheet')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this timesheet? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteTimesheet} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Delete Timesheet'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </ErrorBoundary>
    );
}

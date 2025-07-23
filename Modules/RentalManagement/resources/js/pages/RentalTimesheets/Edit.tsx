import { Alert, AlertDescription, AlertTitle, AppLayout } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import TimesheetForm from '../../Components/rentals/timesheets/TimesheetForm';
// Placeholder types
type PageProps = any;
type Employee = any;
type Rental = any;
type RentalItem = any;
type RentalTimesheet = any;

// Shadcn UI Components
import { Button, Card, CardContent } from '@/Core';

// Icons
import { ArrowLeft, ChevronRight, Home, Pencil } from 'lucide-react';

interface Props extends PageProps {
    auth: any;
    rental: Rental;
    timesheet: RentalTimesheet;
    rentalItems: RentalItem[];
    operators: Employee[];
}

export default function Edit({ auth, rental, timesheet, rentalItems, operators }: Props) {
    const { t } = useTranslation('rental');

    // Format auth object for TimesheetForm
    const formattedAuth = {
        user: {
            role: auth.user.roles?.[0]?.name || 'user',
        },
    };

    return (
        <AppLayout>
            <Head title={`Edit Timesheet - Rental ${rental.rental_number}`} />

            <div className="container mx-auto space-y-6 py-6">
                {/* Breadcrumbs and Actions */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                        <span className="font-medium text-foreground">Edit</span>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('rental-timesheets.show', timesheet.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Timesheet
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('rentals.timesheets', rental.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to All Timesheets
                            </Link>
                        </Button>
                    </div>
                </div>

                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>An error occurred. Please try again.</AlertDescription>
                </Alert>

                {/* Page Header */}
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                            <div>
                                <h1 className="flex items-center gap-2 text-xl font-medium tracking-tight">
                                    <Pencil className="h-5 w-5 text-muted-foreground" />
                                    {t('timesheet:edit_timesheet')}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    For Rental #{rental.rental_number} • customer: {rental.customer?.company_name}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timesheet Form */}
                <TimesheetForm
                    rental={rental}
                    timesheet={timesheet}
                    rentalItems={rentalItems}
                    operators={operators}
                    isEditing={true}
                    auth={formattedAuth}
                />
            </div>
        </AppLayout>
    );
}

import React from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link } from "@inertiajs/react";
// Placeholder types
type PageProps = any;
type Employee = any;
type Rental = any;
type RentalItem = any;
type RentalTimesheet = any;
import { AppLayout } from '@/Core';
import TimesheetForm from '../../components/rentals/timesheets/TimesheetForm';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Icons
import { ArrowLeft, ChevronRight, Clock, Home, Pencil } from "lucide-react";

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
      role: auth.user.roles?.[0]?.name || 'user'
    }
  };

  return (
    <AdminLayout>
      <Head title={`Edit Timesheet - Rental ${rental.rental_number}`} />

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
            <Link
              href={route("rentals.timesheets", rental.id)}
              className="hover:text-primary transition-colors"
            >
              Timesheets
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">Edit</span>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={route("rental-timesheets.show", timesheet.id)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Timesheet
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={route("rentals.timesheets", rental.id)}>
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
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-xl font-medium tracking-tight flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                  {t('timesheet:edit_timesheet')}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
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
    </AdminLayout>
  );
}















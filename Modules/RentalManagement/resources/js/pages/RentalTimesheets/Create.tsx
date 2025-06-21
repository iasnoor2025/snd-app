import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, usePage } from "@inertiajs/react";
import { PageProps } from '@/Core/types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Core";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import TimesheetForm from '../../components/rentals/timesheets/TimesheetForm';

// Icons
import { AlertCircle } from "lucide-react";

interface Props extends PageProps {
  rentals: any[];
  rentalItems: any[];
  operators: any[];
  selectedRentalId?: number;
  csrf_token?: string;
  errors?: { [key: string]: string };
}

export default function Create({ rentals = [], rentalItems = [], operators = [], errors = {} }: Props) {
  const { t } = useTranslation('rental');

  const [loading, setLoading] = useState(false);

  // Ensure arrays are defined
  const safeRentals = Array.isArray(rentals) ? rentals : [];
  const safeRentalItems = Array.isArray(rentalItems) ? rentalItems : [];
  const safeOperators = Array.isArray(operators) ? operators : [];

  // Debug logging


  // Check if we have active rentals
  if (safeRentals.length === 0) {
    return (
      <AppLayout>
        <Head title={t('create_timesheet')} />
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('ttl_no_active_rentals')}</AlertTitle>
            <AlertDescription>
              No active rentals are available. Please create a rental first.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  // Check if we have rental items with equipment
  const hasValidRentalItems = safeRentalItems.some(item =>
    item.equipment && item.equipment.id && item.equipment.status === 'active'
  );

  if (!hasValidRentalItems) {
    return (
      <AppLayout>
        <Head title={t('create_timesheet')} />
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('ttl_no_equipment_available')}</AlertTitle>
            <AlertDescription>
              No active equipment is available for the selected rental.
              Please ensure equipment is properly assigned to the rental.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={t('create_timesheet')} />
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t('create_timesheet')}</h1>
          <p className="text-muted-foreground">
            Create a new timesheet entry for equipment usage
          </p>
        </div>

        <TimesheetForm
          rentals={safeRentals}
          rentalItems={safeRentalItems}
          operators={safeOperators}
        />
      </div>
    </AppLayout>
  );
}

















import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from '@/types';
import { Customer, Equipment } from '@/types/models';
import { AdminLayout } from '@/Modules/Core/resources/js';
import { format, isAfter, isBefore, startOfToday } from "date-fns";
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Separator } from '@/Modules/Core/resources/js/components/ui/separator';

// Icons
import { ArrowLeft } from "lucide-react";

// Our components
import RentalForm from "../../components/rentals/RentalForm";

interface Props extends PageProps {
  customers: Customer[];
  equipment: Equipment[];
  nextRentalNumber: string;
  employees?: { id: number; name: string }[];
}

export default function Create({ auth, customers = [], equipment = [], nextRentalNumber, employees = [] }: Props) {
  const { t } = useTranslation('rental');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Format dates to YYYY-MM-DD
      const startDate = format(new Date(values.start_date), 'yyyy-MM-dd');
      const expectedEndDate = format(new Date(values.expected_end_date), 'yyyy-MM-dd');

      // Validate dates
      const today = startOfToday();
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(expectedEndDate);

      if (isBefore(startDateObj, today)) {
        toast.error('Start date must be today or later');
        setIsSubmitting(false);
        return;
      }

      if (!isAfter(endDateObj, startDateObj)) {
        toast.error('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      // Validate rental items
      if (!values.rental_items || values.rental_items.length === 0) {
        toast.error('Please add at least one rental item');
        setIsSubmitting(false);
        return;
      }

      // Validate each rental item
      for (const item of values.rental_items) {
        if (!item.equipment_id) {
          toast.error('Please select equipment for all rental items');
          setIsSubmitting(false);
          return;
        }
        if (!item.rate || item.rate <= 0) {
          toast.error('Please enter a valid rate for all rental items');
          setIsSubmitting(false);
          return;
        }
        if (!item.rate_type || !['hourly', 'daily', 'weekly', 'monthly'].includes(item.rate_type)) {
          toast.error('Please select a valid rate type for all rental items');
          setIsSubmitting(false);
          return;
        }
        if (item.operator_id && !employees.some(emp => emp.id === item.operator_id)) {
          toast.error('One or more selected operators are invalid');
          setIsSubmitting(false);
          return;
        }
        if (item.notes && item.notes.length > 1000) {
          toast.error('Notes cannot exceed 1000 characters');
          setIsSubmitting(false);
          return;
        }
      }

      // Calculate days between start and end date
      const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));

      // Prepare rental items with correct format
      const rentalItems = values.rental_items.map((item: any) => ({
        equipment_id: item.equipment_id,
        rate: parseFloat(item.rate),
        rate_type: item.rate_type || 'daily',
        operator_id: item.operator_id || null,
        notes: item.notes || '',
        days: days, // Set days based on rental duration
        discount_percentage: 0,
        total_amount: parseFloat(item.rate) * days
      }));

      // Calculate totals
      const subtotal = rentalItems.reduce((total: number, item: any) => total + item.total_amount, 0);
      const taxPercentage = 15; // Default VAT in Saudi Arabia
      const taxAmount = (subtotal * taxPercentage) / 100;
      const totalAmount = subtotal + taxAmount;

      // Prepare data for submission
      const submitData = {
        customer_id: values.customer_id,
        rental_number: values.rental_number,
        start_date: startDate,
        expected_end_date: expectedEndDate,
        deposit_amount: values.deposit_amount || 0,
        billing_cycle: 'daily',
        payment_terms_days: 30,
        has_timesheet: false,
        has_operators: rentalItems.some(item => item.operator_id !== null),
        status: 'pending',
        tax_percentage: taxPercentage,
        discount_percentage: 0,
        notes: values.notes || '',
        created_by: auth.user.id,
        rental_items: rentalItems,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount
      };

      console.log('Submitting rental data:', submitData);

      await router.post(route('rentals.store'), submitData, {
        onSuccess: () => {
          toast.success('Rental created successfully');
          router.visit(route('rentals.index'));
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
          Object.values(errors).forEach((error: any) => {
            toast.error(error);
          });
        },
        preserveScroll: true,
      });
    } catch (error) {
      console.error('Error submitting rental:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Head title={t('ttl_create_rental')} />

      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2"
          >
            <Link href={route("rentals.index")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rentals
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_create_new_rental')}</CardTitle>
          </CardHeader>

          <CardContent>
            <RentalForm
              customers={customers}
              equipment={equipment}
              employees={employees}
              initialData={{ rentalNumber: nextRentalNumber }}
              isEditMode={false}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}















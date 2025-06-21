import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from '@/Core/types';
import { AppLayout } from '@/Core';
import { format } from "date-fns";
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";

// Icons
import { ArrowLeft } from "lucide-react";

// Our components
import RentalForm, { RentalFormValues } from '../../components/rentals/RentalForm';

interface Props extends PageProps {
  customers: any[];
  equipment: any[];
  rental: any;
  employees?: any[];
}

export default function Edit({ customers, equipment, rental, employees = [] }: Props) {
  const { t } = useTranslation('rental');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = (
    values: RentalFormValues,
    rentalItems: any[],
    financials: {
      subtotal: number;
      taxAmount: number;
      totalAmount: number;
      discount: number;
      deletedItemIds?: number[];
    }
  ) => {
    setIsSubmitting(true);

    // Prepare data for submission
    const formData = {
      _method: "PUT",
      customer_id: values.customer_id,
      client_id: values.customer_id,
      rental_number: values.rental_number,
      start_date: format(values.start_date, "yyyy-MM-dd"),
      expected_end_date: format(values.expected_end_date, "yyyy-MM-dd"),
      actual_end_date: values.actual_end_date ? format(values.actual_end_date, "yyyy-MM-dd") : null,
      status: values.status,
      deposit_amount: values.deposit_amount,
      notes: values.notes || "",
      tax_rate: values.tax_rate,
      rental_items: rentalItems.map(item => ({
        id: item.id || null,
        equipment_id: item.equipment_id,
        quantity: item.quantity,
        rate: item.daily_rate,
        rate_type: "daily",
        days: item.days,
        operator_id: item.operator_id,
      })),
      deleted_items: financials.deletedItemIds || [],
      discount: financials.discount,
      subtotal: financials.subtotal,
      tax_amount: financials.taxAmount,
      total_amount: financials.totalAmount,
    };

    console.log('Updating rental with data:', {
      rental_items: formData.rental_items,
      start_date: formData.start_date,
      expected_end_date: formData.expected_end_date
    });

    // Submit the form
    router.put(route("rentals.update", rental.id), formData, {
      onSuccess: () => {
        toast.success("Rental updated successfully");
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error("Validation errors:", errors);
        toast.error("Failed to update rental");
        setIsSubmitting(false);
      },
    });
  };

  return (
    <AppLayout>
      <Head title={t('ttl_edit_rental')} />

      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
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
              <CardTitle className="text-2xl font-bold">Edit Rental #{rental.rental_number}</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <RentalForm
              customers={customers}
              equipment={equipment}
              employees={employees}
              initialData={{ rental }}
              isEditMode={true}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


















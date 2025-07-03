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
import { RentalForm } from '../../components/rentals/RentalForm';
import FileUpload from '@/components/FileUpload';

interface Props extends PageProps {
  customers: any[];
  equipment: any[];
  rental: any;
  employees?: any[];
}

export default function Edit({ customers, equipment, rental, employees = [] }: Props) {
  const { t } = useTranslation('rental');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    const formData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    if (uploadedFile) {
      formData.append('document', uploadedFile);
    }

    console.log('Updating rental with data:', {
      rental_items: formData.rental_items,
      start_date: formData.start_date,
      expected_end_date: formData.expected_end_date
    });

    // Use Inertia post with FormData
    router.post(route("rentals.update", rental.id), formData, {
      forceFormData: true,
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
            <div className="mt-4">
              <label className="block font-medium mb-1">Upload Rental Document/Media</label>
              <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


















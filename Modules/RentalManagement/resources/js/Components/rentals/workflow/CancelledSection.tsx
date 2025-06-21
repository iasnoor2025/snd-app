import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Calendar, FileText, Copy, RotateCcw } from "lucide-react";
import RentalItemsCard from "@/components/rentals/RentalItemsCard";
import DocumentsCard from "@/components/rentals/DocumentsCard";
import { format } from "date-fns";

// Define interface for document
interface AttachedDocument {
  id: number;
  name: string;
  type?: string;
  url: string;
}

// Interface for CancelledSection props
interface CancelledSectionProps {
  rental: any;
  rentalItems: {
    data: any[];
    total: number;
  };
  permissions: {
    view: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    complete: boolean;
    generate_invoice: boolean;
    view_timesheets: boolean;
    request_extension: boolean;
  };
  onExtensionSuccess?: () => void;
  // Other props are available but not used in this component
}

export default function CancelledSection({
  rental,
  rentalItems,
  permissions
}: CancelledSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("details");
  const [isDuplicating, setIsDuplicating] = React.useState(false);

  // Get formatted cancellation date
  const getCancellationDate = () => {
    if (!rental.cancelled_at) {
      return 'Unknown date';
    }

    return format(new Date(rental.cancelled_at), 'PPP');
  };

  // Duplicate rental as new
  const handleDuplicateRental = () => {
    setIsDuplicating(true);

    // In a real implementation, call an API endpoint to duplicate rental
    setTimeout(() => {
      window.location.href = `/rentals/duplicate/${rental.id}`;
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Cancelled rental alert */}
      <Alert variant="destructive">
        <X className="h-4 w-4" />
        <AlertTitle>{t('ttl_rental_cancelled')}</AlertTitle>
        <AlertDescription>
          This rental has been cancelled on {getCancellationDate()}.
        </AlertDescription>
      </Alert>

      {/* Tabs for cancelled state */}
      <Tabs defaultValue="details" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">{t('cancellation_details')}</TabsTrigger>
          <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('ttl_cancellation_information')}</CardTitle>
                  <CardDescription>
                    Details about the rental cancellation
                  </CardDescription>
                </div>
                <Badge variant="destructive">Cancelled</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cancellation details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium mb-2">{t('cancellation_details')}</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        <p className="text-muted-foreground">Rental Number:</p>
                        <p className="font-medium">{rental.rental_number}</p>

                        <p className="text-muted-foreground">Cancelled On:</p>
                        <p className="font-medium">{getCancellationDate()}</p>

                        <p className="text-muted-foreground">Cancelled By:</p>
                        <p className="font-medium">{rental.cancelled_by_name || 'Unknown'}</p>

                        <p className="text-muted-foreground">Refund Status:</p>
                        <p className="font-medium">
                          {rental.refund_status || rental.refund_amount
                            ? `${rental.refund_status || 'Processed'} (${rental.refund_amount || 'N/A'})`
                            : 'No refund applicable'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">{t('original_rental_information')}</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        <p className="text-muted-foreground">Customer:</p>
                        <p className="font-medium">{rental.customer.company_name}</p>

                        <p className="text-muted-foreground">Planned Start:</p>
                        <p className="font-medium">
                          {rental.start_date ? format(new Date(rental.start_date), 'PP') : 'N/A'}
                        </p>

                        <p className="text-muted-foreground">Planned End:</p>
                        <p className="font-medium">
                          {rental.expected_end_date ? format(new Date(rental.expected_end_date), 'PP') : 'N/A'}
                        </p>

                        <p className="text-muted-foreground">Items Count:</p>
                        <p className="font-medium">{rentalItems.data.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation reason */}
                <div className="space-y-2">
                  <h3 className="font-medium">{t('cancellation_reason')}</h3>
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <p className="text-sm">
                      {rental.cancellation_reason ||
                        'No reason provided for the cancellation. This rental was cancelled without a specific reason being recorded.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDuplicateRental}
                    disabled={isDuplicating || !permissions.update}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {isDuplicating ? "Processing..." : "Duplicate as New Rental"}
                  </Button>

                  {/* Only show this button if the rental was cancelled recently and user has permissions */}
                  {permissions.update && rental.cancel_reversible && (
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={`/rentals/${rental.id}/restore`}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore Rental
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <RentalItemsCard
            rentalId={rental.id}
            items={rentalItems.data}
            canAddItems={false} // Cancelled rentals cannot be modified
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsCard
            rentalId={rental.id}
            documents={(rental.attached_documents || []).map((doc: AttachedDocument) => ({
              id: doc.id,
              name: doc.name,
              file_name: doc.name,
              mime_type: doc.type || 'application/octet-stream',
              size: 0,
              url: doc.url,
              custom_properties: {
                original_filename: doc.name,
                uploaded_by: null,
                uploaded_at: new Date().toISOString(),
              },
              created_at: new Date().toISOString(),
            }))}
            canUpload={false} // Cancelled rentals cannot be modified
            canDelete={false} // Cancelled rentals cannot be modified
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}















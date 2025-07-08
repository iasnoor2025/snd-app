import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Core";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Clock, Download, CheckCircle2, FileText, Send, X } from "lucide-react";
import RentalItemsCard from "../../rentals/RentalItemsCard";
import { format } from "date-fns";
import { formatCurrency } from "@/Core";
import { Progress } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';
import { Inertia } from '@inertiajs/inertia';
import { toast } from 'sonner';
import StatusTimeline from '../StatusTimeline';
import axios from 'axios';

// Interface for QuotationSection props
interface QuotationSectionProps {
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

export default function QuotationSection({
  rental,
  rentalItems,
  permissions
}: QuotationSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("quotation");
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [isEmailingSent, setIsEmailingSent] = React.useState(false);

  // Function to approve quotation
  const handleApproveQuotation = () => {
    if (!permissions.approve) {
      toast.error(t('error_no_permission'));
      return;
    }
    setIsApproving(true);
    Inertia.post(`/quotations/${rental.quotation_id}/approve`, {}, {
      onSuccess: () => {
        toast.success(t('msg_quotation_approved'));
        setIsApproving(false);
        window.location.reload();
      },
      onError: (err: any) => {
        toast.error(t('error_approve_failed'));
        setIsApproving(false);
      }
    });
  };

  // Function to reject quotation
  const handleRejectQuotation = () => {
    if (!permissions.update) {
      toast.error(t('error_no_permission'));
      return;
    }
    setIsRejecting(true);
    Inertia.post(`/quotations/${rental.quotation_id}/reject`, { notes: t('msg_rejected_by_user') }, {
      onSuccess: () => {
        toast.success(t('msg_quotation_rejected'));
        setIsRejecting(false);
        window.location.reload();
      },
      onError: (err: any) => {
        toast.error(t('error_reject_failed'));
        setIsRejecting(false);
      }
    });
  };

  // Function to email quotation to customer
  const handleEmailQuotation = () => {
    const subject = encodeURIComponent(`Quotation #${rental.quotation_id || ''}`);
    const body = encodeURIComponent(
      `Dear ${rental.customer?.contact_person || ''},\n\nPlease find attached the quotation for your rental.\n\nYou can download the PDF here: ${window.location.origin}/rentals/${rental.id}/quotation/download\n\nBest regards,\n${rental.company_name || ''}`
    );
    const mailto = `mailto:${rental.customer?.email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <div className="space-y-4">
      {/* Workflow history / audit trail */}
      <StatusTimeline rental={rental} />

      {/* Quotation rental alert */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>{t('ttl_quotation_generated')}</AlertTitle>
        <AlertDescription>
          A quotation has been generated for this rental. It requires customer approval to proceed.
        </AlertDescription>
      </Alert>

      {/* Tabs for quotation state */}
      <Tabs defaultValue="quotation" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
        </TabsList>

        <TabsContent value="quotation">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quotation #{rental.quotation_id || 'N/A'}</CardTitle>
                  <CardDescription>
                    Created on {rental.quotation_created_at ?
                      format(new Date(rental.quotation_created_at), 'PPP') : 'N/A'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                  {t('employee:ttl_pending_approval')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Customer and rental info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('customer_information')}</h3>
                    <div className="text-sm">
                      <p className="font-medium">{rental.customer.company_name}</p>
                      <p>{rental.customer.contact_person}</p>
                      <p>{rental.customer.email}</p>
                      <p>{rental.customer.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('rental_information')}</h3>
                    <div className="text-sm">
                      <p><span className="font-medium">Rental #:</span> {rental.rental_number}</p>
                      <p>
                        <span className="font-medium">Rental Period:</span> {' '}
                        {rental.start_date ? format(new Date(rental.start_date), 'PP') : 'TBD'} - {' '}
                        {rental.expected_end_date ? format(new Date(rental.expected_end_date), 'PP') : 'TBD'}
                      </p>
                      <p><span className="font-medium">Items:</span> {rentalItems.data.length}</p>
                    </div>
                  </div>
                </div>

                {/* Quotation summary */}
                <div className="border rounded-md">
                  <div className="bg-secondary/20 p-4 rounded-t-md border-b">
                    <h3 className="font-medium">{t('quotation_summary')}</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(rental.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({(rental.tax_rate || 0) * 100}%):</span>
                      <span>{formatCurrency(rental.tax_amount || 0)}</span>
                    </div>
                    {rental.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(rental.discount || 0)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(rental.total_amount || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Rental Terms Section */}
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-2">Rental Terms:</h3>
                  <ol className="list-decimal pl-6 space-y-1 text-sm">
                    <li>Equipments Works 10 Hours a day for 26 days In a month.</li>
                    <li>{rental.customer.company_name} to provide Fuel(diesel) for the Equipments.</li>
                    <li>{rental.customer.company_name} shall provide a accommodation, Food and transportation for the Drives.</li>
                  </ol>
                </div>

                {/* Download and email actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`/rentals/${rental.id}/quotation/download`} target="_blank">
                      <FileText className="mr-2 h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleEmailQuotation}
                    disabled={isEmailingSent}
                  >
                    {isEmailingSent ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Email to Customer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-secondary/10 flex justify-between">
              <Button
                variant="destructive"
                onClick={handleRejectQuotation}
                disabled={isRejecting || !permissions.update}
              >
                <X className="mr-2 h-4 w-4" />
                Reject Quotation
              </Button>

              <Button
                variant="default"
                onClick={handleApproveQuotation}
                disabled={isApproving || !permissions.approve}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Quotation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <RentalItemsCard
            rentalId={rental.id}
            items={rentalItems.data}
            canAddItems={permissions.update}
            equipment={rental.dropdowns?.equipment || []}
            operators={rental.dropdowns?.employees || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}















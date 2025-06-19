import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Modules/Core/resources/js/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Modules/Core/resources/js/components/ui/alert";
import { Button } from "@/Modules/Core/resources/js/components/ui/button";
import { Badge } from "@/Modules/Core/resources/js/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Modules/Core/resources/js/components/ui/tabs";
import { differenceInDays, format } from "date-fns";
import { AlertCircle, AlertTriangle, CalendarClock, CreditCard, Printer, Send } from "lucide-react";
import RentalItemsCard from "../../rentals/RentalItemsCard";
import InvoicesCard from "../../rentals/InvoicesCard";
import { formatCurrency } from "@/Modules/Core/resources/js/utils/format";
import { Progress } from '@/Modules/Core/resources/js/components/ui/progress';

// Interface for OverdueSection props
interface OverdueSectionProps {
  rental: any;
  rentalItems: {
    data: any[];
    total: number;
  };
  invoices: {
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

export default function OverdueSection({
  rental,
  rentalItems,
  invoices,
  permissions
}: OverdueSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("invoices");
  const [isSendingReminder, setIsSendingReminder] = React.useState(false);
  const [isPrintingInvoice, setIsPrintingInvoice] = React.useState(false);

  // Calculate days overdue
  const getDaysOverdue = () => {
    if (!rental.expected_end_date) return 0;

    const expectedEndDate = new Date(rental.expected_end_date);
    const today = new Date();
    return differenceInDays(today, expectedEndDate);
  };

  // Calculate payment progress
  const getPaymentProgress = () => {
    if (!invoices.data || invoices.data.length === 0) return 0;

    const totalAmount = invoices.data.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const paidAmount = invoices.data
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    if (totalAmount === 0) return 0;

    return Math.round((paidAmount / totalAmount) * 100);
  };

  // Send payment reminder
  const handleSendReminder = () => {
    setIsSendingReminder(true);

    // In a real implementation, call an API endpoint to send reminder
    setTimeout(() => {
      setIsSendingReminder(false);
      alert('Payment reminder sent to customer');
    }, 1500);
  };

  // Print invoice
  const handlePrintInvoice = () => {
    setIsPrintingInvoice(true);

    // In a real implementation, call an API endpoint to print or generate PDF
    setTimeout(() => {
      setIsPrintingInvoice(false);
      window.open(`/rentals/${rental.id}/invoice/print`, '_blank');
    }, 1000);
  };

  // Get the severity class based on days overdue
  const getOverdueSeverityClass = () => {
    const days = getDaysOverdue();
    if (days <= 3) return "text-yellow-600";
    if (days <= 7) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Overdue rental alert */}
      <Alert variant="destructive" className="animate-pulse">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('ttl_rental_overdue')}</AlertTitle>
        <AlertDescription>
          This rental has exceeded its expected end date by {getDaysOverdue()} days.
          Immediate action is required.
        </AlertDescription>
      </Alert>

      {/* Overdue summary card */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('ttl_overdue_status')}</CardTitle>
              <CardDescription>
                The rental period has ended but equipment hasn't been returned
              </CardDescription>
            </div>
            <Badge variant="destructive">
              {getDaysOverdue()} Days Overdue
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Payment status */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{t('payment_status')}</h3>
                <span className={`text-sm font-medium ${
                  getPaymentProgress() === 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getPaymentProgress()}% Paid
                </span>
              </div>
              <Progress value={getPaymentProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Key information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground">{t('expected_end_date')}</p>
                  <p className="font-medium">
                    {rental.expected_end_date ? format(new Date(rental.expected_end_date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('rental_duration')}</p>
                  <p className="font-medium">
                    {differenceInDays(
                      new Date(rental.expected_end_date || new Date()),
                      new Date(rental.start_date || new Date())
                    )} days (original)
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground">{t('outstanding_balance')}</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(
                      invoices.data
                        ?.filter(inv => inv.status !== 'paid')
                        .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('late_fees')}</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(rental.late_fees ||
                      (getDaysOverdue() * (rental.daily_late_fee || rental.daily_rate || 25)))}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSendReminder}
                disabled={isSendingReminder}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Payment Reminder
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrintInvoice}
                disabled={isPrintingInvoice}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-red-50 border-t border-red-100 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mr-2" />
          Overdue rentals may incur additional fees and affect customer rating.
        </CardFooter>
      </Card>

      {/* Tabs for overdue state - focused on invoices */}
      <Tabs defaultValue="invoices" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoicesCard
            rental={rental}
            invoices={{
              data: invoices.data || [],
              total: invoices.total || 0,
              total_amount: invoices.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
              total_paid: invoices.data?.filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
              total_outstanding: invoices.data?.filter(inv => inv.status !== 'paid')
                .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
              has_overdue: invoices.data?.some(inv => inv.status !== 'paid' &&
                inv.due_date && new Date(inv.due_date) < new Date()) || false,
            }}
            canCreateInvoice={permissions.generate_invoice}
          />
        </TabsContent>

        <TabsContent value="items">
          <RentalItemsCard
            rentalId={rental.id}
            items={rentalItems.data}
            canAddItems={false} // In overdue state, items are locked
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

















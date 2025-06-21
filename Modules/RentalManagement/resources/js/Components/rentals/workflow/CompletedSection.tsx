import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Core";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { differenceInDays, format } from "date-fns";
import { CheckCircle, FileText, Printer, Download, BarChart3, MessageSquare, Star } from "lucide-react";
import RentalItemsCard from "../RentalItemsCard";
import InvoicesCard from "../InvoicesCard";
import DocumentsCard from "../DocumentsCard";
import RentalAnalytics from "../RentalAnalytics";
import { formatCurrency } from "@/Core";
import { Progress } from "@/Core";

// Define interface for document
interface AttachedDocument {
  id: number;
  name: string;
  type?: string;
  url: string;
}

// Interface for CompletedSection props
interface CompletedSectionProps {
  rental: any;
  rentalItems: {
    data: any[];
    total: number;
  };
  invoices: {
    data: any[];
    total: number;
  };
  maintenanceRecords?: {
    data: any[];
    total: number;
  };
  weatherData?: any;
  metrics?: {
    rentalEfficiency: number;
    profitMargin: number;
    equipmentUtilization: number;
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
}

export default function CompletedSection({
  rental,
  rentalItems,
  invoices,
  maintenanceRecords,
  weatherData,
  metrics,
  permissions
}: CompletedSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("summary");
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  // Calculate rental duration
  const getRentalDuration = () => {
    if (!rental.start_date || !rental.actual_end_date) {
      return 'N/A';
    }

    const startDate = new Date(rental.start_date);
    const endDate = new Date(rental.actual_end_date);
    const days = differenceInDays(endDate, startDate);

    return `${days} days`;
  };

  // Get formatted completion date
  const getCompletionDate = () => {
    if (!rental.completed_at) {
      return 'Unknown';
    }

    return format(new Date(rental.completed_at), 'PPP');
  };

  // Calculate profit
  const getProfit = () => {
    const revenue = rental.total_amount || 0;
    // Assume costs are 60% of revenue for this example
    const costs = revenue * 0.6;
    return revenue - costs;
  };

  // Generate report
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);

    // In a real implementation, call an API endpoint to generate report
    setTimeout(() => {
      setIsGeneratingReport(false);
      window.open(`/rentals/${rental.id}/report`, '_blank');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Completed rental alert */}
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>{t('ttl_rental_completed')}</AlertTitle>
        <AlertDescription>
          This rental has been successfully completed on {getCompletionDate()}.
        </AlertDescription>
      </Alert>

      {/* Tabs for completed state */}
      <Tabs defaultValue="summary" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('rental_summary')}</CardTitle>
                  <CardDescription>
                    Overview of the completed rental
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-400">
                  Completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Summary stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-1">
                        <h3 className="text-sm font-medium text-green-800">{t('total_revenue')}</h3>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(rental.total_amount || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-1">
                        <h3 className="text-sm font-medium text-blue-800">{t('rental_duration')}</h3>
                        <p className="text-2xl font-bold text-blue-700">
                          {getRentalDuration()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-1">
                        <h3 className="text-sm font-medium text-purple-800">{t('profit_margin')}</h3>
                        <p className="text-2xl font-bold text-purple-700">
                          {metrics?.profitMargin || Math.round((getProfit() / (rental.total_amount || 1)) * 100)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key information */}
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h3 className="font-medium">{t('rental_details')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-muted-foreground">Rental #:</p>
                      <p className="font-medium">{rental.rental_number}</p>

                      <p className="text-muted-foreground">Start Date:</p>
                      <p className="font-medium">
                        {rental.start_date ? format(new Date(rental.start_date), 'PP') : 'N/A'}
                      </p>

                      <p className="text-muted-foreground">End Date:</p>
                      <p className="font-medium">
                        {rental.actual_end_date ? format(new Date(rental.actual_end_date), 'PP') : 'N/A'}
                      </p>

                      <p className="text-muted-foreground">Total Items:</p>
                      <p className="font-medium">{rentalItems.data.length}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">{t('financial_summary')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-muted-foreground">Subtotal:</p>
                      <p className="font-medium">{formatCurrency(rental.subtotal || 0)}</p>

                      <p className="text-muted-foreground">Tax:</p>
                      <p className="font-medium">{formatCurrency(rental.tax_amount || 0)}</p>

                      <p className="text-muted-foreground">Discounts:</p>
                      <p className="font-medium">-{formatCurrency(rental.discount || 0)}</p>

                      <p className="text-muted-foreground">Total:</p>
                      <p className="font-medium">{formatCurrency(rental.total_amount || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {isGeneratingReport ? "Generating..." : "Generate Report"}
                  </Button>

                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`/rentals/${rental.id}/print`} target="_blank">
                      <Printer className="mr-2 h-4 w-4" />
                      Print Summary
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-green-50 border-t border-green-100 justify-between">
              <div className="flex items-center text-green-700 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Successfully completed
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

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
            canAddItems={false} // In completed state, items are locked
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
            canUpload={permissions.update}
            canDelete={false} // Don't allow deletion of documents for completed rentals
          />
        </TabsContent>

        <TabsContent value="analytics">
          <RentalAnalytics 
            rental={rental}
            maintenanceRecords={maintenanceRecords?.data}
            weatherData={weatherData}
            metrics={metrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}















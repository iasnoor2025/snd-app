import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import RentalItemsCard from "../RentalItemsCard";
import InvoicesCard from "../InvoicesCard";
import { MaintenanceRecordList } from "@/Core";
import DocumentsCard from "../DocumentsCard";
import RentalAnalytics from "../RentalAnalytics";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import { AlertCircle, Clock } from "lucide-react";
import { differenceInDays } from "date-fns";
import StatusTimeline from '../StatusTimeline';

// Document type for attached documents
interface AttachedDocument {
  id: number;
  name: string;
  type?: string;
  url: string;
}

interface ActiveSectionProps {
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

export default function ActiveSection({
  rental,
  rentalItems,
  invoices,
  maintenanceRecords,
  weatherData,
  metrics,
  permissions
}: ActiveSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("items");

  // Check if rental is nearing completion (within 3 days of expected end date)
  const isNearingCompletion = () => {
    if (!rental.expected_end_date) return false;

    const expectedEndDate = new Date(rental.expected_end_date);
    const today = new Date();
    const daysRemaining = differenceInDays(expectedEndDate, today);

    return daysRemaining >= 0 && daysRemaining <= 3;
  };

  return (
    <div className="space-y-4">
      {/* Active rental alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>{t('ttl_active_rental')}</AlertTitle>
        <AlertDescription>
          This rental is currently active. Equipment is in use and the rental period is ongoing.
        </AlertDescription>
      </Alert>

      {/* Workflow history / audit trail */}
      <StatusTimeline rental={rental} />

      {/* Warning message if rental is nearing completion */}
      {isNearingCompletion() && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_rental_ending_soon')}</AlertTitle>
          <AlertDescription>
            This rental is scheduled to end within the next 3 days. Consider extending if needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <RentalItemsCard
            rentalId={rental.id}
            items={rentalItems.data}
            canAddItems={permissions.update}
          />
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

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>{t('ttl_maintenance_records')}</CardTitle>
              <CardDescription>{t('equipment_maintenance_history')}</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRecords && maintenanceRecords.data.length > 0 ? (
                <MaintenanceRecordList records={maintenanceRecords.data} />
              ) : (
                <div className="text-center py-6">
                  <p className="mt-2 text-lg font-medium">{t('no_maintenance_records')}</p>
                  <p className="text-sm text-muted-foreground">
                    Maintenance records will appear here when created.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
            canDelete={permissions.update}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <RentalAnalytics
            rental={rental}
            metrics={metrics}
            weatherData={weatherData}
            maintenanceRecords={maintenanceRecords?.data || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}















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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { format } from "date-fns";
import { Button } from "@/Core";
import axios from "axios";

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
  const [returnDialogOpen, setReturnDialogOpen] = React.useState(false);
  const [returnDate, setReturnDate] = React.useState<Date | null>(new Date());
  const [isReturning, setIsReturning] = React.useState(false);

  // Check if rental is nearing completion (within 3 days of expected end date)
  const isNearingCompletion = () => {
    if (!rental.expected_end_date) return false;

    const expectedEndDate = new Date(rental.expected_end_date);
    const today = new Date();
    const daysRemaining = differenceInDays(expectedEndDate, today);

    return daysRemaining >= 0 && daysRemaining <= 3;
  };

  const handleReturn = async () => {
    if (!returnDate) return;
    setIsReturning(true);
    try {
      await axios.post(`/api/rentals/${rental.id}/return`, {
        return_date: format(returnDate, 'yyyy-MM-dd'),
        return_condition: 'good', // TODO: Add real input for condition
      });
      window.location.reload();
    } catch (e) {
      setIsReturning(false);
      // TODO: Add toast error
    }
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
          <div className="flex justify-between items-center mb-2">
            <RentalItemsCard
              rentalId={rental.id}
              items={rentalItems.data}
              canAddItems={permissions.update}
              equipment={rental.dropdowns?.equipment || []}
              operators={rental.dropdowns?.employees || []}
            />
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4">{t('btn_return_rental', 'Return')}</Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>{t('ttl_return_rental', 'Return Rental')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <label className="block text-sm font-medium">{t('return_date', 'Return Date')}</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={returnDate ? format(returnDate, 'yyyy-MM-dd') : ''}
                    onChange={e => setReturnDate(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleReturn} disabled={isReturning}>
                    {isReturning ? t('processing', 'Processing...') : t('btn_confirm_return', 'Confirm Return')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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















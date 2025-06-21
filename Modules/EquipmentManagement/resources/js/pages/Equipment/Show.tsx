import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from "@/layouts/AppLayout";
import { formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Pencil,
  Trash,
  Wrench,
  Settings,
  Calendar,
  Tag,
  MapPin,
  Coins,
  FileText,
  Eye,
  Download,
  Upload,
  FileIcon,
  X,
  Loader2,
  RefreshCw,
  Printer,
  Car,
  Truck,
  Award,
  IdCard,
  Plus,
  History
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import RiskManagement from './Risk/Management';
import { useTranslation } from 'react-i18next';
import { usePermission } from "@/hooks/usePermission";
import { Equipment } from '../../types';
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { number, string } from 'zod';

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  type: string;
  description: string;
  cost: number;
  date: string;
  technician: string;
  status: string;
}

export interface MaintenanceFilters {
  search?: string;
  equipment_id?: number;
  maintenance_type?: string;
  date_from?: string;
  date_to?: string;
  performed_by?: string;
}

export interface RentalFilters {
  search?: string;
  equipment_id?: number;
  customer_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface RentalItem {
  id: number;
  equipment_id: number;
  customer_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  rental_rate?: number;
  total_cost?: number;
}

export interface ProjectEquipment {
  id: number;
  equipment_id: number;
  project_name?: string;
  assigned_date?: string;
  return_date?: string;
  status?: string;
  usage_hours?: number;
}

interface Props {
  equipment: Equipment;
  maintenanceRecords: {
    data: MaintenanceRecord[];
    total: number;
  };
  rentalItems: {
    data: RentalItem[];
    total: number;
  };
  maintenanceFilters: MaintenanceFilters;
  rentalFilters: RentalFilters;
  projectHistory: {
    filters: RentalFilters;
    data: ProjectEquipment[];
    total: number;
  };
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Equipment', href: '/equipment' },
  { title: 'Equipment Details', href: window.location.pathname },
];

export default function Show({ equipment, rentalItems = { data: [], total: 0 }, maintenanceRecords = { data: [], total: 0 }, projectHistory = { data: [], total: 0 } }: Props) {
  const { auth } = usePage<any>().props;
  const { hasPermission } = usePermission();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [mediaItems, setMediaItems] = React.useState<Array<{ id: number; file_name: string; collection: string; original_url: string }>>([]);
  const [previewDocument, setPreviewDocument] = React.useState<{ id: number; file_name: string; collection: string; original_url: string } | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [files, setFiles] = React.useState<Record<string, File | null>>({
    istimara: null,
    documents: null
  });
  const [documentUploadKey, setDocumentUploadKey] = React.useState(0);
  const { t } = useTranslation('equipment');

  // Define canManageDocuments based on user permissions
  const canManageDocuments = auth.permissions?.includes('equipment.edit') || auth.permissions?.includes('documents.upload');

  // Fetch media items
  React.useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        // Check if user has permission to view media library
        if (!hasPermission('equipment.view')) {
          console.error('Permission denied: equipment.view permission required');
          return;
        }

        // Using window.route helper for consistent URL generation
        const response = await axios.get(window.route('equipment.media-library', { equipment: equipment.id }));
        setMediaItems(response.data.data || []);
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    fetchMediaItems();
  }, [equipment.id]);

  // Process rental items to prevent undefined errors
  const processRentalItems = React.useMemo(() => {
    return {
      data: (rentalItems?.data || []).map(item => {
        // Create a safe copy with all required properties
        const safeItem = { ...item };

        // Ensure rental exists and has a customer
        if (!safeItem.customer_name) {
          safeItem.customer_name = 'Unknown';
          safeItem.start_date = '';
          safeItem.end_date = '';
          safeItem.status = 'pending' as const;
          safeItem.total_cost = 0;
          safeItem.created_at = '';
          safeItem.updated_at = '';
          safeItem.customer = {
            id: 0,
            customer_id: 0,
            rental_number: '',
            start_date: '',
            expected_end_date: '',
            status: 'pending' as const,
            total_amount: 0,
            created_at: '',
            updated_at: '',
            customer: {
              id: 0,
              company_name: 'Unknown',
              contact_person: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              postal_code: '',
              country: '',
              tax_number: '',
              credit_limit: 0,
              payment_terms: '',
              notes: '',
              is_active: false,
              created_at: '',
              updated_at: ''
            }
          };
        } else if (!safeItem.customer_name) {
          // If rental exists but customer doesn't, add a fake customer
          safeItem.customer_name = 'Unknown';
          safeItem.start_date = '';
          safeItem.end_date = '';
          safeItem.status = 'pending' as const;
          safeItem.total_cost = 0;
          safeItem.created_at = '';
          safeItem.updated_at = '';
          safeItem.customer = {
            id: 0,
            company_name: 'Unknown',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            tax_number: '',
            credit_limit: 0,
            payment_terms: '',
            notes: '',
            is_active: false,
            created_at: '',
            updated_at: ''
          };
        }

        return safeItem;
      }),
      total: rentalItems?.total || 0
    };
  }, [rentalItems]);

  const handleDelete = () => {
    router.delete(window.route('equipment.destroy', { equipment: equipment.id }), {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Equipment deleted successfully"
          });
        window.location.href = window.route('equipment.index');
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete equipment",
            variant: "destructive"
          });
        }
      });
  };

  const getStatusBadge = (status: string) => {
    const label = renderString(status); // Use renderString to ensure it's a string
    if (!label || label === '—') return <Badge variant="outline">{t('unknown')}</Badge>;

    switch (label.toLowerCase()) {
      case 'available':
        return <Badge variant="default">{t('available')}</Badge>;
      case 'rented':
        return <Badge variant="secondary">{t('rented')}</Badge>;
      case 'maintenance':
        return <Badge variant="outline">{t('maintenance')}</Badge>;
      case 'retired':
        return <Badge variant="destructive">{t('retired')}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  const getMaintenanceStatusBadge = (status: string) => {
    const label = renderString(status); // Use renderString to ensure it's a string
    if (!label || label === '—') return <Badge variant="outline">{t('unknown')}</Badge>;

    switch (label.toLowerCase()) {
      case 'scheduled':
        return <Badge variant="secondary">{t('scheduled')}</Badge>;
      case 'in_progress':
        return <Badge variant="outline">{t('in_progress')}</Badge>;
      case 'completed':
        return <Badge variant="default">{t('completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  // Function to handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
    }
  };

  // Function to remove file
  const removeFile = (fileKey: string) => {
    setFiles(prev => ({
      ...prev,
      [fileKey]: null
    }));
  };

  // Function to handle direct upload of documents
  const handleDirectUpload = async (fileKey: string) => {
    if (!files[fileKey]) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', files[fileKey]);

    // Set document name based on fileKey
    const documentName = {
      istimara: 'Istimara',
      documents: 'Additional Document'
    }[fileKey] || '';

    formData.append('name', documentName);
    formData.append('type', fileKey);
    formData.append('is_additional', fileKey === 'documents' ? '1' : '0');

    try {
      const response = await axios.post(window.route('equipment.documents.upload', { equipment: equipment.id }), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: progress
          }));
        }
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Document uploaded successfully"
        });

        // Refresh media items
        const mediaResponse = await axios.get(window.route('equipment.media-library', { equipment: equipment.id }));
        setMediaItems(mediaResponse.data.data || []);

        // Clear the file
        setFiles(prev => ({
          ...prev,
          [fileKey]: null
        }));
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => ({
        ...prev,
        [fileKey]: 0
      }));
    }
  };

  // Document preview dialog
  const renderDocumentPreviewDialog = () => {
    if (!previewDocument) return null;

    const isPdf = previewDocument.file_name.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(previewDocument.file_name);

    return (
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewDocument.file_name}</DialogTitle>
            <DialogDescription>
              {previewDocument.collection === 'istimara' ? 'Istimara Document' : 'Additional Document'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-center">
            {isPdf && (
              <iframe
                src={`${previewDocument.original_url}#toolbar=0`}
                className="w-full h-[500px] border rounded"
                title={previewDocument.file_name}
              ></iframe>
            )}
            {isImage && (
              <img
                src={previewDocument.original_url}
                alt={previewDocument.file_name}
                className="max-w-full max-h-[500px] object-contain"
              />
            )}
            {!isPdf && !isImage && (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <FileIcon className="h-16 w-16 text-slate-400 mb-4" />
                <p className="text-slate-600">Preview not available for this file type</p>
                <p className="text-slate-400 text-sm">({previewDocument.file_name.split('.').pop()})</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => window.open(previewDocument.original_url, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Helper to render a value as a string with translation (handles multilingual objects)
  function renderString(val: any): string {
    if (!val) return '—';
    let translated = val;
    if (typeof val === 'string') translated = t(val);
    if (typeof val === 'object') {
      if (val.name) translated = t(val.name);
      else if (val.en) translated = t(val.en);
      else {
        const first = Object.values(val).find(v => typeof v === 'string');
        if (first) translated = t(first);
      }
    }
    // If translated is an object (e.g., {en: ...}), extract the first string value
    if (typeof translated === 'object' && translated !== null) {
      const firstString = Object.values(translated).find(v => typeof v === 'string');
      if (firstString) return firstString;
      return '—';
    }
    if (typeof translated === 'string') return translated;
    return '—';
  }

  // Helper to render any value safely as a string, including numbers and dates
  function renderValue(val: any): string {
    console.log('renderValue input:', val); // Add this line for debugging
    if (!val) return '—';
    let translated = val; // Initialize translated with the original value

    if (typeof val === 'string') {
      translated = t(val);
    } else if (typeof val === 'number') {
      return String(val); // Numbers are fine
    } else if (val instanceof Date) {
      return val.toLocaleDateString(); // Dates are fine
    } else if (typeof val === 'object') {
      if (val.name) translated = t(val.name);
      else if (val.en) translated = t(val.en);
      else {
        const first = Object.values(val).find(v => typeof v === 'string' || typeof v === 'number');
        if (first) translated = String(first);
      }
    }

    // Crucial: If 'translated' itself is now an object (e.g., from t()), extract the string
    if (typeof translated === 'object' && translated !== null) {
      console.log('renderValue returning object:', translated); // Add this line for debugging
      const firstString = Object.values(translated).find(v => typeof v === 'string' || typeof v === 'number');
      if (firstString) return String(firstString);
      return '—';
    }

    // Ensure final output is a string
    if (typeof translated === 'string' || typeof translated === 'number') {
      return String(translated);
    }

    return '—';
  }

  return (
    <AppLayout
      title="Equipment Details"
      breadcrumbs={breadcrumbs}
      requiredPermission="equipment.view"
    >
      <Head title="Equipment Details" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">
                {t('equipment_details')}
              </CardTitle>
              <CardDescription className="mt-1">
                {/* Add more details as needed */}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={window.route('equipment.index')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {renderValue(t('back_to_equipment_list'))}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={window.route('equipment.edit', { equipment: equipment.id })}>
                  {renderValue(t('edit'))}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">{renderValue(t('basic_info'))}</TabsTrigger>
                <TabsTrigger value="financial">{renderValue(t('financial'))}</TabsTrigger>
                <TabsTrigger value="maintenance">{renderValue(t('maintenance'))}</TabsTrigger>
                <TabsTrigger value="metrics">{renderValue(t('metrics'))}</TabsTrigger>
                <TabsTrigger value="risk">{renderValue(t('risk_management'))}</TabsTrigger>
                <TabsTrigger value="projects">{renderValue(t('projects_rentals'))}</TabsTrigger>
                <TabsTrigger value="documents">{renderValue(t('documents'))}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('equipment_name')}</Label>
                    <p className="text-sm">{renderValue(equipment.name)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('model_number')}</Label>
                    <p className="text-sm">{renderValue(equipment.model_number)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('manufacturer')}</Label>
                    <p className="text-sm">{renderValue(equipment.manufacturer)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('serial_number')}</Label>
                    <p className="text-sm">{renderValue(equipment.serial_number)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('door_number')}</Label>
                    <p className="text-sm">{renderValue(equipment.door_number)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('status')}</Label>
                    <div>{getStatusBadge(equipment.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('category')}</Label>
                    <p className="text-sm">{renderString(equipment.category)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('unit')}</Label>
                    <p className="text-sm">{renderValue(equipment.unit)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('location')}</Label>
                    <p className="text-sm">{renderString(equipment.location)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('active_status')}</Label>
                    <Badge variant={equipment.is_active ? 'default' : 'secondary'}>
                      {equipment.is_active ? renderString(t('active')) : renderString(t('inactive'))}
                    </Badge>
                  </div>
                </div>
                {equipment.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('description')}</Label>
                    <p className="text-sm">{renderValue(equipment.description)}</p>
                  </div>
                )}
                {equipment.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('notes')}</Label>
                    <p className="text-sm">{renderValue(equipment.notes)}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('daily_rate')}</Label>
                    <p className="text-sm font-semibold">{formatCurrency(equipment.daily_rate || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('weekly_rate')}</Label>
                    <p className="text-sm font-semibold">{formatCurrency(equipment.weekly_rate || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('monthly_rate')}</Label>
                    <p className="text-sm font-semibold">{formatCurrency(equipment.monthly_rate || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('default_unit_cost')}</Label>
                    <p className="text-sm">{formatCurrency(equipment.default_unit_cost || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('purchase_price')}</Label>
                <p className="text-sm">{formatCurrency(equipment.purchase_price || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('purchase_date')}</Label>
                    <p className="text-sm">{renderValue(equipment.purchase_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('warranty_expiry_date')}</Label>
                    <p className="text-sm">{renderValue(equipment.warranty_expiry_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('lifetime_maintenance_cost')}</Label>
                    <p className="text-sm">{formatCurrency(equipment.lifetime_maintenance_cost || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_cost_per_hour')}</Label>
                    <p className="text-sm">{formatCurrency(equipment.avg_operating_cost_per_hour || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_cost_per_mile')}</Label>
                    <p className="text-sm">{formatCurrency(equipment.avg_operating_cost_per_mile || 0)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('last_maintenance')}</Label>
                    <p className="text-sm">{renderValue(equipment.last_maintenance_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('next_maintenance')}</Label>
                    <p className="text-sm">{renderValue(equipment.next_maintenance_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('next_performance_review')}</Label>
                    <p className="text-sm">{renderValue(equipment.next_performance_review)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('efficiency_rating')}</Label>
                    <p className="text-sm">{renderValue(equipment.efficiency_rating) ? `${renderValue(equipment.efficiency_rating)}%` : '—'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_operating_hours')}</Label>
                    <p className="text-sm">{renderValue(equipment.current_operating_hours)} {t('hrs')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_mileage')}</Label>
                    <p className="text-sm">{renderValue(equipment.current_mileage)} {t('miles')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_cycle_count')}</Label>
                    <p className="text-sm">{renderValue(equipment.current_cycle_count)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_operating_hours')}</Label>
                    <p className="text-sm">{renderValue(equipment.initial_operating_hours)} {t('hrs')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_mileage')}</Label>
                    <p className="text-sm">{renderValue(equipment.initial_mileage)} {t('miles')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_cycle_count')}</Label>
                    <p className="text-sm">{renderValue(equipment.initial_cycle_count)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_daily_usage_hours')}</Label>
                    <p className="text-sm">{renderValue(equipment.avg_daily_usage_hours)} {t('hrs_per_day')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_daily_usage_miles')}</Label>
                    <p className="text-sm">{renderValue(equipment.avg_daily_usage_miles)} {t('miles_per_day')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('last_metric_update')}</Label>
                    <p className="text-sm">{renderValue(equipment.last_metric_update)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <RiskManagement equipmentId={equipment.id} />
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="grid gap-6">
                  {/* Current Projects/Rentals */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {t('current_projects_rentals')}
                      </CardTitle>
                      <CardDescription>
                        {t('equipment_currently_assigned_projects_rentals')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rentalItems.data.length > 0 || projectHistory.data.length > 0 ? (
                        <div className="space-y-4">
                          {/* Rental Items */}
                          {rentalItems.data.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 text-sm text-muted-foreground">{t('active_rentals')}</h4>
                              <div className="space-y-2">
                                {rentalItems.data.map((rental) => (
                                  <div key={rental.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Truck className="h-4 w-4 text-blue-500" />
                                      <div>
                                        <p className="font-medium text-sm">{renderValue(rental.customer_name)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {renderValue(rental.start_date)} - {renderValue(rental.end_date)}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {renderValue(rental.status)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Project History */}
                          {projectHistory.data.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 text-sm text-muted-foreground">{t('project_assignments')}</h4>
                              <div className="space-y-2">
                                {projectHistory.data.map((project) => (
                                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Settings className="h-4 w-4 text-green-500" />
                                      <div>
                                        <p className="font-medium text-sm">{renderValue(project.project_name)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {t('assigned')}: {renderValue(project.assigned_date)}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary">
                                      {renderValue(project.status)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No Projects/Rentals found */}
                          {rentalItems.data.length === 0 && projectHistory.data.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>{t('no_projects_rentals_found_for_this_equipment')}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>{t('no_projects_rentals_found_for_this_equipment')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Usage History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t('usage_history')}
                      </CardTitle>
                      <CardDescription>
                        {t('historical_usage_across_projects_rentals')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{rentalItems.total}</div>
                            <div className="text-sm text-muted-foreground">{t('total_rentals')}</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{projectHistory.total}</div>
                            <div className="text-sm text-muted-foreground">{t('total_projects')}</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{equipment.current_operating_hours || 0}</div>
                            <div className="text-sm text-muted-foreground">{t('operating_hours')}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid gap-6">
                  {/* Document Upload Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t('equipment_documents')}
                      </CardTitle>
                      <CardDescription>
                        {t('rc_registration_certificate_insurance_important_documents')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {canManageDocuments && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">{t('upload_equipment_documents')}</p>
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('upload_rc')}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('upload_insurance')}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('upload_other')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documents List */}
                      <div className="space-y-4">
                        {mediaItems.length > 0 ? (
                          <div className="grid gap-3">
                            {mediaItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded">
                                    {item.collection === 'istimara' ? (
                                      <IdCard className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <FileIcon className="h-4 w-4 text-blue-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.file_name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {item.collection === 'istimara' ? 'Registration Certificate (RC)' : 'Document'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setPreviewDocument(item);
                                      setShowPreviewDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(item.original_url, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {canManageDocuments && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('no_documents_uploaded_yet')}</p>
                            <p className="text-sm">{t('upload_rc_insurance_important_documents')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {t('document_categories')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <IdCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium text-sm">{t('registration_certificate')}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {mediaItems.filter(item => item.collection === 'istimara').length} files
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <div className="font-medium text-sm">{t('insurance_documents')}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {mediaItems.filter(item => item.collection === 'insurance').length} files
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <div className="font-medium text-sm">{t('maintenance_records')}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {mediaItems.filter(item => item.collection === 'maintenance').length} files
                          </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <FileIcon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                          <div className="font-medium text-sm">{t('other_documents')}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {mediaItems.filter(item => !['istimara', 'insurance', 'maintenance'].includes(item.collection)).length} files
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}




















import React from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import axios from 'axios';
import AppLayout from '@/Core/layouts/AppLayout';
import { formatCurrency } from '@/Core/utils/format';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  CardFooter
} from '@/Core/components/ui';
import TextLink from '@/Core/components/text-link';
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
import { cn } from '@/Core/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/Core/hooks/usePermission';
import { Equipment } from '../../types';
import { User, PageProps } from '@/Core/types';

interface MediaItem {
  id: number;
  file_name: string;
  collection: string;
  original_url: string;
  mime_type: string;
  size: number;
  custom_properties: Record<string, any>;
}

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

interface RentalCustomer {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tax_number: string;
  credit_limit: number;
  payment_terms: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RentalDetails {
  id: number;
  customer_id: number;
  rental_number: string;
  start_date: string;
  expected_end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer: RentalCustomer;
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
  created_at?: string;
  updated_at?: string;
  customer?: RentalDetails;
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
  rentalItems?: {
    data: RentalItem[];
    total: number;
  };
  maintenanceRecords?: {
    data: MaintenanceRecord[];
    total: number;
  };
  projectHistory?: {
    data: ProjectEquipment[];
    total: number;
  };
  auth: {
    user: User;
    permissions: string[];
  };
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Equipment', href: '/equipment' },
  { title: 'Equipment Details', href: window.location.pathname },
];

export default function Show({ equipment, rentalItems = { data: [], total: 0 }, maintenanceRecords = { data: [], total: 0 }, projectHistory = { data: [], total: 0 }, auth }: Props) {
  const { hasPermission } = usePermission();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([]);
  const [previewDocument, setPreviewDocument] = React.useState<MediaItem | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [files, setFiles] = React.useState<Record<string, File | null>>({
    images: null,
    manuals: null,
    specifications: null,
    certifications: null
  });
  const [documentUploadKey, setDocumentUploadKey] = React.useState(0);
  const { t } = useTranslation('equipment');

  // Define canManageDocuments based on user permissions
  const canManageDocuments = hasPermission('equipment.edit') || hasPermission('documents.upload');

  // Fetch media items
  React.useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        const response = await axios.get(`/api/v1/equipment/${equipment.id}/media`);
        const mediaData = response.data.media || {};
        const allMedia = [
          ...(mediaData.images || []),
          ...(mediaData.manuals || []),
          ...(mediaData.specifications || []),
          ...(mediaData.certifications || [])
        ];
        setMediaItems(allMedia);
      } catch (error: any) {
        console.error('Error fetching media items:', error);
        
        if (error.response?.status === 403) {
          toast.error(t('errors.no_media_permission'));
        } else {
          toast.error(t('errors.failed_to_load_media'));
        }
      }
    };

    if (equipment.id) {
      fetchMediaItems();
    }
  }, [equipment.id]);

  // Handle file upload
  const handleFileUpload = async (fileKey: string, file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', fileKey);

    try {
      setIsUploading(true);
      const response = await axios.post(
        `/api/v1/equipment/${equipment.id}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
            }
          },
        }
      );

      // Refresh media items
      const mediaResponse = await axios.get(`/api/v1/equipment/${equipment.id}/media`);
      const mediaData = mediaResponse.data.media || {};
      const allMedia = [
        ...(mediaData.images || []),
        ...(mediaData.manuals || []),
        ...(mediaData.specifications || []),
        ...(mediaData.certifications || [])
      ];
      setMediaItems(allMedia);

      toast.success(t('messages.file_uploaded_successfully'));
      setFiles(prev => ({ ...prev, [fileKey]: null }));
      setDocumentUploadKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || t('errors.file_upload_failed'));
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Handle file deletion
  const handleFileDelete = async (mediaItem: MediaItem) => {
    try {
      await axios.delete(`/api/v1/equipment/${equipment.id}/media/${mediaItem.id}`);
      setMediaItems(prev => prev.filter(item => item.id !== mediaItem.id));
      toast.success(t('messages.file_deleted_successfully'));
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(error.response?.data?.message || t('errors.file_deletion_failed'));
    }
  };

  // Process rental items to prevent undefined errors
  const processRentalItems = React.useMemo(() => {
    return {
      data: (rentalItems?.data || []).map(item => {
        // Create a safe copy with all required properties
        const safeItem = { ...item };

        // If no customer data exists, set defaults
        if (!safeItem.customer_name) {
          const defaultCustomer: RentalCustomer = {
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

          const defaultRental: RentalDetails = {
            id: 0,
            customer_id: 0,
            rental_number: '',
            start_date: '',
            expected_end_date: '',
            status: 'pending',
            total_amount: 0,
            created_at: '',
            updated_at: '',
            customer: defaultCustomer
          };

          safeItem.customer_name = 'Unknown';
          safeItem.start_date = '';
          safeItem.end_date = '';
          safeItem.status = 'pending';
          safeItem.total_cost = 0;
          safeItem.created_at = '';
          safeItem.updated_at = '';
          safeItem.customer = defaultRental;
        }

        return safeItem;
      }),
      total: rentalItems?.total || 0
    };
  }, [rentalItems]);

  const handleDelete = () => {
    router.delete(window.route('equipment.destroy', { equipment: equipment.id }), {
      onSuccess: () => {
        toast.success("Equipment deleted successfully");
        window.location.href = window.route('equipment.index');
      },
      onError: () => {
        toast.error("Failed to delete equipment");
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
    if (val === null || val === undefined) return '—';
    
    // Handle primitive types directly
    if (typeof val === 'string') return t(val);
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (val instanceof Date) return val.toLocaleDateString();
    
    // Handle objects
    if (typeof val === 'object') {
      // Handle status statistics object
      if ('available' in val || 'in_use' in val || 'maintenance' in val || 'retired' in val) {
        const stats = [];
        if (val.available) stats.push(`Available: ${val.available}`);
        if (val.in_use) stats.push(`In Use: ${val.in_use}`);
        if (val.maintenance) stats.push(`Maintenance: ${val.maintenance}`);
        if (val.retired) stats.push(`Retired: ${val.retired}`);
        return stats.join(', ') || '—';
      }

      // Handle translation objects
      if (val.en) return t(val.en);
      if (val.name) return t(val.name);
      
      // Handle other objects
      const firstValue = Object.values(val).find(v => 
        typeof v === 'string' || typeof v === 'number'
      );
      
      if (firstValue !== undefined) {
        return String(firstValue);
      }
    }
    
    return '—';
  }

  // Safe wrapper around renderValue to ensure we never render an object directly
  function safeRenderValue(val: any): React.ReactNode {
    if (val === null || val === undefined) return '—';
    
    // Handle status statistics object
    if (typeof val === 'object' && 
        ('available' in val || 'in_use' in val || 
         'maintenance' in val || 'retired' in val)) {
      const stats = [];
      if (val.available) stats.push(`Available: ${val.available}`);
      if (val.in_use) stats.push(`In Use: ${val.in_use}`);
      if (val.maintenance) stats.push(`Maintenance: ${val.maintenance}`);
      if (val.retired) stats.push(`Retired: ${val.retired}`);
      return stats.join(', ') || '—';
    }
    
    return renderValue(val);
  }

  // Handle file preview
  const handlePreview = (mediaItem: MediaItem) => {
    setPreviewDocument(mediaItem);
    setShowPreviewDialog(true);
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
              {t(`media.collections.${previewDocument.collection}`)}
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
                <p className="text-slate-600">{t('media.preview_not_available')}</p>
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
              {t('actions.download')}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowPreviewDialog(false)}
            >
              {t('actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
      handleFileUpload(fileKey, file);
    }
  };

  // Render file upload section
  const renderFileUpload = () => {
    if (!canManageDocuments) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(files).map((fileKey) => (
          <div key={fileKey} className="space-y-2">
            <Label htmlFor={fileKey}>{t(`media.collections.${fileKey}`)}</Label>
            <div className="flex items-center gap-2">
              <Input
                id={fileKey}
                type="file"
                key={`${documentUploadKey}-${fileKey}`}
                onChange={(e) => handleFileChange(e, fileKey)}
                accept={fileKey === 'images' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx'}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && uploadProgress[fileKey] > 0 && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-slate-500">{uploadProgress[fileKey]}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render media items by collection
  const renderMediaItems = (collection: string) => {
    const items = mediaItems.filter(item => item.collection === collection);
    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t(`media.collections.${collection}`)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm truncate">{item.file_name}</CardTitle>
                <CardDescription className="text-xs">
                  {formatFileSize(item.size)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                {item.mime_type.startsWith('image/') ? (
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <img
                      src={item.original_url}
                      alt={item.file_name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-slate-50 rounded-md">
                    <FileIcon className="h-12 w-12 text-slate-400" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(item)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('actions.preview')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(item.original_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('actions.download')}
                </Button>
                {canManageDocuments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileDelete(item)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    {t('actions.delete')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <AppLayout
      title={t('equipment_details')}
      breadcrumbs={breadcrumbs}
      requiredPermission="equipment.view"
    >
      <Head title={t('equipment_details')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.visit('/equipment')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('back_to_list')}
            </Button>
            <h1 className="text-2xl font-semibold">{equipment.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission('equipment.edit') && (
              <Button onClick={() => router.visit(`/equipment/${equipment.id}/edit`)}>
                <Pencil className="h-4 w-4 mr-1" />
                {t('edit')}
              </Button>
            )}
            {hasPermission('equipment.delete') && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-1" />
                {t('delete')}
              </Button>
            )}
          </div>
        </div>

        {/* Equipment Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">{safeRenderValue(t('basic_info'))}</TabsTrigger>
                <TabsTrigger value="financial">{safeRenderValue(t('financial'))}</TabsTrigger>
                <TabsTrigger value="maintenance">{safeRenderValue(t('maintenance'))}</TabsTrigger>
                <TabsTrigger value="metrics">{safeRenderValue(t('metrics'))}</TabsTrigger>
                <TabsTrigger value="risk">{safeRenderValue(t('risk_management'))}</TabsTrigger>
                <TabsTrigger value="projects">{safeRenderValue(t('projects_rentals'))}</TabsTrigger>
                <TabsTrigger value="documents">{safeRenderValue(t('documents'))}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('equipment_name')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.name)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('model_number')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.model_number)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('manufacturer')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.manufacturer)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('serial_number')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.serial_number)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('door_number')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.door_number)}</p>
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
                    <p className="text-sm">{safeRenderValue(equipment.unit)}</p>
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
                    <p className="text-sm">{safeRenderValue(equipment.description)}</p>
                  </div>
                )}
                {equipment.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('notes')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.notes)}</p>
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
                    <p className="text-sm">{safeRenderValue(equipment.purchase_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('warranty_expiry_date')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.warranty_expiry_date)}</p>
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
                    <p className="text-sm">{safeRenderValue(equipment.last_maintenance_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('next_maintenance')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.next_maintenance_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('next_performance_review')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.next_performance_review)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('efficiency_rating')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.efficiency_rating) ? `${safeRenderValue(equipment.efficiency_rating)}%` : '—'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_operating_hours')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.current_operating_hours)} {t('hrs')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_mileage')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.current_mileage)} {t('miles')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('current_cycle_count')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.current_cycle_count)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_operating_hours')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.initial_operating_hours)} {t('hrs')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_mileage')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.initial_mileage)} {t('miles')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('initial_cycle_count')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.initial_cycle_count)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_daily_usage_hours')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.avg_daily_usage_hours)} {t('hrs_per_day')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('avg_daily_usage_miles')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.avg_daily_usage_miles)} {t('miles_per_day')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t('last_metric_update')}</Label>
                    <p className="text-sm">{safeRenderValue(equipment.last_metric_update)}</p>
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
                                        <p className="font-medium text-sm">{safeRenderValue(rental.customer_name)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {safeRenderValue(rental.start_date)} - {safeRenderValue(rental.end_date)}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {safeRenderValue(rental.status)}
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
                                        <p className="font-medium text-sm">{safeRenderValue(project.project_name)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {t('assigned')}: {safeRenderValue(project.assigned_date)}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary">
                                      {safeRenderValue(project.status)}
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
                      {renderFileUpload()}

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
                                      handlePreview(item);
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

        {/* Media Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('media.title')}</CardTitle>
            <CardDescription>{t('media.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderFileUpload()}
            {renderMediaItems('images')}
            {renderMediaItems('manuals')}
            {renderMediaItems('specifications')}
            {renderMediaItems('certifications')}
            {mediaItems.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {t('media.no_files')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ... existing maintenance, rental history, etc. sections ... */}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_equipment')}</DialogTitle>
            <DialogDescription>
              {t('delete_equipment_confirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              {t('confirm_delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      {renderDocumentPreviewDialog()}
    </AppLayout>
  );
}

interface RiskManagementProps {
  equipmentId: number;
}

const RiskManagement: React.FC<RiskManagementProps> = ({ equipmentId }) => {
  // ... existing RiskManagement component code ...
  return null; // Or your actual implementation
};




















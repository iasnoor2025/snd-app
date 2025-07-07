import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from '@/Core/types';
import { Rental, RentalItem, PermissionString } from '@/Core/types/models';
import { AppLayout } from '@/Core';
import RentalItemsTable from '../../components/rentals/RentalItemsTable';
import RentalWorkflowStatus from '../../components/rentals/RentalWorkflowStatus';
import { format, differenceInDays, addDays, isAfter, isBefore } from "date-fns";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { cn } from "@/Core";
import axios from "axios";

// Shadcn UI Components
import { Button } from "@/Core";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Core";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/Core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Core";
import { Separator } from "@/Core";
import { Progress } from "@/Core";
import { Switch } from "@/Core";
import { Label } from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { Calendar } from "@/Core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Core";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/Core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Core";
import { ScrollArea } from "@/Core";

// Icons
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  CircleDollarSign,
  Clock,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Coins,
  Download,
  FileText,
  Home,
  Info as InfoIcon,
  Loader2,
  Pencil,
  Phone,
  ReceiptText,
  Printer,
  RefreshCw,
  Share2,
  ShieldCheck,
  Snowflake,
  Sun,
  Wrench as Tools,
  Truck,
  Trash,
  User,
  Users,
  ChevronRight,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Mail,
  FileSignature,
  Map,
  CreditCard,
  QrCode,
  BookOpenCheck,
  Wrench,
  CheckCircle,
  X,
  Bell,
  Zap,
  DollarSign
} from "lucide-react";
import { toast } from 'sonner';
import RentalAnalytics from '../../components/rentals/RentalAnalytics';
// import MaintenanceRecordList from '../../components/maintenance/MaintenanceRecordList';
// import PaymentStatusBadge from '../../components/shared/PaymentStatusBadge';
// import MapView from '../../components/maps/MapView';
import { formatCurrency } from "@/Core";

// Other components
import RentalTimeline from '../../components/rentals/RentalTimeline';
import RentalExtensionForm from '../../components/rentals/RentalExtensionForm';
// import DocumentsViewer from '../../components/documents/DocumentsViewer';

// Add import for QRCode component
import { QRCode } from "@/Core";
import { RentalWorkflowStepper } from '../../components/rentals/RentalWorkflowStepper';
import { RentalWorkflowActions } from '../../components/rentals/RentalWorkflowActions';

// Add Echo declaration for TypeScript
declare global {
  interface Window {
    Echo?: any;
  }
}

import RentalNotificationsPanel from '../../components/rentals/RentalNotificationsPanel';
import RentalExtensionDialog from '../../components/rentals/RentalExtensionDialog';
import QuotationGenerator from '../../components/rentals/QuotationGenerator';

// New components
import StatusTimeline from '../../components/rentals/StatusTimeline';
import InvoicesCard from '../../components/rentals/InvoicesCard';
import DocumentsCard from '../../components/rentals/DocumentsCard';

// Our custom components
import RentalInfoCard from '../../components/rentals/RentalInfoCard';
import CustomerCard from '../../components/rentals/CustomerCard';
import RentalItemsCard from '../../components/rentals/RentalItemsCard';
import RentalActionsCard from '../../components/rentals/RentalActionsCard';

// Lazy load workflow-specific components
const PendingSection = lazy(() => import("../../components/rentals/workflow/PendingSection"));
const QuotationSection = lazy(() => import("../../components/rentals/workflow/QuotationSection"));
const MobilizationSection = lazy(() => import("../../components/rentals/workflow/MobilizationSection"));
const ActiveSection = lazy(() => import("../../components/rentals/workflow/ActiveSection"));
const CompletedSection = lazy(() => import("../../components/rentals/workflow/CompletedSection"));
const CancelledSection = lazy(() => import("../../components/rentals/workflow/CancelledSection"));
const OverdueSection = lazy(() => import("../../components/rentals/workflow/OverdueSection"));

interface ExtendedRental extends Rental {
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  payment_method?: string;
  location?: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'overdue';
  weather_conditions?: string;
  equipment_condition?: 'excellent' | 'good' | 'fair' | 'poor';
  maintenance_history?: any[];
  documents?: any[];
  last_inspection_date?: string;
  next_inspection_date?: string;
  has_insurance?: boolean;
  has_warranty?: boolean;
  usage_hours?: number;
  attached_documents?: {
    id: number;
    name: string;
    type: string;
    url: string;
  }[];
  total_paid?: number;
  remaining_balance?: number;
  payment_progress?: number;
}

interface Props extends PageProps {
  rental: ExtendedRental & {
    customer: {
      id: number;
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    },
    rentalItems?: any[]
  };
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
  weatherData?: {
    temperature: number;
    conditions: string;
    humidity: number;
    wind_speed: number;
    icon: string;
  };
  nearbyEquipment?: {
    id: number;
    name: string;
    distance: number;
    status: string;
  }[];
  availableEquipment: Array<{
    id: string;
    name: string;
    type: string;
    model: string;
    daily_rate: number;
  }>;
  availableOperators: Array<{
    id: number;
    name: string;
    license_number: string;
    specialization: string;
  }>;
  nextPossibleStates?: string[];
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
  equipment: any[];
  timesheets: any[];
  payments: any[];
  location: any;
  translations: any;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  dropdowns: any;
}

export default function Show({
  auth,
  rental = {} as ExtendedRental & { customer: unknown },
  rentalItems = { data: [], total: 0 },
  invoices = { data: [], total: 0 },
  maintenanceRecords = { data: [], total: 0 },
  weatherData,
  nextPossibleStates = [],
  metrics = {
    rentalEfficiency: 85,
    profitMargin: 40,
    equipmentUtilization: 75
  },
  permissions = {
    view: true,
    update: false,
    delete: false,
    approve: false,
    complete: false,
    generate_invoice: false,
    view_timesheets: false,
    request_extension: false,
  },
  equipment = [],
  timesheets = [],
  payments = [],
  location = {},
  translations = {},
  created_at,
  updated_at,
  deleted_at,
  dropdowns = {},
  ...rest
}: Props) {
  const { t } = useTranslation('rental');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);
  const [isExtensionFormOpen, setIsExtensionFormOpen] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("items");
  const [showWeatherInfo, setShowWeatherInfo] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEchoInitialized, setIsEchoInitialized] = useState(false);
  const [isSimpleExtensionModalOpen, setIsSimpleExtensionModalOpen] = useState(false);
  const [simpleNewEndDate, setSimpleNewEndDate] = useState<Date | null>(
    rental.expected_end_date ? addDays(new Date(rental.expected_end_date), 7) : null
  );
  const [simpleReason, setSimpleReason] = useState('');
  const [isSimpleSubmitting, setIsSimpleSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Safety check for valid rental data
  const [dataLoaded, setDataLoaded] = useState(false);

  // Verify rental data exists and is valid
  useEffect(() => {
    // More comprehensive check for rental data
    const isValidRental = !!(rental && rental.id && typeof rental.id === 'number' && rental.rental_number && rental.customer);
                             if (!isValidRental) {
      console.error('Invalid rental data received:', rental);
      console.log('Component received props:', {
        rentalId: rental?.id,
        rentalNumber: rental?.rental_number,
        hasCustomer: !!rental?.customer,
        urlPath: window.location.pathname
      });

      // Use a more informative error message
      toast.error('Unable to load rental details. The data may be incomplete.');

      // Don't redirect immediately - give more time for debugging and potential data loading
      setTimeout(() => {
        router.visit('/rentals', {
          onBefore: () => {
            toast.info('Returning to rentals list');
            return true;
          }
        });
      }, 3000);
      return;
    }

    // Data is good, mark as loaded
    setDataLoaded(true);
    setIsLoading(false);

    console.log('Rental data validation completed successfully:', {
      isValid: isValidRental,
      rentalId: rental?.id,
      rentalNumber: rental?.rental_number,
      hasCustomer: !!rental?.customer,
      nextPossibleStates
    });
  }, [rental]);

  // Listen for page transitions
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Use document event listeners for Inertia.js events
    document.addEventListener('inertia:start', handleStart);
    document.addEventListener('inertia:finish', handleComplete);
    document.addEventListener('inertia:cancel', handleComplete);
    document.addEventListener('inertia:error', handleComplete);

    // Clean up
    return () => {
      document.removeEventListener('inertia:start', handleStart);
      document.removeEventListener('inertia:finish', handleComplete);
      document.removeEventListener('inertia:cancel', handleComplete);
      document.removeEventListener('inertia:error', handleComplete);
    };
  }, []);

  // Helper function to check permissions
  const can = (permission: PermissionString): boolean => {
    // Check if user is admin
    const isAdmin = !!(auth?.user as any)?.is_admin;

    // Check if user permissions include this permission
    let userHasPermission = false;
    if (auth?.user?.permissions) {
      const userPermissions = auth.user.permissions as unknown as string[];
      userHasPermission = userPermissions.includes(permission as string);
    }

    // Check if auth permissions include this permission
    let authHasPermission = false;
    if (auth?.permissions) {
      const authPermissions = auth.permissions as unknown as string[];
      authHasPermission = authPermissions.includes(permission as string);
    }

    return isAdmin || userHasPermission || authHasPermission;
  };

  // Use permissions for various actions
  const canEditRental = can('rentals.edit');
  const canDeleteRental = can('rentals.delete');
  const canExtendRental = can('rentals.extend');
  const canGenerateQuotation = can('quotations.create');
  const canManagePayments = can('payments.manage');
  const canManageDocuments = can('documents.upload');

  // Debug message to confirm component loading
  console.log('RENTAL SHOW COMPONENT LOADED!', {
    id: rental.id,
    rentalNumber: rental.rental_number,
    currentUrl: window.location.href,
    receivedProps: !!rental,
    nextPossibleStates
  });

  // Debug rental data structure
  useEffect(() => {
    console.log('Show.tsx - Full rental data:', rental);
    console.log('Show.tsx - Customer data:', rental.customer);
    console.log('Show.tsx - Next possible states:', nextPossibleStates);

    // Log additional diagnostic info
    console.log('Show.tsx - Component Props:', {
      hasAuth: !!auth,
      hasRental: !!rental,
      hasRentalItems: !!rentalItems,
      rentalItemsCount: rentalItems?.data?.length || 0,
      rentalId: rental.id,
      url: window.location.href,
      pathname: window.location.pathname,
      nextPossibleStatesLength: nextPossibleStates?.length || 0,
      nextPossibleStatesIsArray: Array.isArray(nextPossibleStates)
    });
  }, [rental, nextPossibleStates]);

  // Function definitions moved up before they're used in useMemo hooks
  // Calculate rental efficiency
  const calculateRentalEfficiency = (rental: ExtendedRental, items: any[]) => {
    // For demonstration, return a percentage between 70-95%
    return Math.round(70 + Math.random() * 25);
  };

  // Calculate profit margin
  const calculateProfitMargin = (rental: ExtendedRental) => {
    // Ensure subtotal exists and is a number
    if (!rental || typeof rental.subtotal !== 'number' || rental.subtotal === 0) {
      return 0;
    }

    // For demonstration, calculate a profit margin percentage
    const costs = rental.subtotal * 0.6; // Assume costs are 60% of revenue
    const profit = rental.subtotal - costs;
    return Math.round((profit / rental.subtotal) * 100);
  };

  // Calculate equipment utilization
  const calculateEquipmentUtilization = (items: any[]) => {
    // For demonstration, return a percentage between 65-100%
    return Math.round(65 + Math.random() * 35);
  };

  // Calculate values for analytics
  const rentalEfficiency = useMemo(() => {
    try {
      return calculateRentalEfficiency(rental, rentalItems?.data || []);
    } catch (error) {
      console.error('Error calculating rental efficiency:', error);
      return 0; // Fallback value
    }
  }, [rental, rentalItems]);

  const profitMargin = useMemo(() => {
    try {
      return calculateProfitMargin(rental);
    } catch (error) {
      console.error('Error calculating profit margin:', error);
      return 0; // Fallback value
    }
  }, [rental]);

  const equipmentUtilization = useMemo(() => {
    try {
      return calculateEquipmentUtilization(rentalItems?.data || []);
    } catch (error) {
      console.error('Error calculating equipment utilization:', error);
      return 0; // Fallback value
    }
  }, [rentalItems]);

  // Check for any pending quotation generation flags from previous page loads
  useEffect(() => {
    const hasJustGeneratedQuotation = window.sessionStorage.getItem('generating_quotation_' + rental.id) === 'true';

    if (hasJustGeneratedQuotation) {
      window.sessionStorage.removeItem('generating_quotation_' + rental.id);
      window.location.reload();
    }

    // Initialize notifications based on local storage
    const notificationsState = localStorage.getItem(`rental_notifications_${rental.id}`);
    if (notificationsState !== null) {
      setIsNotificationsEnabled(notificationsState === 'true');
    }

    // For testing only: Force open the extension modal if status allows
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openExtension') === 'true' && ['active', 'pending'].includes(rental.status.toLowerCase())) {
      setTimeout(() => {
        openSimpleExtensionDialog();
      }, 1000);
    }
  }, [rental.id, rental.status]);

  // Handle extension request
  const handleExtensionRequest = (days: number) => {
    toast.success(`Extension request for ${days} days submitted successfully`);
    setIsExtensionFormOpen(false);
  };

  // Toggle notifications
  const handleToggleNotifications = () => {
    const newState = !isNotificationsEnabled;
    setIsNotificationsEnabled(newState);
    localStorage.setItem(`rental_notifications_${rental.id}`, String(newState));

    if (newState) {
      toast.success("Rental status notifications enabled");
    } else {
      toast.info("Rental status notifications disabled");
    }
  };

  // Share rental details
  const handleShareRental = () => {
    const rentalUrl = window.location.href;

    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: `Rental #${rental.rental_number}`,
        text: `Check details for rental #${rental.rental_number} with ${rental.customer.company_name}`,
        url: rentalUrl,
      })
      .then(() => {
        toast.success("Rental shared successfully");
      })
      .catch((error) => {
        console.error("Error sharing rental:", error);
        toast.error("Failed to share rental");
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(rentalUrl)
        .then(() => toast.success("Rental link copied to clipboard"))
      .catch(() => toast.error("Failed to copy rental link"));
    }
  };

  // Generate QR code for equipment tracking
  const getQRCodeData = () => {
    try {
      return {
        rental_number: rental.rental_number || 'Unknown',
        customer: rental.customer?.company_name || 'Unknown Customer',
        start_date: rental.start_date || 'N/A',
        end_date: rental.expected_end_date || 'N/A',
        status: rental.status || 'Unknown',
        url: window.location.href
      };
    } catch (error) {
      console.error("Error creating QR code data:", error);
      return {
        rental_number: 'Error',
        url: window.location.href
      };
    }
  };

  // Get weather status icon
  const getWeatherIcon = () => {
    if (!weatherData) return null;

    // Example mapping of conditions to icons
    const iconMap: Record<string, React.ReactNode> = {
      'clear': <Sun className="h-5 w-5 text-yellow-500" />,
      'cloudy': <Cloud className="h-5 w-5 text-gray-500" />,
      'rain': <CloudRain className="h-5 w-5 text-blue-500" />,
      'storm': <CloudLightning className="h-5 w-5 text-purple-500" />,
      'snow': <Snowflake className="h-5 w-5 text-blue-200" />,
    };

    return iconMap[weatherData.conditions.toLowerCase()] ||
      <Cloud className="h-5 w-5 text-gray-500" />;
  };

  // Get status badge with appropriate color and icon
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{t('active')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('rental_is_currently_active_and_equipment_is_in_use')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "pending":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{t('pending')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('rental_is_pending_approval_or_activation')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "completed":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-green-600 border-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{t('completed')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('rental_has_been_successfully_completed')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "cancelled":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <X className="h-3 w-3" />
                  <span>{t('cancelled')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('rental_has_been_cancelled')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "overdue":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{t('overdue')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('rental_period_has_exceeded_the_expected_end_date')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "quotation":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-blue-600 border-blue-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{t('quotation')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('quotation_has_been_generated_and_awaiting_customer')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "mobilization":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-orange-600 border-orange-400 flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>{t('mobilization')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('equipment_is_being_mobilized_to_the_customer_locat')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CircleDashed className="h-3 w-3" />
            <span>{status}</span>
          </Badge>
        );
    }
  };

  // Calculate rental duration progress
  const calculateProgress = () => {
    if (!rental.start_date || !rental.expected_end_date) return 0;

    const startDate = new Date(rental.start_date);
    const expectedEndDate = new Date(rental.expected_end_date);
    const today = new Date();

    // If rental hasn't started yet
    if (isBefore(today, startDate)) return 0;

    const totalDuration = differenceInDays(expectedEndDate, startDate) || 1; // Avoid division by zero
    const elapsedDuration = differenceInDays(today, startDate);

    if (elapsedDuration < 0) return 0;
    if (elapsedDuration > totalDuration) return 100;

    return Math.round((elapsedDuration / totalDuration) * 100);
  };

  // Check if rental is nearing completion (within 3 days of expected end date)
  const isNearingCompletion = () => {
    if (!rental.expected_end_date || rental.status === 'completed') return false;

    const expectedEndDate = new Date(rental.expected_end_date);
    const today = new Date();
    const daysRemaining = differenceInDays(expectedEndDate, today);

    return daysRemaining >= 0 && daysRemaining <= 3;
  };

  // Get customer initials for avatar
  const getCustomerInitials = (customerName: string) => {
    if (!customerName) return "CU";

    return customerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Replace the getCustomerInfo function at line 707 completely
  const getCustomerInfo = () => {
    // Check all possible paths where customer data might be found
    const customer = rental.customer;

    if (!customer) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('no_customer_information_available')}</p>
        </div>
      );
    }

    // Handle different property name variations for customer data using type assertion
    const customerAny = customer as unknown;
    const companyName = customerAny.company_name || customerAny.name || 'Unknown Company';
    const contactPerson = customerAny.contact_person || customerAny.contact_name || '';
    const email = customerAny.email || 'No email';
    const phone = customerAny.phone || 'No phone';
    const address = customerAny.address || 'No address';
    const city = customerAny.city || '';
    const state = customerAny.state || '';
    const zipCode = customerAny.zip_code || '';
    const country = customerAny.country || '';

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{companyName}</p>
        {contactPerson && (
          <p className="text-sm text-muted-foreground">
            <User className="h-3 w-3 inline mr-1" />
            {contactPerson}
          </p>
        )}
        {email && (
          <p className="text-sm text-muted-foreground">
            <Mail className="h-3 w-3 inline mr-1" />
            {email}
          </p>
        )}
        {phone && (
          <p className="text-sm text-muted-foreground">
            <Phone className="h-3 w-3 inline mr-1" />
            {phone}
          </p>
        )}
        {address && (
          <p className="text-sm text-muted-foreground">
            <Home className="h-3 w-3 inline mr-1" />
            {address}
            {(city || state || zipCode) && (
              <>
                <br />
                <span className="ml-4">
                  {[city, state, zipCode].filter(Boolean).join(', ')}
                </span>
              </>
            )}
            {country && (
              <>
                <br />
                <span className="ml-4">{country}</span>
              </>
            )}
          </p>
        )}
      </div>
    );
  };

  // Add a function to safely navigate to another page
  const navigateToPage = (url: string) => {
    try {
      // First try Inertia router
      router.visit(url);
    } catch (error) {
      // Fallback to window.location
      console.error("Router navigation error:", error);
      window.location.href = url;
    }
  };

  // Handle deleting the rental
  const handleDelete = () => {
    if (!canDeleteRental) {
      toast.error("You don't have permission to delete rentals");
      return;
    }

    router.delete(route("rentals.destroy", rental.id), {
      onSuccess: () => {
        toast.success("Rental deleted successfully");
        navigateToPage(route("rentals.index"));
      },
      onError: () => toast.error("Failed to delete rental"),
    });
  };

  // Progress of rental displayed as emoji
  const getRentalProgressEmoji = () => {
    const progress = calculateProgress();
    if (progress < 25) return "🟢";
    if (progress < 50) return "🟡";
    if (progress < 75) return "🟠";
    return "🟣";
  };

  // Get warning message if rental is nearing completion or overdue
  const getRentalWarningMessage = () => {
    if (rental.status === 'overdue') {
      return (
        <Alert variant="destructive" className="mt-4 animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_rental_overdue')}</AlertTitle>
          <AlertDescription>
            This rental has exceeded its expected end date. Please take action immediately.
          </AlertDescription>
        </Alert>
      );
    } else if (isNearingCompletion()) {
      return (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_rental_ending_soon')}</AlertTitle>
          <AlertDescription>
            This rental is scheduled to end within the next 3 days. Consider extending if needed.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // Initialize Echo for real-time updates
  useEffect(() => {
    if (!isEchoInitialized) {
      // Check if Echo exists on window
      if (window.Echo) {
        window.Echo.private(`rental.${rental.id}`)
          .listen('RentalStatusUpdated', (e: any) => {
            toast.info(`Rental status updated to ${e.status}`);
            router.reload({ preserveUrl: true });
          })
          .listen('RentalPaymentReceived', (e: any) => {
            toast.success(`Payment received: ${formatCurrency(e.amount)}`);
            router.reload({ preserveUrl: true });
          })
          .listen('RentalMaintenanceRequired', (e: any) => {
            toast.warning(`Maintenance required for ${e.equipment_name}`);
            setNotifications(prev => [...prev, {
              type: 'maintenance',
              message: `Maintenance required for ${e.equipment_name}`,
              timestamp: new Date()
            }]);
          })
          .listen('RentalOverdue', (e: any) => {
            toast.error('Rental is now overdue!');
            setNotifications(prev => [...prev, {
              type: 'overdue',
              message: 'Rental is now overdue!',
              timestamp: new Date()
            }]);
          });

        setIsEchoInitialized(true);
      }
    }

    return () => {
      if (isEchoInitialized && window.Echo) {
        window.Echo.leave(`rental.${rental.id}`);
      }
    };
  }, [rental.id, isEchoInitialized]);

  // Add a button click handler to open the simple extension dialog
  const openSimpleExtensionDialog = () => {
    // Check if rental is eligible for extension
    const nonExtendableStatuses = ['completed', 'cancelled'];
    if (nonExtendableStatuses.includes(rental.status.toLowerCase())) {
      toast.error(`Cannot extend a ${rental.status} rental`);
      return;
    }

    // Set the initial date to 7 days after current end date
    const newEndDateValue = rental.expected_end_date ?
      addDays(new Date(rental.expected_end_date), 7) :
      addDays(new Date(), 7);

    // Reset form state
    setSimpleNewEndDate(newEndDateValue);
    setSimpleReason('');
    setIsSimpleSubmitting(false);

    // Open the modal
    setIsSimpleExtensionModalOpen(true);
  };

  // Function to handle simple extension form submission
  const handleSimpleExtensionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!simpleNewEndDate) {
      toast.error("Please select a new end date");
      return;
    }

    if (!simpleReason.trim() || simpleReason.length < 10) {
      toast.error("Please provide a reason (minimum 10 characters)");
      return;
    }

    setIsSimpleSubmitting(true);

    const requestData = {
      new_end_date: format(simpleNewEndDate, 'yyyy-MM-dd'),
      reason: simpleReason,
      keep_operators: true // Default to keeping operators
    };

    // Send extension request to server
    axios.post(route('rentals.request-extension', rental.id), requestData)
      .then(response => {
        toast.success("Rental extension requested successfully");
        setIsSimpleExtensionModalOpen(false);
        router.reload();
      })
      .catch(error => {
        console.error('Extension error:', error);
        const errorMessage = error.response?.data?.message || "Failed to extend rental";
        toast.error(errorMessage);
        setIsSimpleSubmitting(false);
      });
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isSimpleExtensionModalOpen) {
      setIsSimpleSubmitting(false);
    }
  }, [isSimpleExtensionModalOpen]);

  // Calculate whether the rental has operators
  const hasOperators = useMemo(() => {
    return !!(rental.rentalItems && rental.rentalItems.some(item => item.operator_id !== null));
  }, [rental]);

  // Debug the rental status check
  const isStatusAllowingExtension = React.useMemo(() => {
    const statusCheck = ['active', 'pending'].includes((rental.status || '').toLowerCase());

    return statusCheck;
  }, [rental.status]);

  // Add effect to check if rental data loaded properly
  useEffect(() => {
    // If we're not in loading state and rental is missing or invalid
    if (!isLoading && (!rental || !rental.id)) {
      console.error('Rental data is missing or invalid, redirecting to index');

      // Show error toast
      try {
        toast.error('Could not load rental details. Redirecting to rentals list.');
      } catch (err) {
        console.error('Toast error:', err);
      }

      // Redirect to index page after a short delay
      setTimeout(() => {
        window.location.href = '/rentals';
      }, 1500);
    }
  }, [isLoading, rental]);

  // Add a function to handle rental extension success
  const handleExtensionSuccess = () => {
    router.reload({ preserveUrl: true });
  };

  // Function to render the correct section based on rental status
  const renderWorkflowSection = () => {
    // Create shared props for all workflow sections
    const sharedProps = {
      rental,
      rentalItems: rentalItems && Array.isArray(rentalItems.data) ? rentalItems : { data: [], total: 0 },
      invoices: invoices && Array.isArray(invoices.data) ? invoices : { data: [], total: 0 },
      maintenanceRecords: maintenanceRecords && Array.isArray(maintenanceRecords.data) ? maintenanceRecords : { data: [], total: 0 },
      weatherData,
      nextPossibleStates,
      metrics,
      permissions,
      onExtensionSuccess: handleExtensionSuccess
    };

    // Conditionally render based on status
    switch (rental.status.toLowerCase()) {
      case 'pending':
        return <PendingSection {...sharedProps} />;

      case 'quotation':
        return <QuotationSection {...sharedProps} />;

      case 'mobilization':
        return <MobilizationSection {...sharedProps} />;

      case 'active':
        return <ActiveSection {...sharedProps} />;

      case 'completed':
        return <CompletedSection {...sharedProps} />;

      case 'cancelled':
        return <CancelledSection {...sharedProps} />;

      case 'overdue':
        return <OverdueSection {...sharedProps} />;

      // If status doesn't match any of the above, fall back to Active section
      default:
        console.warn(`Unknown rental status: ${rental.status}, falling back to ActiveSection`);
        return <ActiveSection {...sharedProps} />;
    }
  };

  return (
    <AppLayout>
      <Head title={`Rental ${rental?.rental_number || '#' + rental?.id || ''}`} />

      {isLoading && (
        <div className="flex h-[50vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading rental details...</p>
          </div>
        </div>
      )}

      {!isLoading && !dataLoaded && (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">{t('unable_to_load_rental_details')}</h2>
          <p className="text-muted-foreground">The rental data could not be loaded properly.</p>
          <Button onClick={() => router.visit('/rentals')}>
            Return to Rentals List
          </Button>
        </div>
      )}

      {!isLoading && dataLoaded && (
        <div className="container mx-auto py-6">
          <div className="grid gap-6">
            {/* Header Card with Back Button */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{t('rental_number')}: {rental?.rental_number ?? '-'}</CardTitle>
                  <CardDescription>{rental?.customer?.company_name ?? '-'}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={route('rentals.index')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Rentals
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Info Cards */}
              <div className="md:col-span-1 space-y-6">
                {/* Rental Info Card */}
                <RentalInfoCard rental={{
                  id: rental.id,
                  rental_number: rental.rental_number,
                  status: rental.status,
                  start_date: rental.start_date,
                  expected_end_date: rental.expected_end_date,
                  actual_end_date: rental.actual_end_date || undefined,
                  total_amount: rental.total_amount,
                  quotation_id: rental.quotation_id,
                  approved_at: rental.approved_at,
                  completed_at: rental.completed_at,
                  customer: {
                    company_name: rental.customer?.company_name || 'Unknown Customer'
                  }
                }} />

                {/* Customer Card */}
                <CustomerCard customer={rental.customer} />

                {/* Actions Card */}
                <RentalActionsCard
                  rental={rental}
                  permissions={permissions}
                  onExtensionSuccess={handleExtensionSuccess}
                  onDelete={handleDelete}
                  onShareRental={handleShareRental}
                />

                {/* Notifications Panel */}
                <RentalNotificationsPanel
                  notifications={notifications}
                />
              </div>

              {/* Right Column: Main Content */}
              <div className="md:col-span-2">
                {/* Workflow Status */}
                <RentalWorkflowStatus
                  rental={rental}
                  nextPossibleStates={nextPossibleStates}
                  className="mb-6"
                />

                {/* Render the appropriate workflow section based on status */}
                <Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading content...</span>
                  </div>
                }>
                  {renderWorkflowSection()}
                </Suspense>

                {/* Status Timeline - Always visible across all statuses */}
                <StatusTimeline
                  rental={rental}
                  className="mt-6"
                />
              </div>
            </div>

            <DocumentsCard
              rentalId={rental.id}
              documents={rental.documents || []}
              canUpload={permissions.update}
              canDelete={permissions.update}
              className="mt-8"
            />
          </div>
        </div>
      )}

      {/* Extension Request Dialog */}
      <RentalExtensionDialog
        rentalId={rental.id}
        currentEndDate={rental.expected_end_date}
        isOpen={isSimpleExtensionModalOpen}
        onClose={() => setIsSimpleExtensionModalOpen(false)}
        onSuccess={handleExtensionSuccess}
      />
    </AppLayout>
  );
}



















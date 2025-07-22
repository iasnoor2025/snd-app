// Core Module - Root Index
// Export all shared functionality for reuse across modules

// Services
export { ToastService, toast } from './services/ToastService';
export type { ToastOptions } from './services/ToastService';

// Export other services and components as needed
export * from './services/avatar-service';
export * from './services/pushNotificationService';

// Components
export { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Components/ui';
export { default as FileUpload } from './Components/ui/FileUpload';
export { Input } from './Components/ui';
export { Button } from './Components/ui/button';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './Components/ui/sheet';
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from './Components/ui';
export { Tooltip, TooltipContent, TooltipTrigger } from './Components/ui';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './Components/ui';
export { Avatar, AvatarFallback, AvatarImage } from './Components/ui';
export { Label } from './Components/ui';
export { Textarea } from './Components/ui';
export { Card, CardContent, CardHeader, CardFooter } from './Components/ui';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Components/ui';
export { DialogHeader } from './Components/ui';
export { DialogClose } from './Components/ui';
export { CardTitle } from './Components/ui';
export { CardDescription } from './Components/ui';
export { Separator } from './Components/ui';
export { SmartAvatar } from './Components/ui';
export { MultiSelect } from './Components/ui';
export { DialogFooter } from './Components/ui';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Components/ui';
export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './Components/ui';
export { Progress } from './Components/ui';
export { Toggle } from './Components/ui';
export { Checkbox } from './Components/ui';
export { Switch } from './Components/ui';
export { Skeleton } from './Components/ui';

// Core Module - Shared Resources Index
// This file exports all shared resources for use by other modules

// Export all shared hooks
export * from './hooks';

// Export all shared utilities
export * from './utils';

// Export all shared types
export * from './types';

// Export all shared services
export * from './services';

// Export all shared libraries
export * from './lib';

// Re-export commonly used external libraries for consistency
export { createRoot } from 'react-dom/client';

export { createInertiaApp } from '@inertiajs/react';

export { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export { I18nextProvider, useTranslation } from 'react-i18next';

// Export theme and UI providers
export { ThemeProvider, useTheme } from './Components/theme-provider';

export { TooltipProvider } from './Components/ui/tooltip';

// Export common form libraries
export { Controller, useForm } from 'react-hook-form';

export { zodResolver } from '@hookform/resolvers/zod';

export * as z from 'zod';

// Export UI components
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Components/ui/table';
export { Badge, badgeVariants } from './Components/ui';

// Export layouts
export { default as AppLayout } from './layouts/AppLayout';

// Export utilities
export { formatCurrency, t } from './utils';

// Export types

// Export components
export {
    AppHeader,
    AppSidebar,
    AppearanceDropdown,
    AppearanceTabs,
    ApplicationLogo,
    Breadcrumbs,
    CreateButton,
    CrudButtons,
    DangerButton,
    DeleteUser,
    Dropdown,
    ErrorBoundary,
    Heading,
    HeadingSmall,
    InputError,
    InputLabel,
    LanguageSwitcher,
    LoadingSpinner,
    MaintenanceRecordList,
    Modal,
    NavFooter,
    NavLink,
    NavMain,
    NavUser,
    PaymentForm,
    Permission,
    PrimaryButton,
    ResponsiveNavLink,
    SecondaryButton,
    TextInput,
    ToastManager,
    TranslatableField,
    TranslatableText,
    UserInfo,
    UserMenuContent,
    ValidationErrors,
} from './Components';

// Export translation debug utilities
export { debugTranslationObject, isTranslatableObject, safeRender, withTranslationDebug } from './utils/debugTranslation';

// Export new Dashboard page
export { default as Dashboard } from './pages/Dashboard';

// Export new Dashboard widgets
export { default as ActivityFeed } from './Components/dashboard/ActivityFeed';
export { default as AnalyticsWidget } from './Components/dashboard/AnalyticsWidget';
export { default as AuditWidget } from './Components/dashboard/AuditWidget';
export { default as ChartWidget } from './Components/dashboard/ChartWidget';
export { default as CustomerWidget } from './Components/dashboard/CustomerWidget';
export { default as EmployeeWidget } from './Components/dashboard/EmployeeWidget';
export { default as EquipmentWidget } from './Components/dashboard/EquipmentWidget';
export { default as PayrollWidget } from './Components/dashboard/PayrollWidget';
export { default as ProjectWidget } from './Components/dashboard/ProjectWidget';
export { default as RecentProjects } from './Components/dashboard/RecentProjects';
export { default as RentalWidget } from './Components/dashboard/RentalWidget';
export { default as StatsCard } from './Components/dashboard/StatsCard';
export { default as TeamWidget } from './Components/dashboard/TeamWidget';
export { default as VacationWidget } from './Components/dashboard/VacationWidget';

export { Calendar } from './Components/ui';
export { DatePicker } from './Components/ui';
export { Popover, PopoverContent, PopoverTrigger } from './Components/ui';
export { Pagination } from './Components/ui';
export { Alert, AlertDescription, AlertTitle } from './Components/ui';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './Components/ui';
export { AlertDialogTrigger } from './Components/ui';
export { useToast } from './Components/ui';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';

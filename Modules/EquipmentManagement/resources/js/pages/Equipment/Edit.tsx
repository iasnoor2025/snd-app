import { useEquipmentCategories } from '@/Core';
import { Button } from '@/Core/components/ui/button';
import { Calendar } from '@/Core';
import { Card, CardContent } from '@/Core/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Core/components/ui/form';
import { Input } from '@/Core/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/Core/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Core/components/ui/tabs';
import { Textarea } from '@/Core/components/ui/textarea';
import AppLayout from '@/Core/layouts/AppLayout';
import { cn } from '@/Core/lib/utils';
import type { PageProps } from '@/Core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarIcon,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Hash,
    Info,
    Loader2,
    MapPin,
    Package,
    Save,
    Tag,
    Wrench,
    X,
} from 'lucide-react';
import React from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Equipment } from '../../types';

interface Props extends PageProps {
    equipment: Equipment;
    categories: { id: number; name: string }[];
    locations: { id: number; name: string }[];
}

// Create a schema for equipment validation
const equipmentSchema = z.object({
    name: z.string().min(1, { message: 'Equipment name is required' }),
    description: z.string().optional(),
    category_id: z.number().min(1, { message: 'Category is required' }),
    manufacturer: z.string().optional(),
    model: z.string().min(1, { message: 'Model is required' }),
    serial_number: z.string().min(1, { message: 'Serial number is required' }),
    purchase_date: z.date().optional(),
    purchase_price: z.coerce.number().min(0).optional(),
    warranty_expiry_date: z.date().optional(),
    status: z.enum(['available', 'rented', 'maintenance', 'out_of_service']),
    location_id: z.number().min(1, { message: 'Location is required' }),
    assigned_to: z.number().optional(),
    last_maintenance_date: z.date().optional(),
    next_maintenance_date: z.date().optional(),
    notes: z.string().optional(),
    unit: z.string().min(1, { message: 'Unit is required' }),
    default_unit_cost: z.coerce.number().min(0),
    is_active: z.boolean(),
    daily_rate: z.coerce.number().min(0),
    weekly_rate: z.coerce.number().min(0).optional(),
    monthly_rate: z.coerce.number().min(0).optional(),
    door_number: z.string().min(1, { message: 'Door number is required' }),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Equipment', href: '/equipment' },
    { title: `Edit Equipment`, href: window.location.pathname },
];

export default function Edit({ auth, equipment, categories = [], locations = [] }: Props) {
    const { processing, errors: serverErrors } = useForm();
    const { t } = useTranslation('equipment');

    // Use the shared hook for categories
    const { categories: availableCategories, refresh: refreshCategories } = useEquipmentCategories(categories);

    // Deduplicate locations based on name, city, and state
    const uniqueLocations = React.useMemo(() => {
        const seen = new Set();
        return locations.filter((location) => {
            const key = `${location.name}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }, [locations]);

    // Convert string dates to Date objects for the form
    const parseDateOrNull = (dateStr: string | null): Date | null => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    };

    // Define default values for the form based on existing equipment
    const defaultValues: EquipmentFormValues = {
        name: equipment.name,
        model: equipment.model_number,
        manufacturer: equipment.manufacturer || '',
        serial_number: equipment.serial_number,
        door_number: equipment.door_number || '',
        description: equipment.description || '',
        status: equipment.status || 'available',
        daily_rate: equipment.daily_rate || 0,
        weekly_rate: equipment.weekly_rate || 0,
        monthly_rate: equipment.monthly_rate || 0,
        purchase_date: parseDateOrNull(equipment.purchase_date || null) || new Date(),
        purchase_price: equipment.purchase_price || 0,
        warranty_expiry_date: parseDateOrNull(equipment.warranty_expiry_date),
        last_maintenance_date: parseDateOrNull(equipment.last_maintenance_date),
        next_maintenance_date: parseDateOrNull(equipment.next_maintenance_date),
        location_id: equipment.location_id || 0,
        category_id: equipment.category_id || (availableCategories.length > 0 ? availableCategories[0].id : 0),
        notes: equipment.notes || '',
        unit: equipment.unit || '',
        default_unit_cost: equipment.default_unit_cost || 0,
        is_active: equipment.is_active !== undefined ? equipment.is_active : true,
    };

    // Initialize the form with React Hook Form
    const form = useReactHookForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues,
    });

    // Submit handler
    const onSubmit = (values: EquipmentFormValues) => {
        // Convert dates to string format expected by the API
        const formattedValues = {
            ...values,
            purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
            warranty_expiry_date: values.warranty_expiry_date ? format(values.warranty_expiry_date, 'yyyy-MM-dd') : null,
            last_maintenance_date: values.last_maintenance_date ? format(values.last_maintenance_date, 'yyyy-MM-dd') : null,
            next_maintenance_date: values.next_maintenance_date ? format(values.next_maintenance_date, 'yyyy-MM-dd') : null,
        };

        // Use Inertia's router for form submission
        router.put(window.route('equipment.update', { equipment: equipment.id }), formattedValues, {
            onSuccess: () => {
                router.visit(window.route('equipment.show', { equipment: equipment.id }));
            },
            onError: (errors) => {
                // Handle specific error cases
                if (errors.door_number) {
                    // Focus the door number input
                    const doorNumberInput = document.querySelector('input[name="door_number"]');
                    if (doorNumberInput) {
                        (doorNumberInput as HTMLInputElement).focus();
                    }
                } else if (errors.name) {
                    // Focus the name input
                    const nameInput = document.querySelector('input[name="name"]');
                    if (nameInput) {
                        (nameInput as HTMLInputElement).focus();
                    }
                } else if (errors.model) {
                    // Focus the model input
                    const modelInput = document.querySelector('input[name="model"]');
                    if (modelInput) {
                        (modelInput as HTMLInputElement).focus();
                    }
                } else if (errors.serial_number) {
                    // Focus the serial number input
                    const serialNumberInput = document.querySelector('input[name="serial_number"]');
                    if (serialNumberInput) {
                        (serialNumberInput as HTMLInputElement).focus();
                    }
                } else if (errors.status) {
                    // Focus the status input
                    const statusInput = document.querySelector('select[name="status"]');
                    if (statusInput) {
                        (statusInput as HTMLSelectElement).focus();
                    }
                } else if (errors.location_id) {
                    // Focus the location input
                    const locationInput = document.querySelector('select[name="location_id"]');
                    if (locationInput) {
                        (locationInput as HTMLSelectElement).focus();
                    }
                } else if (errors.category_id) {
                    // Focus the category input
                    const categoryInput = document.querySelector('select[name="category_id"]');
                    if (categoryInput) {
                        (categoryInput as HTMLSelectElement).focus();
                    }
                } else {
                    // Focus the first error input
                    const firstErrorInput = document.querySelector('input:invalid, select:invalid');
                    if (firstErrorInput) {
                        (firstErrorInput as HTMLElement).focus();
                    }
                }
            },
            preserveScroll: true,
        });
    };

    // Helper to render a value as a string with translation (handles multilingual objects)
    function renderString(val: any): string {
        if (!val) return '—';
        if (typeof val === 'string') return t(val);
        if (typeof val === 'object') {
            if (val.name) return t(val.name);
            if (val.en) return t(val.en);
            const first = Object.values(val).find((v) => typeof v === 'string');
            if (first) return t(first);
        }
        return '—';
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Equipment: ${equipment.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(window.route('equipment.index'))}
                            className="h-8 w-8 hover:bg-primary/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                                {t('edit_equipment')}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">{t('update_equipment_details')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(window.route('equipment.show', { equipment: equipment.id }))}
                            className="h-9 transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="hover:from-primary-600 h-9 bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/20 transition-all duration-200 hover:to-indigo-700"
                            onClick={() => form.handleSubmit(onSubmit)()}
                        >
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Card className="border-none bg-gradient-to-b from-background to-background/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Form>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <Tabs defaultValue="basic" className="w-full">
                                    <div className="border-b bg-muted/40">
                                        <div className="flex h-16 items-center px-4">
                                            <TabsList className="bg-background/80 backdrop-blur-sm">
                                                <TabsTrigger value="basic" className="flex items-center gap-2">
                                                    <Info className="h-4 w-4" />
                                                    Basic Info
                                                </TabsTrigger>
                                                <TabsTrigger value="pricing" className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    Pricing
                                                </TabsTrigger>
                                                <TabsTrigger value="maintenance" className="flex items-center gap-2">
                                                    <Wrench className="h-4 w-4" />
                                                    Maintenance
                                                </TabsTrigger>
                                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Documents
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>
                                    </div>

                                    <TabsContent value="basic" className="p-6">
                                        <div className="grid gap-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-primary" />
                                                                Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-background/50" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="model"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Tag className="h-4 w-4 text-primary" />
                                                                Model
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-background/50" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="manufacturer"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-primary" />
                                                                Manufacturer
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-background/50" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="serial_number"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Hash className="h-4 w-4 text-primary" />
                                                                Serial Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-background/50" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="door_number"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-primary" />
                                                                Door Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-background/50" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="category_id"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Tag className="h-4 w-4 text-primary" />
                                                                Category
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/50">
                                                                        <SelectValue placeholder="Select a category" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {availableCategories.map((category) => (
                                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                                            {renderString(category.name)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="location_id"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                                Location
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/50">
                                                                        <SelectValue placeholder="Select a location" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {uniqueLocations.map((location) => (
                                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                                            {renderString(location.name)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="status"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                                Status
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/50">
                                                                        <SelectValue>
                                                                            {field.value === 'available' && 'Available'}
                                                                            {field.value === 'rented' && 'Rented'}
                                                                            {field.value === 'maintenance' && 'Maintenance'}
                                                                            {field.value === 'out_of_service' && 'Out of Service'}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="available">Available</SelectItem>
                                                                    <SelectItem value="rented">Rented</SelectItem>
                                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                                    <SelectItem value="out_of_service">Out of Service</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }: { field: any }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            Description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className="min-h-[100px] bg-background/50"
                                                                {...field}
                                                                value={field.value || ''}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="pricing" className="p-6">
                                        <div className="grid gap-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="purchase_price"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-primary" />
                                                                Purchase Price
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="bg-background/50"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="daily_rate"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-primary" />
                                                                Daily Rate
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="bg-background/50"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value);
                                                                        field.onChange(value);
                                                                        form.setValue('weekly_rate', parseFloat((value * 6).toFixed(2)));
                                                                        form.setValue('monthly_rate', parseFloat((value * 26).toFixed(2)));
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="weekly_rate"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-primary" />
                                                                Weekly Rate
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="bg-background/50"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value);
                                                                        field.onChange(value);
                                                                        const dailyRate = parseFloat((value / 6).toFixed(2));
                                                                        form.setValue('daily_rate', dailyRate);
                                                                        form.setValue('monthly_rate', parseFloat((dailyRate * 26).toFixed(2)));
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="monthly_rate"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-primary" />
                                                                Monthly Rate
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    className="bg-background/50"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value);
                                                                        field.onChange(value);
                                                                        const dailyRate = parseFloat((value / 26).toFixed(2));
                                                                        form.setValue('daily_rate', dailyRate);
                                                                        form.setValue('weekly_rate', parseFloat((dailyRate * 6).toFixed(2)));
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="maintenance" className="p-6">
                                        <div className="grid gap-6">
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <FormField
                                                    control={form.control}
                                                    name="purchase_date"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                                Purchase Date
                                                            </FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'w-full bg-background/50 pl-3 text-left font-normal',
                                                                                !field.value && 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="warranty_expiry_date"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                                Warranty Expiry Date
                                                            </FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'w-full bg-background/50 pl-3 text-left font-normal',
                                                                                !field.value && 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value || undefined}
                                                                        onSelect={field.onChange}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="last_maintenance_date"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Wrench className="h-4 w-4 text-primary" />
                                                                Last Maintenance
                                                            </FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'w-full bg-background/50 pl-3 text-left font-normal',
                                                                                !field.value && 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value || undefined}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="next_maintenance_date"
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-primary" />
                                                                Next Maintenance
                                                            </FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'w-full bg-background/50 pl-3 text-left font-normal',
                                                                                !field.value && 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value || undefined}
                                                                        onSelect={field.onChange}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }: { field: any }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            Maintenance Notes
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className="min-h-[100px] bg-background/50"
                                                                {...field}
                                                                value={field.value || ''}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="documents" className="p-6">
                                        <div className="grid gap-6">
                                            {/* Remove or comment out any remaining references to DocumentManager and Equipment type. This will resolve the last linter errors. */}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

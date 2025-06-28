import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { PageProps } from '@/Core/types';
import AppLayout from '@/Core/layouts/AppLayout';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import ErrorBoundary from '@/Core/components/ErrorBoundary';
import { Button } from '@/Core/components/ui/button';
import { Card } from '@/Core/components/ui/card';
import { CardContent } from '@/Core/components/ui/card';
import { CardHeader } from '@/Core/components/ui/card';
import { CardTitle } from '@/Core/components/ui/card';
import { CardDescription } from '@/Core/components/ui/card';
import { Input } from '@/Core/components/ui/input';
import { Textarea } from '@/Core/components/ui/textarea';
import { ScrollArea } from '@/Core/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/Core/components/ui/alert';
import { Skeleton } from '@/Core/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Core/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Core/components/ui/dialog";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { Calendar } from '@/Core/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core/components/ui/popover";
import { cn } from "@/Core/lib/utils";
import { CalendarIcon, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Switch } from '@/Core/components/ui/switch';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useEquipmentCategories } from "@/Core";
import { useTranslation } from 'react-i18next';
import { EquipmentFormData } from '../../types';

interface Props extends PageProps {
  categories: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  employees?: { id: number; name: string }[];
}

// Create a schema for equipment validation
const equipmentSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  category_id: z.number().min(1, { message: 'Category is required' }),
  manufacturer: z.string().optional(),
  model: z.string().min(1, { message: 'Model is required' }),
  serial_number: z.string().min(1, { message: 'Serial number is required' }),
  purchase_date: z.date().optional(),
  purchase_price: z.coerce.number().min(0).optional(),
  warranty_expiry_date: z.date().optional(),
  status: z.string().min(1, { message: 'Status is required' }),
  location_id: z.number().min(1, { message: 'Location is required' }),
  assigned_to: z.number().optional(),
  last_maintenance_date: z.date().optional(),
  next_maintenance_date: z.date().optional(),
  notes: z.string().optional(),
  unit: z.string().optional(),
  default_unit_cost: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
  daily_rate: z.coerce.number().min(0).optional(),
  weekly_rate: z.coerce.number().min(0).optional(),
  monthly_rate: z.coerce.number().min(0).optional(),
  door_number: z.string().min(1, { message: 'Door number is required' }),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Equipment', href: '/equipment' },
  { title: 'Create Equipment', href: window.location.pathname },
];

// The Create Equipment Form component (keeping all existing fields)
// Keep the component body as it was, just adding this here for organization
interface CreateEquipmentFormProps {
  form: any;
  serverErrors: Partial<Record<string, string>>;
  isSubmitting: boolean;
  onSubmit: (values: EquipmentFormValues) => void;
  availableCategories: { id: number; name: string }[];
  setIsCreatingCategory: (value: boolean) => void;
  locations: { id: number; name: string }[];
  setIsCreatingLocation: (value: boolean) => void;
  employees?: { id: number; name: string }[];
}

const CreateEquipmentForm = ({ form, serverErrors, isSubmitting, onSubmit, availableCategories, setIsCreatingCategory, locations, setIsCreatingLocation, employees }: CreateEquipmentFormProps) => {
  // Remove the <Form> wrapper to avoid nested forms
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {Object.keys(serverErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Please correct the errors below and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keep all existing form fields unchanged */}
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Model Field */}
        <FormField
          control={form.control}
          name="model"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Manufacturer Field */}
        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Manufacturer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Serial Number Field */}
        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Door Number Field */}
        <FormField
          control={form.control}
          name="door_number"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Door Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCreatingCategory(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
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

        {/* Location Field */}
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {renderString(location.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCreatingLocation(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Daily Rate Field */}
        <FormField
          control={form.control}
          name="daily_rate"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Daily Rate (SAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(value);
                    // Auto-calculate weekly and monthly rates
                    form.setValue('weekly_rate', parseFloat((value * 6).toFixed(2)));
                    form.setValue('monthly_rate', parseFloat((value * 26).toFixed(2)));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weekly Rate Field */}
        <FormField
          control={form.control}
          name="weekly_rate"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Weekly Rate (SAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(value);
                    // Auto-calculate daily and monthly rates
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

        {/* Monthly Rate Field */}
        <FormField
          control={form.control}
          name="monthly_rate"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Monthly Rate (SAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(value);
                    // Auto-calculate daily and weekly rates
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

        {/* Purchase Price Field */}
        <FormField
          control={form.control}
          name="purchase_price"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Purchase Price (SAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Purchase Date Field */}
        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Warranty Expiry Date Field */}
        <FormField
          control={form.control}
          name="warranty_expiry_date"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Warranty Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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

        {/* Last Maintenance Date Field */}
        <FormField
          control={form.control}
          name="last_maintenance_date"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Last Maintenance Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Next Maintenance Date Field */}
        <FormField
          control={form.control}
          name="next_maintenance_date"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Maintenance Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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

      {/* Description Field (Full Width) */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }: { field: any }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                className="min-h-[100px]"
              />
            </FormControl>
            <div className="text-muted-foreground text-sm">
              Some description here
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Unit and Default Unit Cost Fields */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="e.g., hours, days, pieces"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_unit_cost"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Default Unit Cost (SAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assigned To Field */}
        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Unassigned</SelectItem>
                  {(employees || []).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active Field */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Equipment</FormLabel>
                <FormDescription>
                  Equipment is available for rental and operations
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Notes Field (Full Width) */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => window.location.href = window.route('equipment.index')}
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Equipment
        </Button>
      </div>
    </form>
  );
};

export default function Create({ auth, categories = [], locations = [], employees = [] }: Props) {
  const { processing, errors: serverErrors } = useForm();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [availableLocations, setAvailableLocations] = useState(locations);
  const { t } = useTranslation('equipment');

  // Use the shared hook for categories
  const { categories: availableCategories, refresh: refreshCategories } = useEquipmentCategories(categories);

  // Set default values for the form
  const defaultValues: EquipmentFormValues = {
    name: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    door_number: '',
    description: '',
    status: 'available',
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    purchase_date: new Date(),
    purchase_price: 0,
    warranty_expiry_date: null,
    last_maintenance_date: null,
    next_maintenance_date: null,
    location_id: availableLocations.length > 0 ? availableLocations[0].id : 0,
    category_id: availableCategories.length > 0 ? availableCategories[0].id : 0,
    assigned_to: undefined,
    unit: '',
    default_unit_cost: 0,
    is_active: true,
    notes: '',
  };

  // Initialize the form with React Hook Form
  const form = useReactHookForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues,
  });

  // Submit handler
  const onSubmit = async (values: EquipmentFormValues) => {
    // Convert dates to string format for API
    const formattedValues = {
      ...values,
      purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
      warranty_expiry_date: values.warranty_expiry_date ? format(values.warranty_expiry_date, 'yyyy-MM-dd') : null,
      last_maintenance_date: values.last_maintenance_date ? format(values.last_maintenance_date, 'yyyy-MM-dd') : null,
      next_maintenance_date: values.next_maintenance_date ? format(values.next_maintenance_date, 'yyyy-MM-dd') : null,
    };

    router.post(window.route('equipment.store'), formattedValues, {
      onSuccess: () => {
        toast.success("Equipment created successfully");
        window.location.href = window.route('equipment.index');
      },
      onError: (errors: Record<string, string>) => {
        toast.error("Failed to create equipment. Please check the form for errors.");
        console.error(errors);
      }
    });
  };

  // Handle creating a new category
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    // Check if category already exists
    if (availableCategories.some(c => c.name === newCategory)) {
      toast.error("This category already exists");
      return;
    }

    try {
      // Create the category using Inertia.js
      const response = await axios.post('/categories', { name: newCategory });

      // After creation, refresh categories from backend
      await refreshCategories();

      // Set the new category as selected
      const newCategoryObj = response.data && response.data.category ? response.data.category : null;
      if (newCategoryObj) {
        form.setValue('category_id', newCategoryObj.id);
      }
      setNewCategory("");
      setIsCreatingCategory(false);

      toast.success("Category added successfully");
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  // Handle creating a new location
  const handleCreateLocation = async () => {
    if (!newLocation.trim()) {
      toast.error("Location name cannot be empty");
      return;
    }

    // Check if location already exists
    if (availableLocations.some(l => l.name === newLocation)) {
      toast.error("This location already exists");
      return;
    }

    try {
      // Create the location using Inertia.js
      const response = await axios.post('/locations', {
        name: newLocation,
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Saudi Arabia',
        is_active: true
      });

      // Handle successful creation
      const newLocationObj = {
        id: response.data.id,
        name: response.data.name || newLocation
      };

      setAvailableLocations([...availableLocations, newLocationObj]);
      form.setValue('location_id', newLocationObj.id);
      setNewLocation("");
      setIsCreatingLocation(false);

      toast.success("Location added successfully");
    } catch (error: any) {
      console.error('Error creating location:', error);
      toast.error(error.response?.data?.message || "Failed to create location");
    }
  };

  // Helper to render a value as a string with translation (handles multilingual objects)
  function renderString(val: any): string {
    if (!val) return '—';
    if (typeof val === 'string') return t(val);
    if (typeof val === 'object') {
      if (val.name) return t(val.name);
      if (val.en) return t(val.en);
      const first = Object.values(val).find(v => typeof v === 'string');
      if (first) return t(first);
    }
    return '—';
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Equipment" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Equipment</CardTitle>
            <CardDescription>
              Add new equipment to your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea style={{ height: '100%' }}>
              <ErrorBoundary>
                <CreateEquipmentForm
                  form={form}
                  serverErrors={serverErrors}
                  isSubmitting={processing}
                  onSubmit={onSubmit}
                  availableCategories={availableCategories}
                  setIsCreatingCategory={setIsCreatingCategory}
                  locations={availableLocations}
                  setIsCreatingLocation={setIsCreatingLocation}
                  employees={employees}
                />
              </ErrorBoundary>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Category Creation Dialog */}
      <Dialog open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new equipment category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="newCategory" className="text-sm font-medium">Category Name</label>
              <Input
                id="newCategory"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingCategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Creation Dialog */}
      <Dialog open={isCreatingLocation} onOpenChange={setIsCreatingLocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new equipment location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="newLocation" className="text-sm font-medium">Location Name</label>
              <Input
                id="newLocation"
                placeholder="Enter location name"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingLocation(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLocation}>
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}



















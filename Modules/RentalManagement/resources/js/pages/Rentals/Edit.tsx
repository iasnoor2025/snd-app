import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Head } from "@inertiajs/react";
import { Inertia } from '@inertiajs/inertia';
import { PageProps } from '@/Core/types';
import { AppLayout } from '@/Core';
import { format } from "date-fns";
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";

// Icons
import { ArrowLeft, Plus, Edit as EditIcon, Trash2 } from "lucide-react";

// Our components
import { RentalForm } from '../../Components/rentals/RentalForm';
import FileUpload from '@/Core/components/ui/FileUpload';
import RentalItemsTable from '../../Components/rentals/RentalItemsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Core';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/Core';

interface Props extends PageProps {
  customers: any[];
  equipment: any[];
  rental: any;
  employees?: any[];
  rentalItems?: any[];
  invoices?: any[];
  timesheets?: any[];
  payments?: any[];
  maintenanceRecords?: any[];
  location?: any;
  translations?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  dropdowns?: any;
}

export default function Edit({ customers, equipment, rental, employees = [], rentalItems = [], invoices = [], timesheets = [], payments = [], maintenanceRecords = [], location, translations = {}, created_at, updated_at, deleted_at, dropdowns = {} }: Props) {
  const { t } = useTranslation('rental');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>(rental.rentalItems || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  // Prepare initial data for RentalForm
  const initialData = {
    ...rental,
    customer_id: ((rental.customer_id !== undefined && rental.customer_id !== null)
      ? rental.customer_id
      : (rental.customer ? rental.customer.id : '')).toString(),
    start_date: rental.start_date ? rental.start_date.toString() : '',
    expected_end_date: rental.expected_end_date ? rental.expected_end_date.toString() : '',
    customer: rental.customer || {},
    rentalItems: rental.rentalItems || [],
    equipment: rental.equipment || [],
    invoices: rental.invoices || [],
    timesheets: rental.timesheets || [],
    payments: rental.payments || [],
    maintenanceRecords: rental.maintenanceRecords || [],
    location: rental.location || {},
    translations: translations || {},
    created_at,
    updated_at,
    deleted_at,
  };

  // Add item handler
  const handleAddItem = (item: any) => {
    setItems([...items, { ...item, id: Date.now() }]);
    setDialogOpen(false);
    setEditingItem(null);
  };
  // Edit item handler
  const handleEditItem = (item: any) => {
    setItems(items.map((it: any) => (it.id === item.id ? item : it)));
    setEditDialogOpen(false);
    setEditingItem(null);
  };
  // Remove item handler
  const handleRemoveItem = () => {
    if (removeIndex !== null) {
      setItems(items.filter((_: any, idx: number) => idx !== removeIndex));
      setRemoveIndex(null);
    }
  };

  // RentalFormValues type workaround
  type RentalFormValues = any;
  const handleSubmit = async (values: RentalFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    formData.append('rental_items', JSON.stringify(items));
    if (uploadedFile) {
      formData.append('document', uploadedFile);
    }
    Inertia.post(route("rentals.update", rental.id), formData, {
      forceFormData: true,
      onSuccess: () => {
        toast.success("Rental updated successfully");
        setIsSubmitting(false);
      },
      onError: (errors: any) => {
        console.error("Validation errors:", errors);
        toast.error("Failed to update rental");
        setIsSubmitting(false);
      },
    });
  };

  // Local dialog form for add/edit rental item
  function RentalItemDialogForm({
    item,
    equipment,
    operators,
    onSuccess,
    onCancel,
    isEdit = false,
  }: {
    item?: any;
    equipment: any[];
    operators: any[];
    onSuccess: (item: any) => void;
    onCancel: () => void;
    isEdit?: boolean;
  }) {
    const { t } = useTranslation('rental');
    const [form, setForm] = useState<any>({
      equipment_id: item?.equipment_id || '',
      operator_id: item?.operator_id || '',
      rate: item?.rate || '',
      rate_type: item?.rate_type || 'daily',
      days: item?.days || '',
      discount_percentage: item?.discount_percentage || '0',
      notes: item?.notes || '',
      start_date: item?.start_date || '',
      end_date: item?.end_date || '',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const validate = () => {
      const errs: any = {};
      if (!form.equipment_id) errs.equipment_id = 'Required';
      if (!form.rate) errs.rate = 'Required';
      if (!form.days) errs.days = 'Required';
      if (!form.start_date) errs.start_date = 'Required';
      if (!form.end_date) errs.end_date = 'Required';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setProcessing(true);
      onSuccess({ ...item, ...form });
      setProcessing(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipment_id">Equipment</Label>
          <Select
            value={form.equipment_id}
            onValueChange={value => setForm((f: any) => ({ ...f, equipment_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('ph_select_equipment')} />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((item: any) => (
                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.equipment_id && <p className="text-sm text-red-500">{errors.equipment_id}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator_id">Operator</Label>
          <Select
            value={form.operator_id}
            onValueChange={value => setForm((f: any) => ({ ...f, operator_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('ph_select_operator')} />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op: any) => (
                <SelectItem key={op.id} value={op.id.toString()}>{op.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Rate</Label>
            <Input id="rate" type="number" step="0.01" value={form.rate} onChange={e => setForm((f: any) => ({ ...f, rate: e.target.value }))} />
            {errors.rate && <p className="text-sm text-red-500">{errors.rate}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_type">{t('lbl_rate_type')}</Label>
            <Select value={form.rate_type} onValueChange={value => setForm((f: any) => ({ ...f, rate_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('ph_select_rate_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="days">Days</Label>
            <Input id="days" type="number" value={form.days} onChange={e => setForm((f: any) => ({ ...f, days: e.target.value }))} />
            {errors.days && <p className="text-sm text-red-500">{errors.days}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_percentage">Discount (%)</Label>
            <Input id="discount_percentage" type="number" step="0.01" value={form.discount_percentage} onChange={e => setForm((f: any) => ({ ...f, discount_percentage: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" value={form.start_date} onChange={e => setForm((f: any) => ({ ...f, start_date: e.target.value }))} />
            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" value={form.end_date} onChange={e => setForm((f: any) => ({ ...f, end_date: e.target.value }))} />
            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={processing}>{isEdit ? t('update') : t('btn_add_item')}</Button>
        </div>
      </form>
    );
  }

  return (
    <AppLayout>
      <Head title={t('ttl_edit_rental')} />

      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rentals
              </Button>
              <CardTitle className="text-2xl font-bold">Edit Rental #{rental.rental_number}</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <RentalForm
              customers={dropdowns.customers || customers}
              equipment={dropdowns.equipment || equipment}
              employees={dropdowns.employees || employees}
              initialData={initialData}
              isEditMode={true}
              onSubmit={handleSubmit}
              onCancel={() => {}}
            />
            {/* Rental Items Management Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{t('rental_items')}</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />{t('btn_add_item')}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{t('ttl_add_rental_item')}</DialogTitle></DialogHeader>
                    <RentalItemDialogForm
                      equipment={dropdowns.equipment || equipment}
                      operators={dropdowns.employees || employees}
                      onSuccess={(item: any) => {
                        handleAddItem(item);
                        setDialogOpen(false);
                      }}
                      onCancel={() => setDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <RentalItemsTable
                rentalItems={items}
                items={items}
                readOnly={false}
              />
              {/* Edit Dialog */}
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{t('ttl_edit_rental_item')}</DialogTitle></DialogHeader>
                  {editingItem && (
                    <RentalItemDialogForm
                      item={editingItem}
                      equipment={dropdowns.equipment || equipment}
                      operators={dropdowns.employees || employees}
                      isEdit={true}
                      onSuccess={(item: any) => {
                        handleEditItem(item);
                        setEditDialogOpen(false);
                      }}
                      onCancel={() => setEditDialogOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
              {/* Remove Confirmation */}
              <Dialog open={removeIndex !== null} onOpenChange={open => !open && setRemoveIndex(null)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Remove Item</DialogTitle></DialogHeader>
                  <p>Are you sure you want to remove this item?</p>
                  <Button variant="destructive" onClick={handleRemoveItem}>Remove</Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4">
              <label className="block font-medium mb-1">Upload Rental Document/Media</label>
              <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


















import React, { useState } from 'react';
import { Head } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Customer {
  id: number;
  company_name: string;
}

interface Rental {
  id: number;
  rental_number: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  rental_id: number | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  notes: string;
  items: InvoiceItem[];
}

interface Document {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
}

interface EditProps {
  invoice: Invoice;
  customers: Customer[];
  rentals: Rental[];
  documents: Document[];
}

export default function Edit({ invoice, customers, rentals, documents }: EditProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form schema
  const formSchema = z.object({
    customer_id: z.string().min(1, t('customer_required')),
    rental_id: z.string().optional(),
    invoice_number: z.string().min(1, t('invoice_number_required')),
    issue_date: z.string().min(1, t('issue_date_required')),
    due_date: z.string().min(1, t('due_date_required')),
    status: z.string().min(1, t('status_required')),
    notes: z.string().optional(),
    subtotal: z.number().min(0),
    discount_amount: z.number().min(0),
    tax_amount: z.number().min(0),
    total_amount: z.number().min(0),
    items: z.array(
      z.object({
        id: z.number().optional(),
        description: z.string().min(1, t('description_required')),
        quantity: z.number().min(1, t('quantity_required')),
        unit_price: z.number().min(0, t('unit_price_required')),
        amount: z.number().min(0, t('amount_required')),
      })
    ).min(1, t('at_least_one_item_required')),
  });

  // Initialize form with invoice data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: String(invoice.customer_id),
      rental_id: invoice.rental_id ? String(invoice.rental_id) : undefined,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      notes: invoice.notes || '',
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      items: invoice.items,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      Inertia.put(`/invoices/${invoice.id}`, values);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Head title={`${t('edit_invoice')} ${invoice.invoice_number}`} />

      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('edit_invoice')} #{invoice.invoice_number}</h1>
          <Button
            variant="outline"
            onClick={() => Inertia.visit(`/invoices/${invoice.id}`)}
          >
            {t('cancel')}
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('invoice_details')}</CardTitle>
                <CardDescription>{t('edit_invoice_information')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="invoice_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoice_number')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('customer')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_customer')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={String(customer.id)}>
                                {customer.company_name}
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
                    name="rental_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('rental')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_rental')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">
                              {t('none')}
                            </SelectItem>
                            {rentals.map((rental) => (
                              <SelectItem key={rental.id} value={String(rental.id)}>
                                {rental.rental_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('issue_date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('due_date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_status')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">{t('draft')}</SelectItem>
                            <SelectItem value="sent">{t('sent')}</SelectItem>
                            <SelectItem value="paid">{t('paid')}</SelectItem>
                            <SelectItem value="partially_paid">{t('partially_paid')}</SelectItem>
                            <SelectItem value="overdue">{t('overdue')}</SelectItem>
                            <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('notes')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t('invoice_items')}</CardTitle>
                <CardDescription>{t('edit_invoice_items')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be a dynamic form for invoice items */}
                  <p className="text-sm text-gray-500">{t('item_editing_not_implemented')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

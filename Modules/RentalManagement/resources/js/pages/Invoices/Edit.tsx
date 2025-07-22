import { FormField, FormItem, FormLabel, FormMessage } from '@/../../Modules/Core/resources/js/components/ui/form';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/../../Modules/Core/resources/js/components/ui/select';
import { Textarea } from '@/../../Modules/Core/resources/js/components/ui/textarea';

import AppLayout from '@/Core/layouts/AppLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Inertia } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Button } from '@/Core/components/ui';

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
        items: z
            .array(
                z.object({
                    id: z.number().optional(),
                    description: z.string().min(1, t('description_required')),
                    quantity: z.number().min(1, t('quantity_required')),
                    unit_price: z.number().min(0, t('unit_price_required')),
                    amount: z.number().min(0, t('amount_required')),
                }),
            )
            .min(1, t('at_least_one_item_required')),
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
        <AppLayout>
            <Head title={`Edit Invoice #${invoice.invoice_number}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-4 text-2xl font-bold">{t('edit_invoice')}</h1>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="customer_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('customer')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('select_customer')} />
                                                        </SelectTrigger>
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
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="rental_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('rental')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('select_rental')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
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
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="invoice_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('invoice_number')}</FormLabel>
                                                    <Input {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="issue_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('issue_date')}</FormLabel>
                                                    <Input type="date" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="due_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('due_date')}</FormLabel>
                                                    <Input type="date" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('status')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('select_status')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Draft">Draft</SelectItem>
                                                            <SelectItem value="Sent">Sent</SelectItem>
                                                            <SelectItem value="Paid">Paid</SelectItem>
                                                            <SelectItem value="Overdue">Overdue</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('notes')}</FormLabel>
                                                <Textarea {...field} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="subtotal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('subtotal')}</FormLabel>
                                                    <Input type="number" step="0.01" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="discount_amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('discount_amount')}</FormLabel>
                                                    <Input type="number" step="0.01" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="tax_amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tax_amount')}</FormLabel>
                                                    <Input type="number" step="0.01" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="total_amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('total_amount')}</FormLabel>
                                                    <Input type="number" step="0.01" {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="mb-4 text-lg font-bold">{t('items')}</h2>
                                    {form.formState.errors.items && <p className="text-sm text-red-500">{form.formState.errors.items.message}</p>}
                                    {form.watch('items').map((item, index) => (
                                        <div key={index} className="mb-4 grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                                            <div>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('description')}</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('quantity')}</FormLabel>
                                                            <Input type="number" {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unit_price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('unit_price')}</FormLabel>
                                                            <Input type="number" step="0.01" {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.amount`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('amount')}</FormLabel>
                                                            <Input type="number" step="0.01" {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? t('saving') : t('save_changes')}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

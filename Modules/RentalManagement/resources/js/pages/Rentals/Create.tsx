import {
    AppLayout,
    Badge,
    Button,
    Calendar,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Textarea,
    ToggleGroup,
    ToggleGroupItem,
} from '@/Core';
import { Customer, Equipment, PageProps, User } from '@/Core/types';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { format, isAfter, isBefore, startOfToday } from 'date-fns';
import { ChevronLeftIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Icons
import { CalendarIcon } from 'lucide-react';

// Our components
import FileUpload from '@/Core/Components/ui/FileUpload';
import { route } from 'ziggy-js';
import TimesheetForm from '../../Components/rentals/timesheets/TimesheetForm';

interface Customer {
    id: number;
    name: string;
}

interface Equipment {
    id: number;
    name: string;
    unit_price: number;
    rental_rate_period: string;
}

interface CreateProps extends PageProps {
    auth: {
        user: User;
    };
    errors: Record<string, string>;
    customers: Customer[];
    equipment: Equipment[];
    nextRentalNumber: string;
    employees?: { id: number; name: string }[];
}

interface RentalItem {
    equipment_id: string;
    quantity: number;
    unit_price: number;
    rental_rate_period: string;
    operator_id?: string;
}

const defaultRentalPeriod = 'daily';
const defaultCurrency = 'USD';

export default function Create({ auth, errors, customers = [], equipment = [], nextRentalNumber, employees = [] }: CreateProps) {
    const { t } = useTranslation('RentalManagement');
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        customer_id: '',
        rental_number: nextRentalNumber,
        start_date: '',
        expected_end_date: '',
        deposit_amount: 0,
        billing_cycle: 'daily',
        payment_terms_days: 30,
        has_timesheet: false,
        has_operators: false,
        status: 'pending',
        tax_percentage: 0,
        discount_percentage: 0,
        notes: '',
        created_by: auth.user.id,
        rental_items: [] as RentalItem[],
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        rental_rate: 0,
        discount_amount: 0,
        selected_equipment_id: '',
        selected_operator_id: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const addRentalItem = () => {
        setData('rental_items', [
            ...data.rental_items,
            {
                equipment_id: '',
                quantity: 1,
                unit_price: 0,
                rental_rate_period: defaultRentalPeriod,
                operator_id: '',
            },
        ]);
    };

    const updateRentalItem = (index: number, field: keyof RentalItem, value: any) => {
        const updatedItems = data.rental_items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setData('rental_items', updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format dates to YYYY-MM-DD
            const startDate = data.start_date ? format(new Date(data.start_date), 'yyyy-MM-dd') : '';
            const expectedEndDate = data.expected_end_date ? format(new Date(data.expected_end_date), 'yyyy-MM-dd') : '';

            // Validate dates
            if (!startDate || !expectedEndDate) {
                toast.error('Please select both start and end dates');
                setIsSubmitting(false);
                return;
            }

            const today = startOfToday();
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(expectedEndDate);

            if (isBefore(startDateObj, today)) {
                toast.error('Start date must be today or later');
                setIsSubmitting(false);
                return;
            }

            if (!isAfter(endDateObj, startDateObj)) {
                toast.error('End date must be after start date');
                setIsSubmitting(false);
                return;
            }

            // Validate customer selection
            if (!data.customer_id) {
                toast.error('Please select a customer');
                setIsSubmitting(false);
                return;
            }

            // Validate equipment selection
            if (!data.selected_equipment_id) {
                toast.error('Please select equipment');
                setIsSubmitting(false);
                return;
            }

            // Calculate days between start and end date
            const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));

            // Create rental item from selected equipment
            const selectedEquipment = equipment.find((eq) => eq.id.toString() === data.selected_equipment_id);
            if (!selectedEquipment) {
                toast.error('Selected equipment not found');
                setIsSubmitting(false);
                return;
            }

            const rentalItems = [
                {
                    equipment_id: parseInt(data.selected_equipment_id),
                    rate: data.rental_rate || selectedEquipment.unit_price,
                    rate_type: data.billing_cycle || 'daily',
                    operator_id: data.selected_operator_id ? parseInt(data.selected_operator_id) : null,
                    notes: data.notes || '',
                    days: days,
                    discount_percentage: 0,
                    total_amount: (data.rental_rate || selectedEquipment.unit_price) * days,
                },
            ];

            // Calculate totals
            const subtotal = rentalItems.reduce((total, item) => total + item.total_amount, 0);
            const taxPercentage = 15;
            const taxAmount = (subtotal * taxPercentage) / 100;
            const totalAmount = subtotal + taxAmount;

            // Prepare data for submission
            const submitData = {
                customer_id: parseInt(data.customer_id),
                rental_number: data.rental_number,
                start_date: startDate,
                expected_end_date: expectedEndDate,
                deposit_amount: data.deposit_amount || 0,
                billing_cycle: data.billing_cycle,
                payment_terms_days: 30,
                has_timesheet: false,
                has_operators: !!data.selected_operator_id,
                status: 'pending',
                tax_percentage: taxPercentage,
                discount_percentage: 0,
                notes: data.notes || '',
                created_by: auth.user.id,
                rental_items: rentalItems,
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalAmount,
            };

            // If file is uploaded, append to FormData
            const formData = new FormData();
            Object.entries(submitData).forEach(([key, value]) => {
                formData.append(key, value as any);
            });
            if (uploadedFile) {
                formData.append('document', uploadedFile);
            }

            // Use Inertia post with FormData
            post(route('rentals.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Rental created successfully');
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error submitting rental:', error);
            toast.error('An unexpected error occurred');
        }
    };

    // Helper to fetch dynamic price for selected equipment
    const fetchDynamicPrice = async (equipmentId: string, days: number, quantity: number) => {
        setIsPriceLoading(true);
        try {
            const response = await fetch(`/api/equipment/${equipmentId}/calculate-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rental_date: data.start_date || new Date().toISOString().slice(0, 10),
                    duration: days,
                    quantity: quantity,
                }),
            });
            if (!response.ok) throw new Error('Failed to fetch dynamic price');
            const result = await response.json();
            return result.data?.final_price || null;
        } catch (err) {
            toast.error('Failed to calculate dynamic price');
            return null;
        } finally {
            setIsPriceLoading(false);
        }
    };

    // Update price when equipment, days, or quantity changes
    useEffect(() => {
        const updatePrice = async () => {
            if (!data.selected_equipment_id || !data.start_date || !data.expected_end_date) return;
            const selectedEquipment = equipment.find((eq) => eq.id.toString() === data.selected_equipment_id);
            if (!selectedEquipment) return;
            const startDateObj = new Date(data.start_date);
            const endDateObj = new Date(data.expected_end_date);
            const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
            if (days <= 0) return;
            const quantity = 1; // You can extend this if quantity is user-editable
            const dynamicPrice = await fetchDynamicPrice(data.selected_equipment_id, days, quantity);
            if (dynamicPrice !== null) {
                setData('rental_rate', dynamicPrice);
            } else {
                setData('rental_rate', selectedEquipment.unit_price);
            }
        };
        updatePrice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.selected_equipment_id, data.start_date, data.expected_end_date]);

    console.log('Ziggy routes in Create.tsx:', Ziggy.routes);

    return (
        <AppLayout title={String(t('ttl_create_rental')) || 'Create Rental'}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <form className="mx-auto grid w-full flex-1 auto-rows-max gap-4" onSubmit={handleSubmit}>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" className="h-7 w-7">
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    <span className="sr-only">{String(t('back')) || 'Back'}</span>
                                </Button>
                                <h1 className="flex-1 shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap sm:grow-0">
                                    {String(t('new_rental')) || 'New Rental'}
                                </h1>
                                <Badge variant="outline" className="ml-auto sm:ml-0">
                                    {String(t('draft')) || 'Draft'}
                                </Badge>
                                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                                    <Button variant="outline" size="sm" type="button">
                                        {String(t('discard')) || 'Discard'}
                                    </Button>
                                    <Button size="sm" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : String(t('save_rental')) || 'Save Rental'}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-8">
                                <div className="grid auto-rows-max items-start gap-4 lg:col-span-5 lg:gap-8">
                                    <Card x-chunk="dashboard-07-chunk-0">
                                        <CardHeader>
                                            <CardTitle>{String(t('rental_details')) || 'Rental Details'}</CardTitle>
                                            <CardDescription>
                                                {String(t('rental_details_desc')) || 'Fill in the details for the new rental agreement'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="title">{String(t('rental_title')) || 'Rental Title'}</Label>
                                                    <Input
                                                        id="title"
                                                        type="text"
                                                        className="w-full"
                                                        defaultValue={String(t('default_rental_title')) || 'Weekly Equipment Rental - Backhoe'}
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="customer">{String(t('customer')) || 'Customer'}</Label>
                                                    <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                                        <SelectTrigger id="customer">
                                                            <SelectValue placeholder={String(t('select_customer')) || 'Select a customer'} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {customers.map((customer) => (
                                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                    {String(customer.name)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="description">{String(t('description')) || 'Description'}</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.notes}
                                                        onChange={(e) => setData('notes', e.target.value)}
                                                        placeholder={
                                                            String(t('rental_description_placeholder')) ||
                                                            'Rental of heavy machinery for construction project.'
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="rental-number">{String(t('rental_number')) || 'Rental Number'}</Label>
                                                    <Input id="rental-number" type="text" value={data.rental_number} readOnly className="bg-muted" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="start-date">{String(t('start_date')) || 'Start Date'}</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={'outline'}
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal',
                                                                        !data.start_date && 'text-muted-foreground',
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {data.start_date ? (
                                                                        format(new Date(data.start_date), 'PPP')
                                                                    ) : (
                                                                        <span>{String(t('pick_a_date')) || 'Pick a date'}</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                                                    onSelect={(date) => setData('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="end-date">{String(t('expected_end_date')) || 'Expected End Date'}</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={'outline'}
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal',
                                                                        !data.expected_end_date && 'text-muted-foreground',
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {data.expected_end_date ? (
                                                                        format(new Date(data.expected_end_date), 'PPP')
                                                                    ) : (
                                                                        <span>{String(t('pick_a_date')) || 'Pick a date'}</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={data.expected_end_date ? new Date(data.expected_end_date) : undefined}
                                                                    onSelect={(date) =>
                                                                        setData('expected_end_date', date ? format(date, 'yyyy-MM-dd') : '')
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="rental-period">{String(t('rental_period')) || 'Rental Period'}</Label>
                                                    <ToggleGroup
                                                        type="single"
                                                        value={data.billing_cycle}
                                                        onValueChange={(value) => value && setData('billing_cycle', value)}
                                                        variant="outline"
                                                    >
                                                        <ToggleGroupItem value="daily">{String(t('daily')) || 'Daily'}</ToggleGroupItem>
                                                        <ToggleGroupItem value="weekly">{String(t('weekly')) || 'Weekly'}</ToggleGroupItem>
                                                        <ToggleGroupItem value="monthly">{String(t('monthly')) || 'Monthly'}</ToggleGroupItem>
                                                    </ToggleGroup>
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="rental-rate">
                                                        {String(t('rental_rate')) || 'Rental Rate'} ({defaultCurrency})
                                                    </Label>
                                                    <Input
                                                        id="rental-rate"
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={data.rental_rate || ''}
                                                        onChange={(e) => setData('rental_rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="deposit">
                                                        {String(t('deposit')) || 'Deposit'} ({defaultCurrency})
                                                    </Label>
                                                    <Input
                                                        id="deposit"
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={data.deposit_amount || ''}
                                                        onChange={(e) => setData('deposit_amount', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card x-chunk="dashboard-07-chunk-1">
                                        <CardHeader>
                                            <CardTitle>{String(t('assigned_equipment')) || 'Assigned Equipment'}</CardTitle>
                                            <CardDescription>
                                                {String(t('assigned_equipment_desc')) || 'Select the equipment to be included in this rental'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="equipment">{String(t('equipment')) || 'Equipment'}</Label>
                                                    <Select
                                                        value={data.selected_equipment_id}
                                                        onValueChange={(value) => setData('selected_equipment_id', value)}
                                                    >
                                                        <SelectTrigger id="equipment">
                                                            <SelectValue placeholder={String(t('select_equipment')) || 'Select equipment'} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {equipment.map((item) => (
                                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                                    {String(item.name)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="operator">
                                                        {String(t('assigned_operator')) || 'Assigned Operator'} (Optional)
                                                    </Label>
                                                    <Select
                                                        value={data.selected_operator_id || 'none'}
                                                        onValueChange={(value) => setData('selected_operator_id', value === 'none' ? '' : value)}
                                                    >
                                                        <SelectTrigger id="operator">
                                                            <SelectValue placeholder={String(t('select_operator')) || 'Select an operator'} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">{String(t('opt_no_operator')) || 'No Operator'}</SelectItem>
                                                            {employees.map((operator) => (
                                                                <SelectItem key={operator.id} value={operator.id.toString()}>
                                                                    {String(operator.name)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
                                    <Card x-chunk="dashboard-07-chunk-3">
                                        <CardHeader>
                                            <CardTitle>{String(t('rental_summary')) || 'Rental Summary'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div>{String(t('subtotal')) || 'Subtotal'}</div>
                                                    <div>
                                                        {defaultCurrency} {data.subtotal.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {String(t('tax')) || 'Tax'} ({data.tax_percentage}%)
                                                    </div>
                                                    <div>
                                                        {defaultCurrency} {data.tax_amount.toFixed(2)}
                                                    </div>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between font-semibold">
                                                    <div>{String(t('total')) || 'Total'}</div>
                                                    <div>
                                                        {defaultCurrency} {data.total_amount.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
                                        <CardHeader className="flex flex-row items-start bg-muted/50">
                                            <div className="grid gap-0">
                                                <CardTitle className="group flex items-center gap-2 text-lg">
                                                    {String(t('payment_schedule')) || 'Payment Schedule'}
                                                </CardTitle>
                                                <CardDescription>
                                                    {String(t('payment_schedule_desc')) || 'Configure payment installments'}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 text-sm">
                                            <div className="grid gap-3">
                                                <div className="font-semibold">{String(t('installments')) || 'Installments'}</div>
                                                <ul className="grid gap-3">
                                                    <li className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">
                                                            {String(t('first_payment')) || 'First Payment'} (50%)
                                                        </span>
                                                        <span>
                                                            {defaultCurrency} {(data.total_amount / 2).toFixed(2)}
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">
                                                            {String(t('second_payment')) || 'Second Payment'} (50%)
                                                        </span>
                                                        <span>
                                                            {defaultCurrency} {(data.total_amount / 2).toFixed(2)}
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 md:hidden">
                                <Button variant="outline" size="sm" type="button">
                                    {t('discard') || 'Discard'}
                                </Button>
                                <Button size="sm" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : t('save_rental') || 'Save Rental'}
                                </Button>
                            </div>
                            <div>
                                <label className="mb-1 block font-medium">Upload Rental Document/Media</label>
                                <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

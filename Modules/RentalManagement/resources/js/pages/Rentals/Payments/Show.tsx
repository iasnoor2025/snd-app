import { AppLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle, formatCurrency } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, Clock, Download, Receipt, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Placeholder types
type PageProps = any;
type Employee = any;
type Rental = any;
type Payment = any;
type BreadcrumbItem = { title: string; href: string };

interface Props extends PageProps {
    auth: any;
    rental: Rental;
    payment: Payment;
    employees: Employee[];
}

export default function Show({ auth, payment }: Props) {
    const { t } = useTranslation('rental');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rentals', href: route('rentals.index') },
        { title: `Rental #${payment.rental.rental_number || payment.rental.id}`, href: route('rentals.show', payment.rental.id) },
        { title: 'Payments', href: route('rentals.payments.index', payment.rental.id) },
        { title: `Payment #${payment.id}`, href: route('rentals.payments.show', [payment.rental.id, payment.id]) },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-700">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout title={t('payment_details')} breadcrumbs={breadcrumbs}>
            <Head title={`Payment #${payment.id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('rentals.payments.index', payment.rental.id)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">{t('payment_details')}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {payment.receipt_path && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('payments.receipt', payment.id)} target="_blank" rel="noopener noreferrer">
                                    <Receipt className="mr-2 h-4 w-4" />
                                    View Receipt
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('payments.receipt', payment.id)} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('ttl_payment_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Amount</span>
                                <span className="text-lg font-semibold">{formatCurrency(payment.amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                {getStatusBadge(payment.status)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Method</span>
                                <span className="font-medium">{payment.method}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Reference</span>
                                <span className="font-medium">{payment.reference || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Date</span>
                                <span className="font-medium">{format(new Date(payment.date), 'MMM dd, yyyy')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('rental_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('lbl_rental_id')}</span>
                                <Link href={route('rentals.show', payment.rental.id)} className="font-medium text-blue-600 hover:underline">
                                    #{payment.rental.rental_number || payment.rental.id}
                                </Link>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('th_total_amount')}</span>
                                <span className="font-medium">{formatCurrency(payment.rental.total_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('due_date')}</span>
                                <span className="font-medium">
                                    {payment.rental.payment_due_date ? format(new Date(payment.rental.payment_due_date), 'MMM dd, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <Badge variant="outline">{payment.rental.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('ttl_additional_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('created_by')}</span>
                                <span className="font-medium">{payment.created_by.name}</span>
                            </div>
                            {payment.notes && (
                                <div className="mt-4">
                                    <span className="mb-2 block text-sm text-gray-500">Notes</span>
                                    <p className="text-sm">{payment.notes}</p>
                                </div>
                            )}
                            {payment.receipt_path && (
                                <div className="mt-6">
                                    <h3 className="mb-2 text-sm font-medium">{t('receipt_image')}</h3>
                                    <div className="rounded-md border p-2">
                                        <img
                                            src={`/storage/${payment.receipt_path}`}
                                            alt={t('payment_receipt')}
                                            className="mx-auto max-h-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

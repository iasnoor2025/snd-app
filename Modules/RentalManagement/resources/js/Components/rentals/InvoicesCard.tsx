import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// ShadCN UI Components
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Core';

// Icons
import { AlertCircle, CheckCircle, Clock, Download, Eye, FilePlus, Receipt } from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    status: string;
    due_date: string;
    is_overdue: boolean;
    is_paid: boolean;
    created_at: string;
}

interface InvoicesCardProps {
    invoices: {
        data: Invoice[];
        total: number;
        total_amount: number;
        total_paid: number;
        total_outstanding: number;
        has_overdue: boolean;
    };
    rental: any;
    canCreateInvoice?: boolean;
    className?: string;
}

export default function InvoicesCard({ invoices, rental, canCreateInvoice = false, className = '' }: InvoicesCardProps) {
    const { t } = useTranslation('rental');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(amount);
    };

    const getStatusBadge = (invoice: Invoice & { erp_status?: string }) => {
        const status = invoice.erp_status || invoice.status;
        if (invoice.is_paid || status === 'Paid') {
            return (
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {status}
                </Badge>
            );
        }
        if (invoice.is_overdue || status === 'Overdue') {
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-700">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {status}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-amber-200 bg-amber-100 text-amber-700">
                <Clock className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const handleCreateInvoice = () => {
        router.post(route('rentals.create-invoice', rental.id));
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Invoices</CardTitle>
                        <CardDescription>{t('invoice_details_for_this_rental')}</CardDescription>
                    </div>
                    {canCreateInvoice && (
                        <Button variant="outline" size="sm" onClick={handleCreateInvoice}>
                            <FilePlus className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {invoices.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-2 text-muted-foreground">{t('no_invoices_created_yet')}</p>
                        {canCreateInvoice && (
                            <Button variant="default" size="sm" onClick={handleCreateInvoice} className="mt-2">
                                <FilePlus className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Button>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                    <TableCell>{invoice.created_at ? format(new Date(invoice.created_at), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <a href={route('invoices.show', invoice.id)}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <a href={route('invoices.download', invoice.id)}>
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {invoices.data.length > 0 && (
                <CardFooter className="flex justify-between border-t p-4">
                    <div className="text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="font-medium">Total Amount:</div>
                            <div className="text-right">{formatCurrency(invoices.total_amount)}</div>
                            <div className="font-medium">Total Paid:</div>
                            <div className="text-right text-green-600">{formatCurrency(invoices.total_paid)}</div>
                            <div className="font-medium">Outstanding:</div>
                            <div className="text-right text-red-600">{formatCurrency(invoices.total_outstanding)}</div>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

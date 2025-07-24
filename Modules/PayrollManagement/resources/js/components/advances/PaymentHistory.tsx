import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Core';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { Download, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    notes: string;
    recorded_by: string;
    advance_payment_id: number;
}

interface MonthlyHistoryItem {
    month: string;
    total_amount: number;
    payments: Payment[];
}

interface PaymentHistoryProps {
    employeeId: number;
    initialMonthlyHistory?: MonthlyHistoryItem[];
    initialTotalRepaid?: number;
    initialPagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    showOnlyLast?: boolean;
}

export function PaymentHistory({
    employeeId,
    initialMonthlyHistory = [],
    initialTotalRepaid = 0,
    initialPagination = { current_page: 1, last_page: 1, per_page: 5, total: 0 },
    showOnlyLast = false,
}: PaymentHistoryProps) {
    const { t } = useTranslation('payroll');

    const [isLoading, setIsLoading] = useState(false);
    const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistoryItem[]>(initialMonthlyHistory);
    const [totalRepaidAmount, setTotalRepaidAmount] = useState<number>(Number(initialTotalRepaid) || 0);
    const [currentPage, setCurrentPage] = useState(initialPagination.current_page);
    const [totalPages, setTotalPages] = useState(initialPagination.last_page);
    const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchPaymentHistory = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/employees/${employeeId}/advance-payments/history`, {
                params: {
                    page,
                    per_page: showOnlyLast ? 1 : 10,
                    showOnlyLast: showOnlyLast,
                },
            });

            if (response.data.monthlyHistory) {
                setMonthlyHistory(response.data.monthlyHistory);
                setTotalRepaidAmount(Number(response.data.totalRepaid) || 0);
                setCurrentPage(response.data.pagination.current_page);
                setTotalPages(response.data.pagination.last_page);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            toast.error('Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchPaymentHistory();
        }
    }, [employeeId]);

    const handleDeletePayment = (paymentId: number) => {
        if (!paymentId) {
            toast.error('Invalid payment ID');
            return;
        }

        router.delete(
            route('hr.payroll.employees.advances.payment-history.delete', {
                employee: employeeId,
                payment: paymentId,
            }),
            {
                onSuccess: () => {
                    toast.success('Payment record deleted successfully');
                    setIsDeleteDialogOpen(false);
                    setSelectedPayment(null);
                    // Refresh only the payment history data
                    fetchPaymentHistory(currentPage);
                },
                onError: (errors) => {
                    console.error('Delete payment error:', errors);
                    toast.error(errors?.message || 'Failed to delete payment record');
                    setIsDeleteDialogOpen(false);
                    setSelectedPayment(null);
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-2">Loading payment history...</span>
            </div>
        );
    }

    if (!monthlyHistory.length) {
        return (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">{t('no_payment_records_found')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('payment_history')}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total: SAR {totalRepaidAmount.toFixed(2)}</span>
                    {showOnlyLast && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('hr.payroll.employees.advances.payment-history', { employee: employeeId })}>View Full History</Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {monthlyHistory.map((monthly, index) => (
                    <div key={index} className="overflow-hidden rounded-md border">
                        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                            <h3 className="font-medium">{monthly.month}</h3>
                            <div className="text-sm font-semibold">Total: SAR {Number(monthly.total_amount).toFixed(2)}</div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <TableHead>{t('th_payment_date')}</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>{t('th_recorded_by')}</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthly.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="text-sm">{format(new Date(payment.payment_date), 'PP')}</TableCell>
                                        <TableCell className="text-sm font-medium">SAR {Number(payment.amount).toFixed(2)}</TableCell>
                                        <TableCell className="text-sm">{payment.notes}</TableCell>
                                        <TableCell className="text-sm">{payment.recorded_by}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        const url = route('hr.payroll.employees.advances.payment.receipt', {
                                                            employee: employeeId,
                                                            payment: payment.id,
                                                        });
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => {
                                                        setSelectedPayment(payment.id);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}

                {/* Pagination */}
                {!showOnlyLast && totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => currentPage > 1 && fetchPaymentHistory(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => currentPage < totalPages && fetchPaymentHistory(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_delete_payment_record')}</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this payment record? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedPayment && handleDeletePayment(selectedPayment)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PaymentHistory;

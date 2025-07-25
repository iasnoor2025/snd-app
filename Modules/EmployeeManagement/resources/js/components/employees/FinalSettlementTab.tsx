import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
    Textarea,
    usePermission,
    useToast,
} from '@/Core';
import { format } from 'date-fns';
import { Download, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Deduction {
    id: number;
    type: string;
    description: string;
    amount: number;
}

interface FinalSettlement {
    id: number;
    last_working_date: string;
    leave_balance_payout: number;
    gratuity_amount: number;
    total_deductions: number;
    total_payable: number;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    approved_by: {
        name: string;
    } | null;
    approved_at: string | null;
    rejection_reason: string | null;
    deductions: Deduction[];
    created_at: string;
}

interface Props {
    employee: {
        id: number;
        employee_id: string;
        first_name: string;
        last_name: string;
        status: string;
    };
    settlements: FinalSettlement[];
}

export default function FinalSettlementTab({ employee, settlements }: Props) {
    const { t } = useTranslation('employee');

    const { toast } = useToast();
    const { hasPermission } = usePermission();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState<FinalSettlement | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = (settlement: FinalSettlement) => {
        fetch(route('final-settlements.approve', settlement.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    toast({
                        title: 'Success',
                        description: 'Final settlement approved successfully.',
                    });
                }
            })
            .catch((error) => {
                console.error('Error approving final settlement:', error);
            });
    };

    const handleReject = (settlement: FinalSettlement) => {
        setSelectedSettlement(settlement);
        setIsRejectDialogOpen(true);
    };

    const submitRejection = () => {
        if (!selectedSettlement || !rejectionReason) return;

        fetch(route('final-settlements.reject', selectedSettlement.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                rejection_reason: rejectionReason,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    toast({
                        title: 'Success',
                        description: 'Final settlement rejected successfully.',
                    });
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                    setSelectedSettlement(null);
                }
            })
            .catch((error) => {
                console.error('Error rejecting final settlement:', error);
            });
    };

    const downloadSettlement = (settlement: FinalSettlement) => {
        window.open(route('final-settlements.download', settlement.id), '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('final_settlement')}</h2>
                {hasPermission('final-settlements.create') && (
                    <Button onClick={() => (window.location.href = route('hr.payroll.final-settlements.create'))}>Create Settlement</Button>
                )}
            </div>

            {settlements.length === 0 ? (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                            <Receipt className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p>No final settlements found for this employee.</p>
                            {hasPermission('final-settlements.create') && (
                                <Button className="mt-4" onClick={() => (window.location.href = route('hr.payroll.final-settlements.create'))}>
                                    Create New Settlement
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {settlements.map((settlement) => (
                        <Card key={settlement.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>Settlement #{settlement.id}</CardTitle>
                                        <CardDescription>Created on {format(new Date(settlement.created_at), 'PPP')}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            settlement.status === 'approved'
                                                ? 'secondary'
                                                : settlement.status === 'rejected'
                                                  ? 'destructive'
                                                  : 'outline'
                                        }
                                    >
                                        {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {settlement.approved_by && (
                                        <div>
                                            <h3 className="font-medium">{t('approved_by')}</h3>
                                            <p>{settlement.approved_by.name}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(settlement.approved_at!), 'PPP')}</p>
                                        </div>
                                    )}
                                    {settlement.rejection_reason && (
                                        <div>
                                            <h3 className="font-medium">{t('lbl_rejection_reason')}</h3>
                                            <p className="whitespace-pre-wrap">{settlement.rejection_reason}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => downloadSettlement(settlement)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        {settlement.status === 'pending' && hasPermission('final-settlements.approve') && (
                                            <>
                                                <Button variant="destructive" onClick={() => handleReject(settlement)}>
                                                    Reject
                                                </Button>
                                                <Button onClick={() => handleApprove(settlement)}>Approve</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_reject_final_settlement')}</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this final settlement.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">{t('lbl_reason_for_rejection')}</Label>
                            <Textarea
                                id="reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('ph_enter_the_reason_for_rejection')}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRejectDialogOpen(false);
                                setRejectionReason('');
                                setSelectedSettlement(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitRejection} disabled={!rejectionReason.trim()}>
                            Reject Settlement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

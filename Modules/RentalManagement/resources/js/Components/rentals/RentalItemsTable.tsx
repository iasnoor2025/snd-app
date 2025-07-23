import { Employee, RentalItem } from '@/Core/types/models';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Shadcn UI Components
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core';

import axios from 'axios';
import { format } from 'date-fns';
import { DynamicPricingManager } from '../DynamicPricingManager';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Core/Components/ui';

interface ExtendedRentalItem extends Omit<RentalItem, 'operator'> {
    daily_rate?: number;
    days?: number;
    total_price?: number;
    operator_id?: number | null;
    operator?:
        | Employee
        | null
        | {
              id: number;
              name: string;
          };
}

interface Props {
    rentalItems: any[];
    items: ExtendedRentalItem[] | undefined;
    readOnly?: boolean;
}

export default function RentalItemsTable({ rentalItems, items = [], readOnly = true }: Props) {
    const { t } = useTranslation('rental');
    const [openEquipmentId, setOpenEquipmentId] = useState<number | null>(null);
    const [returnDialogOpenId, setReturnDialogOpenId] = useState<number | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(new Date());
    const [isReturning, setIsReturning] = useState(false);

    // Format currency for display
    const formatCurrency = (amount: number) => {
        // Check for null, undefined, or NaN
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
            return 'SAR 0.00';
        }

        // Ensure amount is a number
        const numericAmount = Number(amount);

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(numericAmount);
    };

    // Calculate subtotal for all items
    const subtotal = (items || []).reduce((sum, item) => {
        const itemTotal = Number(item.total_price || item.total_amount || 0);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Equipment</TableHead>
                        <TableHead className="w-[15%]">Operator</TableHead>
                        <TableHead className="w-[15%]">Price/Day</TableHead>
                        <TableHead className="w-[10%]">Quantity</TableHead>
                        <TableHead className="w-[10%]">Days</TableHead>
                        <TableHead className="w-[20%] text-right">Subtotal</TableHead>
                        <TableHead className="w-[10%] text-right">Pricing</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!items || items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                No items found for this rental.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">
                                    {(() => {
                                        const eqName = item.equipment?.name;
                                        if (!eqName) return 'Unknown Equipment';
                                        if (typeof eqName === 'string') return eqName;
                                        if (typeof eqName === 'object' && eqName !== null) {
                                            if ('en' in eqName) return eqName.en;
                                            const firstVal = Object.values(eqName)[0];
                                            if (typeof firstVal === 'string') return firstVal;
                                        }
                                        return String(eqName);
                                    })()}
                                </TableCell>
                                <TableCell>
                                    {item.operator_id ? (
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                            {item.operator
                                                ? typeof item.operator === 'object' && item.operator !== null
                                                    ? 'name' in item.operator
                                                        ? item.operator.name
                                                        : 'first_name' in item.operator && 'last_name' in item.operator
                                                          ? `${item.operator.first_name} ${item.operator.last_name}`
                                                          : 'With Driver'
                                                    : 'With Driver'
                                                : 'With Driver'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                                            No Driver
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{formatCurrency(item.daily_rate || (item.rate_type === 'daily' ? item.rate : 0) || 0)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.days || 1}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(item.total_price || item.total_amount || 0)}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => setOpenEquipmentId(item.equipment_id)}>
                                        Manage Pricing
                                    </Button>
                                    <Dialog open={openEquipmentId === item.equipment_id} onOpenChange={() => setOpenEquipmentId(null)}>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Dynamic Pricing for Equipment #{item.equipment_id}</DialogTitle>
                                            </DialogHeader>
                                            <DynamicPricingManager equipmentId={item.equipment_id} />
                                        </DialogContent>
                                    </Dialog>
                                    {!item.returned_at && (
                                        <Dialog open={returnDialogOpenId === item.id} onOpenChange={() => setReturnDialogOpenId(null)}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="ml-2">
                                                    {t('btn_return_item', 'Return')}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{t('ttl_return_item', 'Return Rental Item')}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-medium">{t('return_date', 'Return Date')}</label>
                                                    <input
                                                        type="date"
                                                        className="rounded border px-2 py-1"
                                                        value={returnDate ? format(returnDate, 'yyyy-MM-dd') : ''}
                                                        onChange={(e) => setReturnDate(e.target.value ? new Date(e.target.value) : null)}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        onClick={async () => {
                                                            if (!returnDate) return;
                                                            setIsReturning(true);
                                                            try {
                                                                await axios.post(`/api/rental-items/${item.id}/return`, {
                                                                    return_date: format(returnDate, 'yyyy-MM-dd'),
                                                                    return_condition: 'good', // TODO: Add real input for condition
                                                                });
                                                                window.location.reload();
                                                            } catch (e) {
                                                                setIsReturning(false);
                                                                // TODO: Add toast error
                                                            }
                                                        }}
                                                        disabled={isReturning}
                                                    >
                                                        {isReturning ? t('processing', 'Processing...') : t('btn_confirm_return', 'Confirm Return')}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}

                    {/* Totals */}
                    <TableRow>
                        <TableCell colSpan={6} className="text-right font-medium">
                            Subtotal
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

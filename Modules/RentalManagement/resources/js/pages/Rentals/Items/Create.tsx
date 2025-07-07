import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Textarea } from "@/Core";

// Placeholder types
type Equipment = { id: number; name: string };
type Employee = { id: number; name: string };

interface Props {
    rental: {
        id: number;
    };
    equipment: Equipment[];
    operators: Employee[];
}

const Create: FC<Props> = ({ rental, equipment, operators }) => {
    const { t } = useTranslation('rental');
    const { data, setData, post, processing, errors } = useForm({
        equipment_id: '',
        operator_id: '',
        rate: '',
        rate_type: 'daily',
        days: '',
        discount_percentage: '0',
        notes: '',
        start_date: '',
        end_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/rentals/${rental.id}/items`);
    };

    // Live total calculation
    const total = useMemo(() => {
        const rate = parseFloat(data.rate) || 0;
        const days = parseInt(data.days) || 0;
        const discount = parseFloat(data.discount_percentage) || 0;
        if (!rate || !days) return 0;
        return rate * days * (1 - discount / 100);
    }, [data.rate, data.days, data.discount_percentage]);

    return (
        <>
            <Head title={t('ttl_add_rental_item')} />

            <div className="container mx-auto py-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_add_rental_item')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="equipment_id">Equipment</Label>
                                    <Select
                                        value={data.equipment_id}
                                        onValueChange={(value) => setData('equipment_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_equipment')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipment.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.equipment_id && (
                                        <p className="text-sm text-red-500">{errors.equipment_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="operator_id">Operator</Label>
                                    <Select
                                        value={data.operator_id}
                                        onValueChange={(value) => setData('operator_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_operator')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {operators.map((operator) => (
                                                <SelectItem key={operator.id} value={operator.id.toString()}>
                                                    {operator.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.operator_id && (
                                        <p className="text-sm text-red-500">{errors.operator_id}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rate">Rate</Label>
                                        <Input
                                            id="rate"
                                            type="number"
                                            step="0.01"
                                            value={data.rate}
                                            onChange={(e) => setData('rate', e.target.value)}
                                        />
                                        {errors.rate && (
                                            <p className="text-sm text-red-500">{errors.rate}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rate_type">{t('lbl_rate_type')}</Label>
                                        <Select
                                            value={data.rate_type}
                                            onValueChange={(value) => setData('rate_type', value)}
                                        >
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
                                        {errors.rate_type && (
                                            <p className="text-sm text-red-500">{errors.rate_type}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="days">Days</Label>
                                        <Input
                                            id="days"
                                            type="number"
                                            value={data.days}
                                            onChange={(e) => setData('days', e.target.value)}
                                        />
                                        {errors.days && (
                                            <p className="text-sm text-red-500">{errors.days}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discount_percentage">Discount (%)</Label>
                                        <Input
                                            id="discount_percentage"
                                            type="number"
                                            step="0.01"
                                            value={data.discount_percentage}
                                            onChange={(e) => setData('discount_percentage', e.target.value)}
                                        />
                                        {errors.discount_percentage && (
                                            <p className="text-sm text-red-500">{errors.discount_percentage}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        {errors.start_date && (
                                            <p className="text-sm text-red-500">{errors.start_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                        {errors.end_date && (
                                            <p className="text-sm text-red-500">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Total Calculation */}
                                <div className="py-4 text-right">
                                    <span className="font-semibold">Total: </span>
                                    <span className="text-lg font-bold">{total.toLocaleString(undefined, { style: 'currency', currency: 'SAR' })}</span>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {t('btn_add_item')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Create;















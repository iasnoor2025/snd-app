import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/rentals/${rental.id}/items`);
    };

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

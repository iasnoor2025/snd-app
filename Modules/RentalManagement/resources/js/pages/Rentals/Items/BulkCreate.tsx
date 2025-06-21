import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Textarea } from "@/Core";
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    rental: {
        id: number;
    };
    equipment: Equipment[];
    operators: Employee[];
}

interface RentalItemForm {
    [key: string]: string;
    equipment_id: string;
    operator_id: string;
    rate: string;
    rate_type: string;
    days: string;
    discount_percentage: string;
    notes: string;
}

// Placeholder types
type Equipment = { id: number; name: string };
type Employee = { id: number; name: string };

const BulkCreate: FC<Props> = ({ rental, equipment, operators }) => {
    const { t } = useTranslation('rental');
    const [items, setItems] = useState<RentalItemForm[]>([
        {
            equipment_id: '',
            operator_id: '',
            rate: '',
            rate_type: 'daily',
            days: '',
            discount_percentage: '0',
            notes: '',
        },
    ]);

    const { post, processing, errors, setData } = useForm({
        items,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/rentals/${rental.id}/items/bulk`);
    };

    const addItem = () => {
        const newItems = [
            ...items,
            {
                equipment_id: '',
                operator_id: '',
                rate: '',
                rate_type: 'daily',
                days: '',
                discount_percentage: '0',
                notes: '',
            },
        ];
        setItems(newItems);
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof RentalItemForm, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
        setData('items', newItems);
    };

    return (
        <>
            <Head title={t('ttl_bulk_add_rental_items')} />

            <div className="container mx-auto py-6">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_bulk_add_rental_items')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Item {index + 1}</h3>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`equipment_id_${index}`}>Equipment</Label>
                                            <Select
                                                value={item.equipment_id}
                                                onValueChange={(value) => updateItem(index, 'equipment_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('ph_select_equipment')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {equipment.map((equip) => (
                                                        <SelectItem key={equip.id} value={equip.id.toString()}>
                                                            {equip.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {(errors as any)[`items.${index}.equipment_id`] && (
                                                <p className="text-sm text-red-500">{(errors as any)[`items.${index}.equipment_id`]}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`operator_id_${index}`}>Operator</Label>
                                            <Select
                                                value={item.operator_id}
                                                onValueChange={(value) => updateItem(index, 'operator_id', value)}
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
                                            {(errors as any)[`items.${index}.operator_id`] && (
                                                <p className="text-sm text-red-500">{(errors as any)[`items.${index}.operator_id`]}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`rate_${index}`}>Rate</Label>
                                                <Input
                                                    id={`rate_${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                                                />
                                                {(errors as any)[`items.${index}.rate`] && (
                                                    <p className="text-sm text-red-500">{(errors as any)[`items.${index}.rate`]}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`rate_type_${index}`}>{t('lbl_rate_type')}</Label>
                                                <Select
                                                    value={item.rate_type}
                                                    onValueChange={(value) => updateItem(index, 'rate_type', value)}
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
                                                {(errors as any)[`items.${index}.rate_type`] && (
                                                    <p className="text-sm text-red-500">{(errors as any)[`items.${index}.rate_type`]}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`days_${index}`}>Days</Label>
                                                <Input
                                                    id={`days_${index}`}
                                                    type="number"
                                                    value={item.days}
                                                    onChange={(e) => updateItem(index, 'days', e.target.value)}
                                                />
                                                {(errors as any)[`items.${index}.days`] && (
                                                    <p className="text-sm text-red-500">{(errors as any)[`items.${index}.days`]}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`discount_percentage_${index}`}>Discount (%)</Label>
                                                <Input
                                                    id={`discount_percentage_${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    value={item.discount_percentage}
                                                    onChange={(e) => updateItem(index, 'discount_percentage', e.target.value)}
                                                />
                                                {(errors as any)[`items.${index}.discount_percentage`] && (
                                                    <p className="text-sm text-red-500">{(errors as any)[`items.${index}.discount_percentage`]}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`notes_${index}`}>Notes</Label>
                                            <Textarea
                                                id={`notes_${index}`}
                                                value={item.notes}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                            />
                                            {(errors as any)[`items.${index}.notes`] && (
                                                <p className="text-sm text-red-500">{(errors as any)[`items.${index}.notes`]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addItem}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Another Item
                                    </Button>

                                    <div className="space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Add Items
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default BulkCreate;















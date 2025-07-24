import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/Core';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RentalToastService } from '../../../services/RentalToastService';

interface Props {
    rental: {
        id: number;
    };
    equipment: Equipment[];
    operators: Employee[];
}

interface Equipment {
    id: number;
    name: string;
    description: string;
}

interface Employee {
    id: number;
    name: string;
}

interface RentalItem {
    equipment_id: string;
    operator_ids: string[];
    quantity: number;
    notes: string;
}

export const BulkCreate: FC<Props> = ({ rental, equipment, operators }) => {
    const { t } = useTranslation('rental');
    const [items, setItems] = useState<RentalItem[]>([
        {
            equipment_id: '',
            operator_ids: [],
            quantity: 1,
            notes: '',
        },
    ]);

    const { processing, post } = useForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            RentalToastService.bulkOperationStarted('creating rental items', items.length);

            await post(route('rentals.items.bulk-store', rental.id), {
                items,
                onSuccess: () => {
                    RentalToastService.bulkOperationCompleted('created', items.length);
                },
                onError: (error) => {
                    RentalToastService.bulkOperationFailed('creation', error?.message);
                },
            });
        } catch (error) {
            RentalToastService.bulkOperationFailed('creation', error?.message);
        }
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                equipment_id: '',
                operator_ids: [],
                quantity: 1,
                notes: '',
            },
        ]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof RentalItem, value: any) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setItems(newItems);
    };

    return (
        <>
            <Head title={t('bulk_create_rental_items')} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('bulk_create_rental_items')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {items.map((item, index) => (
                            <div key={index} className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">
                                        {t('item')} #{index + 1}
                                    </h3>
                                    {items.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor={`equipment_${index}`}>{t('equipment')}</Label>
                                        <Select value={item.equipment_id} onValueChange={(value) => updateItem(index, 'equipment_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select_equipment')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {equipment.map((eq) => (
                                                    <SelectItem key={eq.id} value={eq.id.toString()}>
                                                        {eq.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor={`operators_${index}`}>{t('operators')}</Label>
                                        <Select
                                            value={item.operator_ids}
                                            onValueChange={(value) => updateItem(index, 'operator_ids', Array.isArray(value) ? value : [value])}
                                            multiple
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select_operators')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {operators.map((op) => (
                                                    <SelectItem key={op.id} value={op.id.toString()}>
                                                        {op.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor={`quantity_${index}`}>{t('quantity')}</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor={`notes_${index}`}>{t('notes')}</Label>
                                        <Textarea value={item.notes} onChange={(e) => updateItem(index, 'notes', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between">
                            <Button type="button" variant="outline" onClick={addItem} disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('add_item')}
                            </Button>

                            <Button type="submit" disabled={processing}>
                                {t('create_items')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
};

import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea } from '@/Core';
import { RentalItem } from '@/Modules/RentalManagement/resources/js/Types/rental';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    item: RentalItem;
}

export const Edit: FC<Props> = ({ item }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: item.name,
        description: item.description,
        category: item.category,
        daily_rate: item.daily_rate.toString(),
        condition: item.condition,
        serial_number: item.serial_number || '',
        notes: item.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        const { t } = useTranslation('rental');

        e.preventDefault();
        put(route('rentals.items.update', item.id));
    };

    return (
        <>
            <Head title={`Edit ${item.name}`} />

            <div className="container mx-auto py-6">
                <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_edit_rental_item')}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    {errors.name && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.name}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} required>
                                        <option value="">{t('select_category')}</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="tools">Tools</option>
                                        <option value="vehicles">Vehicles</option>
                                    </Select>
                                    {errors.category && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.category}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                                    <Input
                                        id="daily_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.daily_rate}
                                        onChange={(e) => setData('daily_rate', e.target.value)}
                                        required
                                    />
                                    {errors.daily_rate && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.daily_rate}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select id="condition" value={data.condition} onChange={(e) => setData('condition', e.target.value)} required>
                                        <option value="new">New</option>
                                        <option value="like_new">{t('like_new')}</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </Select>
                                    {errors.condition && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.condition}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serial_number">{t('lbl_serial_number')}</Label>
                                    <Input id="serial_number" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                                    {errors.serial_number && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.serial_number}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        required
                                    />
                                    {errors.description && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.description}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                    {errors.notes && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{errors.notes}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Item
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Edit;

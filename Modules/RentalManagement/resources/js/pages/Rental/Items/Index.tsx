import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@/Core';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder type for RentalItem
type RentalItem = any;

const { t } = useTranslation('RentalManagement');

interface Props {
    items: RentalItem[];
    filters?: {
        search?: string;
        status?: string;
        category?: string;
    };
}

export const Index: FC<Props> = ({ items, filters = { search: '', status: '', category: '' } }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');

    const { get } = useForm();

    const handleSearch = () => {
        get(
            route('rentals.items.index', {
                search,
                status,
                category,
            }),
        );
    };

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
        },
        {
            header: 'Category',
            accessorKey: 'category',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <span
                    className={`rounded-full px-2 py-1 text-xs ${
                        row.original.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : row.original.status === 'rented'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {row.original.status}
                </span>
            ),
        },
        {
            header: 'Daily Rate',
            accessorKey: 'daily_rate',
            cell: ({ row }) => `$${row.original.daily_rate.toFixed(2)}`,
        },
        {
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => (window.location.href = route('rentals.items.show', row.original.id))}>
                        View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => (window.location.href = route('rentals.items.edit', row.original.id))}>
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title={t('rental_items')} />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t('rental_items')}</CardTitle>
                            <Button onClick={() => (window.location.href = route('rentals.items.create'))}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('btn_add_item')}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="mb-4 flex space-x-4">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('ph_search_items')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                                <option value="">{t('all_status')}</option>
                                <option value="available">Available</option>
                                <option value="rented">Rented</option>
                                <option value="maintenance">Maintenance</option>
                            </Select>
                            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                                <option value="">{t('all_categories')}</option>
                                <option value="equipment">Equipment</option>
                                <option value="tools">Tools</option>
                                <option value="vehicles">Vehicles</option>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>

                        {items.map((row: any) => (
                            <div key={row.id}>{row.name}</div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Index;

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { formatCurrency } from "@/Core";
import { getTranslation } from '@/Core/utils/translation';

// Placeholder type for RentalItem
type RentalItem = any;

interface Props {
    rental: {
        id: number;
        items: RentalItem[];
    };
}

export const Index: FC<Props> = ({ rental }) => {
    const { t } = useTranslation('RentalManagement');
    const { props } = usePage();
    const locale = props.locale || 'en';

    return (
        <>
            <Head title={t('rental_items')} />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('rental_items')}</h1>
                    <div className="space-x-2">
                        <Link href={`/rentals/${rental.id}/items/bulk-create`}>
                            <Button variant="outline">{t('btn_bulk_add_items')}</Button>
                        </Link>
                        <Link href={`/rentals/${rental.id}/items/create`}>
                            <Button>{t('btn_add_item')}</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_items_list')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Equipment</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rental.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.equipment.name}</TableCell>
                                        <TableCell>{item.operator?.name || 'N/A'}</TableCell>
                                        <TableCell>{formatCurrency(item.rate)}</TableCell>
                                        <TableCell>{item.days}</TableCell>
                                        <TableCell>{item.discount_percentage}%</TableCell>
                                        <TableCell>{formatCurrency(item.total_amount)}</TableCell>
                                        <TableCell>
                                            <div className="space-x-2">
                                                <Link href={`/rentals/${rental.id}/items/${item.id}/edit`}>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Index;















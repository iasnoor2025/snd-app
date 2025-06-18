import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, History, Calendar } from 'lucide-react';
import { RentalItem } from '@/Modules/RentalManagement/Resources/js/Types/rental';

interface Props {
    item: RentalItem;
    rentalHistory: {
        id: number;
        start_date: string;
        end_date: string;
        customer_name: string;
        total_amount: number;
        status: string;
    }[];
}

export const Show: FC<Props> = ({ item, rentalHistory }) => {
    const getStatusColor = (status: string) => {
  const { t } = useTranslation('rental');

        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'rented':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'new':
                return 'bg-green-100 text-green-800';
            case 'like_new':
                return 'bg-blue-100 text-blue-800';
            case 'good':
                return 'bg-yellow-100 text-yellow-800';
            case 'fair':
                return 'bg-orange-100 text-orange-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title={item.name} />

            <div className="container mx-auto py-6">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('ttl_item_details')}</CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = route('rentals.items.edit', item.id)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                <p className="mt-1">{item.name}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                <p className="mt-1 capitalize">{item.category}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <Badge className={`mt-1 ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                                <Badge className={`mt-1 ${getConditionColor(item.condition)}`}>
                                    {item.condition.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('daily_rate')}</h3>
                                <p className="mt-1">${item.daily_rate.toFixed(2)}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('lbl_serial_number')}</h3>
                                <p className="mt-1">{item.serial_number || 'N/A'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="mt-1 whitespace-pre-wrap">{item.description}</p>
                            </div>

                            {item.notes && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                                    <p className="mt-1 whitespace-pre-wrap">{item.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('ttl_rental_history')}</CardTitle>
                                <History className="w-5 h-5 text-gray-400" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            {rentalHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {rentalHistory.map((rental) => (
                                        <div
                                            key={rental.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium">{rental.customer_name}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">${rental.total_amount.toFixed(2)}</p>
                                                <Badge className={getStatusColor(rental.status)}>
                                                    {rental.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No rental history available
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Show;

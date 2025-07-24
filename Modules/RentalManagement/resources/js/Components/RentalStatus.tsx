import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface RentalStatusProps {
    rentals?: any[];
}

export const RentalStatus: React.FC<RentalStatusProps> = ({ rentals = [] }) => {
    const { t } = useTranslation('rental');

    // Count rentals by status
    const statusCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};

        rentals.forEach((rental) => {
            const status = rental.status || 'unknown';
            counts[status] = (counts[status] || 0) + 1;
        });

        return counts;
    }, [rentals]);

    // Format the status counts for display
    const formattedStatusCounts = React.useMemo(() => {
        return Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        }));
    }, [statusCounts]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('rental_status_overview')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {formattedStatusCounts.map(({ status, count, label }) => (
                        <div key={status} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-2xl font-bold">{count}</p>
                            </div>
                            <Badge
                                variant={
                                    status === 'active'
                                        ? 'default'
                                        : status === 'pending'
                                          ? 'secondary'
                                          : status === 'completed'
                                            ? 'outline'
                                            : status === 'overdue'
                                              ? 'destructive'
                                              : 'outline'
                                }
                            >
                                {label}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

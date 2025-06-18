import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface LeaveRecord {
    id: number;
    type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    notes?: string;
}

interface Props {
    records: LeaveRecord[];
}

export default function LeaveHistory({ records }: Props) {
  const { t } = useTranslation('employee');

    const getStatusBadge = (status: LeaveRecord['status']) => {
        return (
            <Badge
                variant={
                    status === 'approved'
                        ? 'success'
                        : status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                }
            >
                {status}
            </Badge>
        );
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${format(startDate, 'MMM dd, yyyy')} - ${format(
            endDate,
            'MMM dd, yyyy'
        )}`;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>{t('th_date_range')}</TableHead>
                        <TableHead>{t('th_total_days')}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">
                                {record.type}
                            </TableCell>
                            <TableCell>
                                {formatDateRange(record.start_date, record.end_date)}
                            </TableCell>
                            <TableCell>{record.total_days}</TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                                {record.reason}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {record.notes || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {records.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No leave records found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

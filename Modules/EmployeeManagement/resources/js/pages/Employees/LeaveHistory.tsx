import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Badge } from "@/Core";
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
  const { t } = useTranslation('employees');

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
                        <TableHead>{t('lbl_leave_type')}</TableHead>
                        <TableHead>{t('lbl_start_date')}</TableHead>
                        <TableHead>{t('lbl_end_date')}</TableHead>
                        <TableHead>{t('lbl_status')}</TableHead>
                        <TableHead>{t('lbl_actions')}</TableHead>
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

















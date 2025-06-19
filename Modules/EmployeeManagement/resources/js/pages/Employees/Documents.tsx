import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Modules/Core/resources/js/components/ui/table';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { format } from 'date-fns';
import { Download, Eye } from 'lucide-react';

interface Document {
    id: number;
    type: string;
    name: string;
    description?: string;
    expiry_date?: string;
    status: 'active' | 'expired' | 'pending';
    notes?: string;
    file_url: string;
}

interface Props {
    documents: Document[];
}

export default function Documents({ documents }: Props) {
  const { t } = useTranslation('employee');

    const getStatusBadge = (status: Document['status']) => {
        return (
            <Badge
                variant={
                    status === 'active'
                        ? 'success'
                        : status === 'expired'
                        ? 'destructive'
                        : 'secondary'
                }
            >
                {status}
            </Badge>
        );
    };

    const isExpired = (expiryDate?: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>{t('expiry_date')}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((document) => (
                        <TableRow key={document.id}>
                            <TableCell className="font-medium">
                                {document.type}
                            </TableCell>
                            <TableCell>{document.name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                                {document.description || '-'}
                            </TableCell>
                            <TableCell>
                                {document.expiry_date
                                    ? format(new Date(document.expiry_date), 'MMM dd, yyyy')
                                    : '-'}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(
                                    isExpired(document.expiry_date)
                                        ? 'expired'
                                        : document.status
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {document.notes || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => window.open(document.file_url, '_blank')}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = document.file_url;
                                            link.download = document.name;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {documents.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No documents found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

















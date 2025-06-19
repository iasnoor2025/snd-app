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
import { format } from 'date-fns';

interface PerformanceReview {
    id: number;
    review_date: string;
    reviewer: string;
    rating: number;
    status: 'pending' | 'completed';
    strengths: string[];
    areas_for_improvement: string[];
    goals: string[];
    notes?: string;
}

interface Props {
    reviews: PerformanceReview[];
}

export default function PerformanceReviews({ reviews }: Props) {
  const { t } = useTranslation('employee');

    const getRatingBadge = (rating: number) => {
        let variant: 'default' | 'success' | 'warning' | 'destructive' = 'default';
        if (rating >= 4) variant = 'success';
        else if (rating >= 3) variant = 'warning';
        else if (rating < 3) variant = 'destructive';

        return (
            <Badge variant={variant} className="font-medium">
                {rating.toFixed(1)}/5.0
            </Badge>
        );
    };

    const getStatusBadge = (status: PerformanceReview['status']) => {
        return (
            <Badge
                variant={status === 'completed' ? 'success' : 'secondary'}
            >
                {status}
            </Badge>
        );
    };

    const formatList = (items: string[]) => {
        return items.length > 0 ? items.join(', ') : '-';
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('lbl_review_date')}</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Strengths</TableHead>
                        <TableHead>{t('lbl_areas_for_improvement')}</TableHead>
                        <TableHead>Goals</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews.map((review) => (
                        <TableRow key={review.id}>
                            <TableCell>
                                {format(new Date(review.review_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>{review.reviewer}</TableCell>
                            <TableCell>{getRatingBadge(review.rating)}</TableCell>
                            <TableCell>{getStatusBadge(review.status)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                                {formatList(review.strengths)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {formatList(review.areas_for_improvement)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {formatList(review.goals)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {review.notes || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {reviews.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No performance reviews found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

















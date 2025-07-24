import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    formatCurrency,
    Progress,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';
import { differenceInDays, format, isBefore } from 'date-fns';
import { Activity, AlertCircle, Calendar, CheckCircle, CircleDashed, Clock, FileText, Truck, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface RentalInfoCardProps {
    rental: {
        id: number;
        rental_number: string;
        status: string;
        start_date: string | null;
        expected_end_date: string | null;
        actual_end_date?: string | null;
        total_amount: number;
        quotation_id?: number | null;
        approved_at?: string | null;
        completed_at?: string | null;
        customer: {
            company_name: string;
        };
    };
}

const RentalInfoCard: React.FC<RentalInfoCardProps> = ({ rental }) => {
    const { t } = useTranslation('rental');

    // Calculate rental duration progress
    const calculateProgress = () => {
        if (!rental.start_date || !rental.expected_end_date) return 0;

        const startDate = new Date(rental.start_date);
        const expectedEndDate = new Date(rental.expected_end_date);
        const today = new Date();

        // If rental hasn't started yet
        if (isBefore(today, startDate)) return 0;

        const totalDuration = differenceInDays(expectedEndDate, startDate) || 1; // Avoid division by zero
        const elapsedDuration = differenceInDays(today, startDate);

        if (elapsedDuration < 0) return 0;
        if (elapsedDuration > totalDuration) return 100;

        return Math.round((elapsedDuration / totalDuration) * 100);
    };

    // Check if rental is nearing completion (within 3 days of expected end date)
    const isNearingCompletion = () => {
        if (!rental.expected_end_date || rental.status === 'completed') return false;

        const expectedEndDate = new Date(rental.expected_end_date);
        const today = new Date();
        const daysRemaining = differenceInDays(expectedEndDate, today);

        return daysRemaining >= 0 && daysRemaining <= 3;
    };

    // Get status badge with appropriate color and icon
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                                    <Activity className="h-3 w-3" />
                                    <span>Active</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('rental_is_currently_active_and_equipment_is_in_use')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'pending':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Pending</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('rental_is_pending_approval_or_activation')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'completed':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="flex items-center gap-1 border-green-400 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Completed</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('rental_has_been_successfully_completed')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'cancelled':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <X className="h-3 w-3" />
                                    <span>Cancelled</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('rental_has_been_cancelled')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'overdue':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="destructive" className="flex animate-pulse items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Overdue</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('rental_period_has_exceeded_the_expected_end_date')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'quotation':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="flex items-center gap-1 border-blue-400 text-blue-600">
                                    <FileText className="h-3 w-3" />
                                    <span>Quotation</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('quotation_has_been_generated_and_awaiting_customer')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case 'mobilization':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="flex items-center gap-1 border-orange-400 text-orange-600">
                                    <Truck className="h-3 w-3" />
                                    <span>Mobilization</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('equipment_is_being_mobilized_to_the_customer_locat')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            default:
                return (
                    <Badge variant="outline" className="flex items-center gap-1">
                        <CircleDashed className="h-3 w-3" />
                        <span>{status}</span>
                    </Badge>
                );
        }
    };

    // Get warning message if rental is nearing completion or overdue
    const getRentalWarningMessage = () => {
        if (rental.status === 'overdue') {
            return (
                <Alert variant="destructive" className="mt-4 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('ttl_rental_overdue')}</AlertTitle>
                    <AlertDescription>This rental has exceeded its expected end date. Please take action immediately.</AlertDescription>
                </Alert>
            );
        } else if (isNearingCompletion()) {
            return (
                <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('ttl_rental_ending_soon')}</AlertTitle>
                    <AlertDescription>This rental is scheduled to end within the next 3 days. Consider extending if needed.</AlertDescription>
                </Alert>
            );
        }

        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Rental #{rental.rental_number}
                            {getStatusBadge(rental.status)}
                        </CardTitle>
                        <CardDescription>{rental.customer?.company_name || 'Unknown Customer'}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">{t('lbl_start_date')}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {rental.start_date ? format(new Date(rental.start_date), 'PPP') : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">{t('expected_end_date')}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {rental.expected_end_date ? format(new Date(rental.expected_end_date), 'PPP') : 'Not set'}
                            </p>
                        </div>
                    </div>

                    {rental.status !== 'quotation' && (
                        <div>
                            <div className="mb-1 flex justify-between text-xs">
                                <span>{t('rental_progress')}</span>
                                <span>{calculateProgress()}%</span>
                            </div>
                            <Progress value={calculateProgress()} className="h-2" />
                        </div>
                    )}

                    {rental.actual_end_date && (
                        <div>
                            <p className="text-sm font-medium">{t('actual_end_date')}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(rental.actual_end_date), 'PPP')}
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium">{t('th_total_amount')}</p>
                        <p className="text-lg font-semibold">{formatCurrency(rental.total_amount)}</p>
                    </div>
                </div>

                {getRentalWarningMessage()}
            </CardContent>
        </Card>
    );
};

export default RentalInfoCard;

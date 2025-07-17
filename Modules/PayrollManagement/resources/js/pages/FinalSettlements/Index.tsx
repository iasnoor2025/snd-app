import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    usePermission,
} from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../../types';

interface Props extends PageProps {
    auth?: any;
    settlements: {
        data: Array<{
            id: number;
            employee: {
                id: number;
                employee_id: string;
                first_name: string;
                last_name: string;
            };
            last_working_day: string;
            total_payable: number;
            status: string;
            created_at: string;
            approved_by?: {
                id: number;
                name: string;
            };
            approved_at?: string;
        }>;
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters: {
        search: string;
        status: string;
        date_from: string;
        date_to: string;
    };
}

export default function Index({ auth, settlements, filters }: Props) {
    const { t } = useTranslation('payroll');

    const { hasPermission } = usePermission();

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            completed: 'default',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status}
            </Badge>
        );
    };

    return (
        <AppLayout title={t('ttl_final_settlements')} requiredPermission="final-settlements.view">
            <Head title={t('ttl_final_settlements')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('ttl_final_settlements')}</CardTitle>
                        {hasPermission() && (
                            <Button asChild>
                                <Link href={route('final-settlements.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Settlement
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder={t('ph_search_by_employee')}
                                        value={filters.search}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('search', e.target.value);
                                            window.location.href = url.toString();
                                        }}
                                    />
                                </div>
                                <div>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('status', value);
                                            window.location.href = url.toString();
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_filter_by_status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('opt_all_statuses')}</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        value={formatDateMedium(filters.date_from)}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('date_from', e.target.value);
                                            window.location.href = url.toString();
                                        }}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        value={formatDateMedium(filters.date_to)}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('date_to', e.target.value);
                                            window.location.href = url.toString();
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>{t('last_working_day')}</TableHead>
                                            <TableHead>{t('lbl_total_payable')}</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>{t('created_at')}</TableHead>
                                            <TableHead>{t('approved_by')}</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {settlements.data.map((settlement) => (
                                            <TableRow key={settlement.id}>
                                                <TableCell>
                                                    <Link
                                                        href={route('employees.show', settlement.employee.id)}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {settlement.employee.first_name} {settlement.employee.last_name}
                                                    </Link>
                                                    <div className="text-sm text-muted-foreground">{settlement.employee.employee_id}</div>
                                                </TableCell>
                                                <TableCell>{format(new Date(settlement.last_working_day), 'PPP')}</TableCell>
                                                <TableCell>SAR {settlement.total_payable.toFixed(2)}</TableCell>
                                                <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                                                <TableCell>{format(new Date(settlement.created_at), 'PPP')}</TableCell>
                                                <TableCell>
                                                    {settlement.approved_by ? (
                                                        <>
                                                            {settlement.approved_by.name}
                                                            <div className="text-sm text-muted-foreground">
                                                                {format(new Date(settlement.approved_at!), 'PPP')}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('payroll.final-settlements.show', settlement.id)}>
                                                            {t('employee:ttl_view_details')}
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {settlements.data.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">No settlements found.</p>
                                </div>
                            )}

                            {settlements.meta.total > settlements.meta.per_page && (
                                <div className="flex justify-center space-x-2">
                                    {Array.from({ length: settlements.meta.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button key={page} variant={page === settlements.meta.current_page ? 'default' : 'outline'} size="sm" asChild>
                                            <Link
                                                href={route('payroll.final-settlements.final-settlements.index', {
                                                    page,
                                                    ...filters,
                                                })}
                                            >
                                                {page}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

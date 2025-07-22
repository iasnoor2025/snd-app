import { AppLayout } from '@/Core';

import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/Core/Components/ui';

export default function SalaryAdvancesIndex({ advances }) {
    const { t } = useTranslation();

    const breadcrumbs = [{ title: t('PayrollManagement:pages.salary_advances'), href: route('salary-advances.index') }];

    return (
        <AppLayout title={t('PayrollManagement:pages.salary_advances')} breadcrumbs={breadcrumbs} requiredPermission="salary-advances.view">
            <Head title={t('PayrollManagement:pages.salary_advances')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">{t('PayrollManagement:pages.salary_advances')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        placeholder={t('PayrollManagement:placeholders.search_by_employee')}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder={t('PayrollManagement:placeholders.select_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('ui.placeholders.all')}</SelectItem>
                                        <SelectItem value="pending">{t('PayrollManagement:status.pending')}</SelectItem>
                                        <SelectItem value="approved">{t('PayrollManagement:status.approved')}</SelectItem>
                                        <SelectItem value="rejected">{t('PayrollManagement:status.rejected')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.employee')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.advance_amount')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.reason')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.payment_date')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.status')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('ui.labels.actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {advances.map((advance) => (
                                            <tr key={advance.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{advance.employee.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(advance.amount)}</td>
                                                <td className="px-6 py-4">{advance.reason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(advance.payment_date), 'PPP')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(advance.status)}`}
                                                    >
                                                        {t(`PayrollManagement:status.${advance.status.toLowerCase()}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        {advance.status === 'pending' && canApprove && (
                                                            <>
                                                                <Button
                                                                    onClick={() => approveAdvance(advance.id)}
                                                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                                                                >
                                                                    {t('PayrollManagement:actions.approve_advance')}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => rejectAdvance(advance.id)}
                                                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                                                                >
                                                                    {t('PayrollManagement:actions.reject_advance')}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {advances.length === 0 && (
                                <div className="py-4 text-center text-gray-500">{t('PayrollManagement:messages.no_records')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

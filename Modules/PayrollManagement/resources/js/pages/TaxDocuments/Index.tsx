import { AppLayout } from '@/Core';

import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/Core/components/ui';

export default function TaxDocumentsIndex({ documents }) {
    const { t } = useTranslation();

    const breadcrumbs = [{ title: t('PayrollManagement:pages.tax_documents'), href: route('tax-documents.index') }];

    return (
        <AppLayout title={t('PayrollManagement:pages.tax_documents')} breadcrumbs={breadcrumbs} requiredPermission="tax-documents.view">
            <Head title={t('PayrollManagement:pages.tax_documents')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">{t('PayrollManagement:pages.tax_documents')}</h2>
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
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder={t('PayrollManagement:placeholders.select_tax_year')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxYears.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
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
                                                {t('PayrollManagement:fields.document_type')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.document_number')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('PayrollManagement:fields.tax_year')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                {t('ui.labels.actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {documents.map((document) => (
                                            <tr key={document.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{document.employee.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{document.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{document.number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{document.tax_year}</td>
                                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => downloadDocument(document.id)}
                                                            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                                                        >
                                                            {t('PayrollManagement:actions.download_tax_document')}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {documents.length === 0 && (
                                <div className="py-4 text-center text-gray-500">{t('PayrollManagement:messages.no_records')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

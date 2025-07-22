
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/Core/components/ui';

export default function TaxDocumentForm({ onSubmit, initialData = {}, isSubmitting = false }) {
    const { t } = useTranslation();

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                    {t('PayrollManagement:fields.employee')}
                </label>
                <Controller
                    name="employee_id"
                    control={control}
                    defaultValue={initialData.employee_id}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('PayrollManagement:placeholders.select_employee')} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.employee_id && <p className="mt-1 text-sm text-red-600">{t('PayrollManagement:validation.required_employee')}</p>}
            </div>

            <div>
                <label htmlFor="tax_year" className="block text-sm font-medium text-gray-700">
                    {t('PayrollManagement:fields.tax_year')}
                </label>
                <Controller
                    name="tax_year"
                    control={control}
                    defaultValue={initialData.tax_year}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
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
                    )}
                />
                {errors.tax_year && <p className="mt-1 text-sm text-red-600">{t('PayrollManagement:validation.required_tax_year')}</p>}
            </div>

            <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                    {t('PayrollManagement:fields.document_type')}
                </label>
                <input
                    type="text"
                    {...register('document_type')}
                    defaultValue={initialData.document_type}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.document_type && <p className="mt-1 text-sm text-red-600">{t('PayrollManagement:validation.required_document_type')}</p>}
            </div>

            <div>
                <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">
                    {t('PayrollManagement:fields.document_number')}
                </label>
                <input
                    type="text"
                    {...register('document_number')}
                    defaultValue={initialData.document_number}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.document_number && <p className="mt-1 text-sm text-red-600">{t('PayrollManagement:validation.required_document_number')}</p>}
            </div>

            <div className="flex justify-end space-x-3">
                <Link href={route('tax-documents.index')} className={cn(buttonVariants({ variant: 'outline' }))}>
                    {t('ui.buttons.cancel')}
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                    {t('ui.buttons.save')}
                </Button>
            </div>
        </form>
    );
}

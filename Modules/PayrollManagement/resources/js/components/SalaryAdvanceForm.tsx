import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function SalaryAdvanceForm({ onSubmit, initialData = {}, isSubmitting = false }) {
  const { t } = useTranslation()

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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
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
        {errors.employee_id && (
          <p className="mt-1 text-sm text-red-600">
            {t('PayrollManagement:validation.required_employee')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          {t('PayrollManagement:fields.advance_amount')}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('amount')}
          defaultValue={initialData.amount}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('PayrollManagement:placeholders.enter_amount')}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">
            {t('PayrollManagement:validation.required_amount')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          {t('PayrollManagement:fields.reason')}
        </label>
        <textarea
          {...register('reason')}
          defaultValue={initialData.reason}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('PayrollManagement:placeholders.enter_reason')}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">
            {t('PayrollManagement:validation.required_reason')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
          {t('PayrollManagement:fields.payment_date')}
        </label>
        <input
          type="date"
          {...register('payment_date')}
          defaultValue={initialData.payment_date}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.payment_date && (
          <p className="mt-1 text-sm text-red-600">
            {t('PayrollManagement:validation.required_date')}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Link
          href={route('salary-advances.index')}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          {t('ui.buttons.cancel')}
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {t('ui.buttons.save')}
        </Button>
      </div>
    </form>
  )
}

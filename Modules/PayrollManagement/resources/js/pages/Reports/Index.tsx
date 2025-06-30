import { Head } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/Core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function PayrollReportsIndex() {
  const { t } = useTranslation()

  const breadcrumbs = [
    { title: t('PayrollManagement:pages.reports'), href: route('payroll.reports.index') }
  ]

  return (
    <AppLayout
      title={t('PayrollManagement:pages.reports')}
      breadcrumbs={breadcrumbs}
      requiredPermission="payroll.reports.view"
    >
      <Head title={t('PayrollManagement:pages.reports')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('PayrollManagement:pages.reports')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('PayrollManagement:placeholders.select_report_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payroll_summary">
                      {t('PayrollManagement:reports.payroll_summary')}
                    </SelectItem>
                    <SelectItem value="tax_summary">
                      {t('PayrollManagement:reports.tax_summary')}
                    </SelectItem>
                    <SelectItem value="advances_summary">
                      {t('PayrollManagement:reports.advances_summary')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={period}
                  onValueChange={setPeriod}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('PayrollManagement:placeholders.select_period')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {t('PayrollManagement:reports.monthly')}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t('PayrollManagement:reports.quarterly')}
                    </SelectItem>
                    <SelectItem value="yearly">
                      {t('PayrollManagement:reports.yearly')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={generateReport}
                  className={cn(buttonVariants({ variant: 'default' }))}
                >
                  {t('PayrollManagement:actions.generate_report')}
                </Button>
              </div>

              {reportData && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportColumns.map((column) => (
                          <th
                            key={column}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t(`PayrollManagement:reports.columns.${column}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((row, index) => (
                        <tr key={index}>
                          {reportColumns.map((column) => (
                            <td key={column} className="px-6 py-4 whitespace-nowrap">
                              {formatReportValue(row[column], column)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!reportData && (
                <div className="text-center py-4 text-gray-500">
                  {t('PayrollManagement:messages.select_report_options')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

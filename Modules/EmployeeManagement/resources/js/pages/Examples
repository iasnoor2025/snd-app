import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  iqama_number: string | null;
  iqama_expiry: string | null;
}

interface TableExampleProps {
  employees: Employee[];
}

const TableExample: React.FC<TableExampleProps> = ({ employees }) => {
  const { t, i18n } = useTranslation(['common', 'employees']);
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // Format date with localization
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('common:not_available');
    return format(new Date(dateString), 'PP', { locale: dateLocale });
  };

  // Handle sorting (example function)
  const handleSort = (column: string) => {
    console.log(`Sorting by ${column}`);
    // Implementation would depend on your state management approach
  };

  // Handle pagination (example function)
  const handlePageChange = (page: number) => {
    console.log(`Navigating to page ${page}`);
    // Implementation would depend on your state management approach
  };

  // Handle row click (example function)
  const handleRowClick = (employeeId: number) => {
    console.log(`Navigating to employee details for ID: ${employeeId}`);
    // Implementation would use your routing approach (e.g., Inertia.visit)
  };

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{t('employees:employees')}</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={t('common:search')}
            className="border rounded px-3 py-1 text-sm"
          />
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
            {t('common:add_new')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                {t('employees:full_name')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('position')}
              >
                {t('employees:position')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('department')}
              >
                {t('employees:department')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('hire_date')}
              >
                {t('employees:hire_date')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('iqama_expiry')}
              >
                {t('employees:iqama_expiry')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(employee.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${employee.first_name} ${employee.last_name}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.email || t('common:not_available')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.position || t('common:not_available')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.department || t('common:not_available')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.hire_date ? formatDate(employee.hire_date) : t('common:not_available')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.iqama_expiry ? (
                      <span className={
                        new Date(employee.iqama_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                          : "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      }>
                        {formatDate(employee.iqama_expiry)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">{t('common:not_available')}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  {t('common:no_records_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Example */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {t('common:showing')} <span className="font-medium">1</span> {t('common:to')} <span className="font-medium">10</span> {t('common:of')} <span className="font-medium">20</span> {t('common:results')}
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => handlePageChange(1)}
              >
                <span className="sr-only">{t('common:previous')}</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              <button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => handlePageChange(2)}
              >
                2
              </button>
              <button
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => handlePageChange(2)}
              >
                <span className="sr-only">{t('common:next')}</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExample;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

/**
 * Example component demonstrating how to convert the employee details section
 * from using getTranslation to react-i18next
 */
const EmployeeDetailsExample: React.FC<{ employee: any }> = ({ employee }) => {
  // Use the useTranslation hook to access translation functions
  const { t } = useTranslation(['common', 'employees']);

  // Example of language direction detection
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('employees:contact_info')}
        </h3>
        <dl className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <dt className="text-sm font-medium">{t('employees:full_name')}</dt>
            <dd className="text-sm">
              {employee.first_name} {employee.middle_name ? `${employee.middle_name} ` : ''}{employee.last_name}
            </dd>
          </div>
          <div className="flex justify-between border-b pb-2">
            <dt className="text-sm font-medium">{t('common:phone')}</dt>
            <dd className="text-sm">{employee.phone || t('employees:not_set')}</dd>
          </div>
          {employee.nationality && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:nationality')}</dt>
              <dd className="text-sm">{employee.nationality}</dd>
            </div>
          )}
          {employee.date_of_birth && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:date_of_birth')}</dt>
              <dd className="text-sm">{format(new Date(employee.date_of_birth), 'PPP')}</dd>
            </div>
          )}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('employees:identification')}
        </h3>
        <dl className="space-y-2">
          {employee.iqama_number && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:iqama_number')}</dt>
              <dd className="text-sm">{employee.iqama_number}</dd>
            </div>
          )}
          {employee.iqama_expiry && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:iqama_expiry')}</dt>
              <dd className="text-sm">{format(new Date(employee.iqama_expiry), 'PPP')}</dd>
            </div>
          )}
          {employee.passport_number && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:passport_number')}</dt>
              <dd className="text-sm">{employee.passport_number}</dd>
            </div>
          )}
          {employee.passport_expiry && (
            <div className="flex justify-between border-b pb-2">
              <dt className="text-sm font-medium">{t('employees:passport_expiry')}</dt>
              <dd className="text-sm">{format(new Date(employee.passport_expiry), 'PPP')}</dd>
            </div>
          )}
          {!employee.iqama_number && !employee.passport_number && !employee.date_of_birth && (
            <p className="text-sm text-muted-foreground italic">
              {t('employees:no_identification_info')}
            </p>
          )}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('employees:licenses')}
        </h3>
        {(employee.driving_license_number ||
          employee.operator_license_number ||
          employee.tuv_certification_number ||
          employee.spsp_license_number) ? (
          <dl className="space-y-2">
            {employee.driving_license_number && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-sm font-medium">{t('employees:driving_license')}</dt>
                <dd className="text-sm">{employee.driving_license_number}</dd>
              </div>
            )}
            {employee.driving_license_expiry && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-sm font-medium">{t('employees:driving_license_expiry')}</dt>
                <dd className="text-sm">{format(new Date(employee.driving_license_expiry), 'PPP')}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {t('employees:no_licenses_info')}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailsExample;





















